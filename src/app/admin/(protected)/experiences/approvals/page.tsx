import type { Metadata } from "next";
import { requirePermission } from "@/lib/require-user";
import { listAdminProducts } from "@/lib/data/admin/products";
import { PageHeader } from "@/components/admin/ui";
import { ApprovalQueueTable } from "./approval-queue";

export const metadata: Metadata = {
  title: "Experience Approvals | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function ExperienceApprovalsPage() {
  await requirePermission("catalog.manage", "/admin/experiences/approvals");
  const { items } = await listAdminProducts({ status: "pending_review", pageSize: 100 });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Experience Approvals"
        description="Review experiences submitted by suppliers before they go live on the public site."
      />
      <ApprovalQueueTable items={items} />
    </div>
  );
}
