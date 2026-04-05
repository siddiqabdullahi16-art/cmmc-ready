import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No organization found" }, { status: 404 });
  }

  const { data: orgMembers } = await supabase
    .from("org_members")
    .select("id, role, user_id")
    .eq("org_id", membership.org_id);

  if (!orgMembers) {
    return NextResponse.json({ members: [] });
  }

  const admin = getSupabaseAdmin();
  const membersWithEmail = await Promise.all(
    orgMembers.map(async (m) => {
      if (m.user_id === user.id) {
        return { ...m, user_email: user.email ?? "" };
      }
      const { data } = await admin.auth.admin.getUserById(m.user_id);
      return { ...m, user_email: data.user?.email ?? "" };
    })
  );

  return NextResponse.json({ members: membersWithEmail });
}
