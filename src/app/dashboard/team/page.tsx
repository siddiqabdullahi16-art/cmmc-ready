"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Member = {
  id: string;
  role: string;
  user_id: string;
  user_email?: string;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  created_at: string;
  expires_at: string;
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadInvitations = useCallback(async () => {
    const res = await fetch("/api/invites");
    if (res.ok) {
      const data = await res.json();
      setInvitations(data.invitations ?? []);
    }
  }, []);

  const loadTeam = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: membership } = await supabase
      .from("org_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .single();

    if (!membership) return;
    setOrgId(membership.org_id);
    setUserRole(membership.role);

    const { data: orgMembers } = await supabase
      .from("org_members")
      .select("id, role, user_id")
      .eq("org_id", membership.org_id);

    if (orgMembers) {
      setMembers(
        orgMembers.map((m) => ({
          ...m,
          user_email: m.user_id === user.id ? user.email ?? "You" : undefined,
        }))
      );
    }

    await loadInvitations();
    setLoading(false);
  }, [loadInvitations]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !orgId) return;
    setInviting(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to send invitation");
      setInviting(false);
      return;
    }

    setSuccess(`Invitation sent to ${email}`);
    setEmail("");
    setRole("member");
    setInviting(false);

    // Refresh invitations list
    await loadInvitations();
  }

  function copyInviteLink(inviteId: string) {
    const invitation = invitations.find((inv) => inv.id === inviteId);
    if (!invitation) return;

    const origin = window.location.origin;
    const link = `${origin}/auth/invite?token=${invitation.token}`;

    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(inviteId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const canInvite = userRole === "owner" || userRole === "admin";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--card-border)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold">
            <span className="text-[var(--primary)]">CMMC</span>-Ready
          </Link>
          <Link href="/dashboard" className="text-[var(--muted)] text-sm hover:text-white">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Team Management</h1>

        {/* Invite */}
        {canInvite && (
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 mb-8">
            <h2 className="font-semibold mb-4">Invite Team Member</h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg p-3 mb-4">
                {success}
              </div>
            )}

            <form onSubmit={inviteMember} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
                className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={inviting}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-2 rounded-lg text-sm transition disabled:opacity-50"
              >
                {inviting ? "Inviting..." : "Send Invite"}
              </button>
            </form>
          </div>
        )}

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 mb-8">
            <h2 className="font-semibold mb-4">
              Pending Invitations ({invitations.length})
            </h2>
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{inv.email}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {inv.role.charAt(0).toUpperCase() + inv.role.slice(1)} &middot; Expires{" "}
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-400">
                      pending
                    </span>
                    <button
                      onClick={() => copyInviteLink(inv.id)}
                      className="text-xs px-3 py-1 rounded bg-[var(--card-border)] hover:bg-[var(--muted)]/20 text-[var(--muted)] hover:text-white transition"
                      title="Copy invite link"
                    >
                      {copiedId === inv.id ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
          <h2 className="font-semibold mb-4">Team Members ({members.length})</h2>
          {loading ? (
            <p className="text-[var(--muted)] text-sm">Loading...</p>
          ) : members.length === 0 ? (
            <p className="text-[var(--muted)] text-sm">No team members found.</p>
          ) : (
            <div className="space-y-3">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
                >
                  <div>
                    <p className="text-sm">
                      {m.user_email || `User ${m.user_id.substring(0, 8)}...`}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      m.role === "owner"
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "bg-[var(--card-border)] text-[var(--muted)]"
                    }`}
                  >
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
