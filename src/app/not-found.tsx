import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] grid-bg flex items-center justify-center px-4">
      <div className="text-center">
        <Shield className="w-12 h-12 text-blue-500/30 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-white/10 mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-neutral-400 mb-8 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
