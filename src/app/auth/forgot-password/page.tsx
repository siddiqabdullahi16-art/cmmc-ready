"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
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
          <p className="text-neutral-400 mt-2">Reset your password</p>
        </div>

        <Card>
          <CardContent className="p-8">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-4">&#x2709;</div>
                <h3 className="text-xl font-bold mb-2">Check your email</h3>
                <p className="text-neutral-400 text-sm mb-6">
                  We sent a password reset link to <strong className="text-white">{email}</strong>.
                  Click the link to set a new password.
                </p>
                <p className="text-xs text-neutral-500">
                  Didn&apos;t receive it? Check your spam folder or{" "}
                  <button
                    onClick={() => setSent(false)}
                    className="text-blue-400 hover:text-blue-300 transition"
                  >
                    try again
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">
                    {error}
                  </div>
                )}

                <p className="text-sm text-neutral-400 mb-2">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

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

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <p className="text-center text-sm text-neutral-500">
                  Remember your password?{" "}
                  <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
