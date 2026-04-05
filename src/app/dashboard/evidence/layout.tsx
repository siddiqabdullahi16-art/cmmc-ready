import { requireActiveSubscription } from "@/lib/subscription";

export default async function EvidenceLayout({ children }: { children: React.ReactNode }) {
  await requireActiveSubscription();
  return <>{children}</>;
}
