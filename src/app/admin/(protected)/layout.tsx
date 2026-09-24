import { headers } from "next/headers";
import { requireAdmin } from "@/lib/require-user";
import { ToastProvider } from "@/components/admin/ui/toast";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "/admin";
  const staff = await requireAdmin(pathname);

  return (
    <ToastProvider>
      <AdminShell staff={staff}>
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
