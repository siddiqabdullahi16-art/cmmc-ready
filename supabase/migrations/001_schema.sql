-- =============================================================================
-- 001_schema.sql - CMMC-Ready Database Schema
-- =============================================================================

-- ---------- Helper: auto-update updated_at ----------
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================================
-- Tables
-- =============================================================================

-- Organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'trialing',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger organizations_updated_at
  before update on organizations
  for each row execute function update_updated_at();

-- Org members
create table org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

-- CMMC Domains (14 domains for CMMC 2.0)
create table cmmc_domains (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation text not null unique,
  sort_order integer not null,
  created_at timestamptz default now()
);

-- CMMC Controls
create table cmmc_controls (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references cmmc_domains(id) on delete cascade not null,
  control_id text not null unique,
  title text not null,
  description text not null,
  level integer not null check (level in (1, 2)),
  assessment_question text not null,
  remediation_guidance text not null,
  sort_order integer not null,
  created_at timestamptz default now()
);

-- Assessments
create table assessments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  target_level integer not null default 2,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger assessments_updated_at
  before update on assessments
  for each row execute function update_updated_at();

-- Assessment Responses
create table assessment_responses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id) on delete cascade not null,
  control_id uuid references cmmc_controls(id) on delete cascade not null,
  status text not null default 'not_assessed' check (status in ('met', 'not_met', 'partially_met', 'not_assessed')),
  notes text,
  updated_at timestamptz default now(),
  unique(assessment_id, control_id)
);

create trigger assessment_responses_updated_at
  before update on assessment_responses
  for each row execute function update_updated_at();

-- Evidence
create table evidence (
  id uuid primary key default gen_random_uuid(),
  response_id uuid references assessment_responses(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- =============================================================================
-- Indexes
-- =============================================================================

create index idx_org_members_org_id on org_members(org_id);
create index idx_org_members_user_id on org_members(user_id);
create index idx_cmmc_controls_domain_id on cmmc_controls(domain_id);
create index idx_assessments_org_id on assessments(org_id);
create index idx_assessment_responses_assessment_id on assessment_responses(assessment_id);
create index idx_assessment_responses_control_id on assessment_responses(control_id);
create index idx_evidence_response_id on evidence(response_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table organizations enable row level security;
alter table org_members enable row level security;
alter table cmmc_domains enable row level security;
alter table cmmc_controls enable row level security;
alter table assessments enable row level security;
alter table assessment_responses enable row level security;
alter table evidence enable row level security;

-- ---------- Helper: check org membership ----------
create or replace function is_org_member(check_org_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from org_members
    where org_id = check_org_id
      and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer stable;

-- ---------- Helper: check org admin/owner ----------
create or replace function is_org_admin(check_org_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from org_members
    where org_id = check_org_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
end;
$$ language plpgsql security definer stable;

-- ---------- organizations ----------
create policy "Members can read own org"
  on organizations for select
  using (is_org_member(id));

create policy "Admins can update own org"
  on organizations for update
  using (is_org_admin(id));

create policy "Authenticated users can create orgs"
  on organizations for insert
  with check (auth.uid() is not null);

-- ---------- org_members ----------
create policy "Members can read org members"
  on org_members for select
  using (is_org_member(org_id));

create policy "Admins can insert org members"
  on org_members for insert
  with check (is_org_admin(org_id));

create policy "Admins can delete org members"
  on org_members for delete
  using (is_org_admin(org_id));

-- Allow the org creator to insert themselves as owner
create policy "Users can insert themselves as owner"
  on org_members for insert
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and not exists (
      select 1 from org_members m where m.org_id = org_members.org_id
    )
  );

-- ---------- cmmc_domains ----------
create policy "Authenticated users can read domains"
  on cmmc_domains for select
  using (auth.uid() is not null);

-- ---------- cmmc_controls ----------
create policy "Authenticated users can read controls"
  on cmmc_controls for select
  using (auth.uid() is not null);

-- ---------- assessments ----------
create policy "Members can read org assessments"
  on assessments for select
  using (is_org_member(org_id));

create policy "Members can create org assessments"
  on assessments for insert
  with check (is_org_member(org_id));

create policy "Members can update org assessments"
  on assessments for update
  using (is_org_member(org_id));

create policy "Admins can delete org assessments"
  on assessments for delete
  using (is_org_admin(org_id));

-- ---------- assessment_responses ----------
create policy "Members can read responses"
  on assessment_responses for select
  using (
    exists (
      select 1 from assessments a
      where a.id = assessment_responses.assessment_id
        and is_org_member(a.org_id)
    )
  );

create policy "Members can insert responses"
  on assessment_responses for insert
  with check (
    exists (
      select 1 from assessments a
      where a.id = assessment_responses.assessment_id
        and is_org_member(a.org_id)
    )
  );

create policy "Members can update responses"
  on assessment_responses for update
  using (
    exists (
      select 1 from assessments a
      where a.id = assessment_responses.assessment_id
        and is_org_member(a.org_id)
    )
  );

create policy "Admins can delete responses"
  on assessment_responses for delete
  using (
    exists (
      select 1 from assessments a
      where a.id = assessment_responses.assessment_id
        and is_org_admin(a.org_id)
    )
  );

-- ---------- evidence ----------
create policy "Members can read evidence"
  on evidence for select
  using (
    exists (
      select 1 from assessment_responses ar
      join assessments a on a.id = ar.assessment_id
      where ar.id = evidence.response_id
        and is_org_member(a.org_id)
    )
  );

create policy "Members can upload evidence"
  on evidence for insert
  with check (
    exists (
      select 1 from assessment_responses ar
      join assessments a on a.id = ar.assessment_id
      where ar.id = evidence.response_id
        and is_org_member(a.org_id)
    )
  );

create policy "Members can update evidence"
  on evidence for update
  using (
    exists (
      select 1 from assessment_responses ar
      join assessments a on a.id = ar.assessment_id
      where ar.id = evidence.response_id
        and is_org_member(a.org_id)
    )
  );

create policy "Admins can delete evidence"
  on evidence for delete
  using (
    exists (
      select 1 from assessment_responses ar
      join assessments a on a.id = ar.assessment_id
      where ar.id = evidence.response_id
        and is_org_admin(a.org_id)
    )
  );
