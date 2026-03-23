"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui" }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
              An unexpected error occurred. Our team has been notified.
            </p>
            <button
              onClick={reset}
              style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
