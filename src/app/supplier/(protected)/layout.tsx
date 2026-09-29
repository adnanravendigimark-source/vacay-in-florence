import { headers } from "next/headers";
import { requireSupplier } from "@/lib/require-user";
import { getUnreadSupplierNotificationCount } from "@/lib/data/supplier/notifications";
import { ToastProvider } from "@/components/admin/ui/toast";
import { SupplierShell } from "@/components/supplier/supplier-shell";

// Every route under this group is gated by requireSupplier() — a fresh,
// server-side DB check on every request (no session, or a session for a
// non-approved supplier, redirects before any child page renders). This is
// the actual authorization boundary; the sidebar in SupplierShell is just
// navigation, not a gate. Mirrors src/app/admin/(protected)/layout.tsx
// exactly, including reading x-pathname (stamped by src/proxy.ts's
// matcher) so a logged-out visit to a deep supplier URL returns there
// after signing in, and reusing the same ToastProvider/toast primitives
// the admin panel already uses.
export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "/supplier/dashboard";
  const supplier = await requireSupplier(pathname);
  const unreadNotifications = await getUnreadSupplierNotificationCount(supplier.supplierId);

  return (
    <ToastProvider>
      <SupplierShell
        supplier={{ name: supplier.name, email: supplier.email, supplierName: supplier.supplierName }}
        unreadNotifications={unreadNotifications}
      >
        {children}
      </SupplierShell>
    </ToastProvider>
  );
}
