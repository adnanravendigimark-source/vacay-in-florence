import type { Metadata } from "next";
import Link from "next/link";
import { requireSupplier } from "@/lib/require-user";
import { listSupplierProducts } from "@/lib/data/supplier/experiences";
import { PageHeader, Badge, Button, Table, THead, TBody, TR, TH, TD } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "My Experiences",
  robots: { index: false, follow: false },
};

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  live: "success",
  pending_review: "warning",
  draft: "neutral",
  paused: "neutral",
  rejected: "danger",
  changes_requested: "warning",
};

const STATUS_LABEL: Record<string, string> = {
  live: "Published",
  pending_review: "Pending review",
  draft: "Draft",
  paused: "Paused",
  rejected: "Rejected",
  changes_requested: "Changes requested",
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function SupplierExperiencesPage() {
  const supplier = await requireSupplier("/supplier/experiences");
  const items = await listSupplierProducts(supplier.supplierId);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="My Experiences"
        description="Create, edit, and submit your experiences for admin review."
        actions={
          <Button href="/supplier/experiences/new" variant="primary" size="sm">
            + New Experience
          </Button>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#EAE6DF] bg-white p-10 text-center">
          <p className="text-sm text-neutral-500">You haven&apos;t created any experiences yet.</p>
          <Button href="/supplier/experiences/new" variant="primary" size="sm" className="mt-4">
            Create your first experience
          </Button>
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Experience</TH>
              <TH>Status</TH>
              <TH>Price from</TH>
              <TH>Submitted</TH>
              <TH>Last updated</TH>
              <TH>{""}</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((item) => (
              <TR key={item.id}>
                <TD>
                  <Link href={`/supplier/experiences/${item.id}`} className="font-medium text-neutral-900 hover:text-cypress hover:underline">
                    {item.title}
                  </Link>
                  {item.reviewNote && (item.status === "rejected" || item.status === "changes_requested") ? (
                    <p className="mt-1 text-xs text-amber-700">Admin note: {item.reviewNote}</p>
                  ) : null}
                </TD>
                <TD>
                  <Badge tone={STATUS_TONE[item.status] ?? "neutral"}>{STATUS_LABEL[item.status] ?? item.status}</Badge>
                </TD>
                <TD>{priceFormatter.format(item.priceFromAmount)}</TD>
                <TD>{item.submittedAt ? dateFormatter.format(item.submittedAt) : "—"}</TD>
                <TD>{dateFormatter.format(item.updatedAt)}</TD>
                <TD>
                  <Link href={`/supplier/experiences/${item.id}`} className="text-xs font-medium text-cypress hover:underline">
                    Edit
                  </Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
