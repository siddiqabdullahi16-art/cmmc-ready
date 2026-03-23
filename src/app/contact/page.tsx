"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Mail, MessageSquare, Clock } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send. Please try again.");
        setSending(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] grid-bg">
      <nav className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-xl font-bold"><span className="text-blue-500">CMMC</span>-Ready</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Get in Touch</h1>
          <p className="text-neutral-400">Have questions about CMMC compliance or our platform? We&apos;re here to help.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Email Support</h3>
              <p className="text-sm text-neutral-400">support@cmmcready.pro</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Response Time</h3>
              <p className="text-sm text-neutral-400">Within 24 hours (business days)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Enterprise Sales</h3>
              <p className="text-sm text-neutral-400">sales@cmmcready.pro</p>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8">
            {sent ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-xl font-bold mb-2">Message Sent</h3>
                <p className="text-neutral-400 text-sm">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Send us a message</h3>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Name</label>
                  <Input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Email</label>
                  <Input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Message</label>
                  <textarea
                    required
                    placeholder="How can we help?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 min-h-[120px] resize-y"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
