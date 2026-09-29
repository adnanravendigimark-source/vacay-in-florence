import "server-only";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export interface SupplierProductListItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  priceFromAmount: number;
  priceFromCurrency: string;
  submittedAt: Date | null;
  reviewNote: string | null;
  updatedAt: Date;
}

export async function listSupplierProducts(supplierId: string): Promise<SupplierProductListItem[]> {
  return db
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      status: products.status,
      priceFromAmount: products.priceFromAmount,
      priceFromCurrency: products.priceFromCurrency,
      submittedAt: products.submittedAt,
      reviewNote: products.reviewNote,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(eq(products.supplierId, supplierId))
    .orderBy(desc(products.updatedAt));
}

/**
 * The sole ownership check every supplier-facing product mutation/read must
 * pass — returns the real owning supplierId (or null) straight from the
 * DB, never trusting anything client-supplied. See
 * src/app/supplier/(protected)/experiences/actions.ts.
 */
export async function getProductOwnerSupplierId(productId: string): Promise<string | null> {
  const [row] = await db.select({ supplierId: products.supplierId }).from(products).where(eq(products.id, productId));
  return row?.supplierId ?? null;
}
