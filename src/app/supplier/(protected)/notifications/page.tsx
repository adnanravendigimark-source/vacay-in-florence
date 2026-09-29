import type { Metadata } from "next";
import { requireSupplier } from "@/lib/require-user";
import { listSupplierNotifications } from "@/lib/data/supplier/notifications";
import { PageHeader } from "@/components/admin/ui";
import { NotificationList } from "./notification-list";

export const metadata: Metadata = {
  title: "Notifications | Supplier",
  robots: { index: false, follow: false },
};

export default async function SupplierNotificationsPage() {
  const supplier = await requireSupplier("/supplier/notifications");
  const items = await listSupplierNotifications(supplier.supplierId);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader title="Notifications" description="Updates on your application, experiences, bookings, and payouts." />
      <NotificationList items={items} />
    </div>
  );
}
