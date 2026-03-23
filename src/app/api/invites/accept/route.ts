import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const token = body.token?.trim();

  if (!token) {
    return NextResponse.json({ error: "Invite token is required" }, { status: 400 });
  }

  // Use admin client to bypass RLS for invitation lookup
  // (the accepting user is not yet a member of the org, so RLS would block them)
  const admin = getSupabaseAdmin();

  const { data: invitation, error: lookupError } = await admin
    .from("invitations")
    .select("id, org_id, email, role, status, expires_at")
    .eq("token", token)
    .single();

  if (lookupError || !invitation) {
    return NextResponse.json(
      { error: "Invalid or unknown invitation token" },
      { status: 404 }
    );
  }

  if (invitation.status !== "pending") {
    return NextResponse.json(
      { error: `This invitation has already been ${invitation.status}` },
      { status: 410 }
    );
  }

  // Check expiration
  const expiresAt = new Date(invitation.expires_at);
  if (expiresAt < new Date()) {
    // Mark as expired
    await admin
      .from("invitations")
      .update({ status: "expired" })
      .eq("id", invitation.id);

    return NextResponse.json(
      { error: "This invitation has expired" },
      { status: 410 }
    );
  }

  // Verify the accepting user's email matches the invitation
  const userEmail = user.email?.toLowerCase();
  if (userEmail !== invitation.email.toLowerCase()) {
    return NextResponse.json(
      {
        error: `This invitation was sent to ${invitation.email}. Please sign in with that email address.`,
      },
      { status: 403 }
    );
  }

  // Check if user is already a member of this org
  const { data: existingMember } = await admin
    .from("org_members")
    .select("id")
    .eq("org_id", invitation.org_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMember) {
    // Mark invitation as accepted anyway
    await admin
      .from("invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);

    return NextResponse.json({
      message: "You are already a member of this organization",
    });
  }

  // Add user to the org
  const { error: insertError } = await admin
    .from("org_members")
    .insert({
      org_id: invitation.org_id,
      user_id: user.id,
      role: invitation.role,
    });

  if (insertError) {
    console.error("Failed to add member:", insertError);
    return NextResponse.json(
      { error: "Failed to join organization" },
      { status: 500 }
    );
  }

  // Mark invitation as accepted
  const { error: updateError } = await admin
    .from("invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  if (updateError) {
    console.error("Failed to update invitation status:", updateError);
  }

  return NextResponse.json({
    message: "You have successfully joined the organization",
  });
}
