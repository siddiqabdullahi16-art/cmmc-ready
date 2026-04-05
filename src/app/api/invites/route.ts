import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { email?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const role = body.role ?? "member";

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }

  if (!["admin", "member"].includes(role)) {
    return NextResponse.json({ error: "Role must be admin or member" }, { status: 400 });
  }

  // Verify the user is an owner or admin of their org
  const { data: membership, error: memberError } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  if (memberError || !membership) {
    return NextResponse.json(
      { error: "You must belong to an organization" },
      { status: 403 }
    );
  }

  if (!["owner", "admin"].includes(membership.role)) {
    return NextResponse.json(
      { error: "Only owners and admins can invite members" },
      { status: 403 }
    );
  }

  const orgId = membership.org_id;

  // Check if this email already has a pending invite for this org
  const { data: existingInvite } = await supabase
    .from("invitations")
    .select("id")
    .eq("org_id", orgId)
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvite) {
    return NextResponse.json(
      { error: "A pending invitation already exists for this email" },
      { status: 409 }
    );
  }

  // Check if user is already a member (look up by email via admin client)
  const admin = getSupabaseAdmin();
  const { data: existingUserData } = await admin.auth.admin.getUserByEmail(email);
  const existingUser = existingUserData?.user ?? null;

  if (existingUser?.id) {
    const { data: existingMember } = await supabase
      .from("org_members")
      .select("id")
      .eq("org_id", orgId)
      .eq("user_id", existingUser.id)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json(
        { error: "This user is already a member of your organization" },
        { status: 409 }
      );
    }
  }

  // Generate a secure token and create the invitation
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { data: invitation, error: insertError } = await supabase
    .from("invitations")
    .insert({
      org_id: orgId,
      email,
      role,
      token,
      invited_by: user.id,
      expires_at: expiresAt,
    })
    .select("id, email, role, token, created_at, expires_at")
    .single();

  if (insertError) {
    console.error("Failed to create invitation:", insertError);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }

  const origin = request.headers.get("origin") || "https://cmmcready.pro";
  const inviteLink = `${origin}/auth/invite?token=${token}`;

  return NextResponse.json({
    invitation: { ...invitation, invite_link: inviteLink },
  });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's org
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json(
      { error: "You must belong to an organization" },
      { status: 403 }
    );
  }

  const { data: invitations, error } = await supabase
    .from("invitations")
    .select("id, email, role, status, token, created_at, expires_at")
    .eq("org_id", membership.org_id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }

  return NextResponse.json({ invitations: invitations ?? [] });
}
