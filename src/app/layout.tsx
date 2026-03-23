import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://cmmcready.pro"),
  title: {
    default: "CMMC-Ready | CMMC Compliance Self-Assessment Platform",
    template: "%s | CMMC-Ready",
  },
  description:
    "The #1 self-service CMMC compliance platform for defense contractors. Guided self-assessment, gap analysis, evidence tracking, and audit-ready reports. Start your free 14-day trial.",
  keywords: [
    "CMMC compliance",
    "CMMC certification",
    "CMMC 2.0",
    "CMMC self-assessment",
    "CMMC Level 2",
    "NIST 800-171",
    "defense contractor compliance",
    "CUI protection",
    "CMMC gap analysis",
    "System Security Plan",
    "POA&M",
    "C3PAO assessment",
    "DFARS compliance",
    "cybersecurity maturity model",
  ],
  authors: [{ name: "CMMC-Ready" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cmmcready.pro",
    siteName: "CMMC-Ready",
    title: "CMMC-Ready | Get CMMC Certified Without the Complexity",
    description:
      "Self-service CMMC compliance platform for defense contractors. Assess gaps, track remediation, and generate audit-ready reports.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CMMC-Ready Compliance Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CMMC-Ready | CMMC Compliance Made Simple",
    description:
      "The self-service platform that guides defense contractors through CMMC compliance.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://cmmcready.pro" />
      </head>
      <body>
          <PostHogProvider>{children}</PostHogProvider>
        </body>
    </html>
  );
}
