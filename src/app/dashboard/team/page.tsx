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

    const res = await fetch("/api/team/members");
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members ?? []);
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
    <div className="min-h-screen dashboard-bg">
      <nav className="sticky top-0 z-20 backdrop-blur-xl bg-[rgba(10,14,26,0.7)] border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-base font-bold text-white">
              CMMC<span className="gradient-text-blue">-Ready</span>
            </span>
          </Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero header */}
        <div className="mesh-hero p-7 mb-6">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 w-fit mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Workspace
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
              Team <span className="gradient-text-blue">Management</span>
            </h1>
            <p className="text-slate-400 text-sm">
              {members.length} member{members.length !== 1 ? "s" : ""} · {invitations.length} pending invitation{invitations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Invite */}
        {canInvite && (
          <div className="glass-card p-6 mb-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
              Invite Team Member
            </h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg p-3 mb-4">
                {success}
              </div>
            )}

            <form onSubmit={inviteMember} className="flex gap-3 flex-wrap">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
                className="flex-1 min-w-[220px] bg-[#0f1524] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-[#0f1524] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={inviting}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {inviting ? "Inviting..." : "Send Invite"}
              </button>
            </form>
          </div>
        )}

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h2 className="font-semibold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
                Pending Invitations
              </span>
              <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                {invitations.length}
              </span>
            </h2>
            <div className="space-y-2">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{inv.email}</p>
                    <p className="text-xs text-slate-500">
                      {inv.role.charAt(0).toUpperCase() + inv.role.slice(1)} · Expires {new Date(inv.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => copyInviteLink(inv.id)}
                    className="text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all font-medium"
                  >
                    {copiedId === inv.id ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
              Team Members
            </span>
            <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {members.length}
            </span>
          </h2>
          {loading ? (
            <p className="text-slate-400 text-sm">Loading...</p>
          ) : members.length === 0 ? (
            <p className="text-slate-400 text-sm">No team members found.</p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => {
                const displayName = m.user_email || `User ${m.user_id.substring(0, 8)}`;
                const initial = (displayName[0] || "U").toUpperCase();
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0 text-xs font-semibold text-slate-200">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{displayName}</p>
                      <p className="text-xs text-slate-500">{m.role.charAt(0).toUpperCase() + m.role.slice(1)}</p>
                    </div>
                    <span
                      className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                        m.role === "owner"
                          ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                          : "bg-white/5 text-slate-400 border-white/10"
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
