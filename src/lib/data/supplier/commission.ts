import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { suppliers, platformSettings } from "@/lib/db/schema";

const DEFAULT_COMMISSION_RATE = 0.15;

/**
 * A supplier's effective platform commission rate: their own
 * `commissionRateOverride` when set, otherwise the global
 * `platform_settings.default_commission_rate` row (seeded at 0.15 — see
 * Phase 1's schema push), falling back to the hardcoded default only if
 * that row is somehow missing. Shared by the dashboard and financials data
 * layers so "earnings" is computed identically everywhere it's shown.
 */
export async function getEffectiveCommissionRate(supplierId: string): Promise<number> {
  const [supplier] = await db
    .select({ commissionRateOverride: suppliers.commissionRateOverride })
    .from(suppliers)
    .where(eq(suppliers.id, supplierId));

  if (supplier?.commissionRateOverride != null) {
    return supplier.commissionRateOverride;
  }

  const [setting] = await db
    .select({ value: platformSettings.value })
    .from(platformSettings)
    .where(eq(platformSettings.key, "default_commission_rate"));

  const parsed = setting ? Number.parseFloat(setting.value) : NaN;
  return Number.isFinite(parsed) ? parsed : DEFAULT_COMMISSION_RATE;
}
