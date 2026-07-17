import { AdminShell } from "@/components/admin-shell";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["ADMIN", "THERAPIST"]);
  return <AdminShell user={user}>{children}</AdminShell>;
}
