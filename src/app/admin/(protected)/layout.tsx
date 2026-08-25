import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  // Defence in depth: middleware already guards /admin, this re-verifies.
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
