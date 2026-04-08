"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { org_name: orgName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If session exists, email auto-confirmed — go straight to onboarding
    if (data.session) {
      router.push("/onboarding");
      return;
    }

    // No session = email confirmation required
    setConfirmEmail(true);
    setLoading(false);
  }

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
          <p className="text-neutral-400 mt-2">Create your account</p>
        </div>

        {confirmEmail ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-neutral-400 text-sm mb-1">
                We sent a confirmation link to
              </p>
              <p className="text-white font-medium mb-4">{email}</p>
              <p className="text-neutral-500 text-xs mb-6">
                Click the link in the email to confirm your account, then come back and sign in.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Go to Sign In
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Organization Name</label>
                <Input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  placeholder="Acme Defense Corp"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Work Email</label>
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
                  minLength={12}
                  placeholder="Min 12 characters"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <div className="space-y-2 pt-2">
                {["14-day free trial", "No charge until day 15", "Cancel anytime"].map((text) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    {text}
                  </div>
                ))}
              </div>

              <p className="text-center text-sm text-neutral-500">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
