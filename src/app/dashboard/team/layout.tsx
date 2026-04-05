import { requireActiveSubscription } from "@/lib/subscription";

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  await requireActiveSubscription();
  return <>{children}</>;
}
