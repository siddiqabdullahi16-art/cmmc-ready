"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type Status = "loading" | "accepting" | "accepted" | "login-required" | "error";

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Signup form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  const acceptInvite = useCallback(async () => {
    setStatus("accepting");

    const res = await fetch("/api/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMessage(data.error || "Failed to accept invitation");
      setStatus("error");
      return;
    }

    setStatus("accepted");
    setTimeout(() => router.push("/dashboard"), 2000);
  }, [token, router]);

  useEffect(() => {
    if (!token) {
      setErrorMessage("No invitation token provided");
      setStatus("error");
      return;
    }

    async function checkAuthAndAccept() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await acceptInvite();
      } else {
        setStatus("login-required");
      }
    }

    checkAuthAndAccept();
  }, [token, acceptInvite]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError("");
    setSignupLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setSignupError(error.message);
      setSignupLoading(false);
      return;
    }

    // After signup, try to accept the invite
    await acceptInvite();
    setSignupLoading(false);
  }

  function handleLoginRedirect() {
    if (token) {
      sessionStorage.setItem("pending_invite_token", token);
    }
    router.push(`/auth/login?redirect=/auth/invite?token=${token}`);
  }

  if (!token) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-400">Invalid invitation link. No token provided.</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300 mt-4 inline-block text-sm">
            Go to homepage
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-8">
        {status === "loading" && (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400 text-sm">Checking invitation...</p>
          </div>
        )}

        {status === "accepting" && (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400 text-sm">Accepting invitation...</p>
          </div>
        )}

        {status === "accepted" && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-semibold text-lg mb-2">Invitation Accepted</h2>
            <p className="text-neutral-400 text-sm">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="font-semibold text-lg mb-2">Invitation Error</h2>
            <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === "login-required" && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="font-semibold text-lg mb-1">You&apos;ve been invited</h2>
              <p className="text-neutral-400 text-sm">
                Sign in or create an account to join the team.
              </p>
            </div>

            <Button onClick={handleLoginRedirect} className="w-full">
              Sign In with Existing Account
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--card-border)]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[var(--card)] px-2 text-neutral-500">
                  or create a new account
                </span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-3">
              {signupError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">
                  {signupError}
                </div>
              )}
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                />
              </div>
              <Button type="submit" disabled={signupLoading} className="w-full" variant="outline">
                {signupLoading ? "Creating account..." : "Create Account & Join"}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InviteLoading() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-400 text-sm">Loading...</p>
      </CardContent>
    </Card>
  );
}

export default function InvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 grid-bg">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            <span className="text-2xl font-bold">
              <span className="text-blue-500">CMMC</span>-Ready
            </span>
          </Link>
          <p className="text-neutral-400 mt-2">Team Invitation</p>
        </div>

        <Suspense fallback={<InviteLoading />}>
          <InviteContent />
        </Suspense>
      </div>
    </div>
  );
}
