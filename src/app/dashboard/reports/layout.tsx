import { requireActiveSubscription } from "@/lib/subscription";

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  await requireActiveSubscription();
  return <>{children}</>;
}
