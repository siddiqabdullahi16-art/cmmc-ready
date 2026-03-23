-- =============================================================================
-- 003_storage.sql - Evidence file storage bucket and policies
-- =============================================================================

-- Create storage bucket for evidence files
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can upload evidence"
  on storage.objects for insert
  with check (
    bucket_id = 'evidence'
    and auth.role() = 'authenticated'
  );

create policy "Users can read own evidence"
  on storage.objects for select
  using (
    bucket_id = 'evidence'
    and auth.role() = 'authenticated'
  );

create policy "Users can delete own evidence"
  on storage.objects for delete
  using (
    bucket_id = 'evidence'
    and auth.role() = 'authenticated'
  );
