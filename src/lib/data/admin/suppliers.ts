import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  suppliers,
  leadSubmissions,
  products,
  productImages,
  productOptions,
  categories,
  orders,
  orderItems,
  auditLogs,
  supplierPayouts,
  supplierNotifications,
} from "@/lib/db/schema";

export type SupplierStatus = "pending" | "approved" | "rejected" | "suspended";

export interface MutationResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface AdminSupplierListItem {
  id: string;
  name: string;
  companyName: string;
  slug: string;
  status: SupplierStatus;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string | null;
  countryCode: string;
  city: string | null;
  companyCategory: string;
  logoUrl: string | null;
  commissionRateOverride: number | null;
  experiencesCount: number;
  bookingsCount: number;
  createdAt: Date;
}

export interface AdminSupplierDetail extends AdminSupplierListItem {
  website: string | null;
  taxId: string | null;
  notes: string | null;
  about: string | null;
  businessType: string | null;
  businessAddress: string | null;
  city: string | null;
  postalCode: string | null;
}

export interface PendingSupplierApplication {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  website: string | null;
  experienceType: string | null;
  createdAt: Date;
}

export interface SupplierStatsSummary {
  total: number;
  totalTrend: { text: string; isPositive: boolean; isNeutral?: boolean };
  pending: number;
  pendingTrend: { text: string; isPositive: boolean; isNeutral?: boolean };
  approved: number;
  approvedTrend: { text: string; isPositive: boolean; isNeutral?: boolean };
  rejected: number;
  rejectedTrend: { text: string; isPositive: boolean; isNeutral?: boolean };
  suspended: number;
  suspendedTrend: { text: string; isPositive: boolean; isNeutral?: boolean };
}

export interface SupplierExperienceItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  imageUrl: string;
  categoryName: string;
  bookingsCount: number;
  revenue: number;
  priceAmount: number;
}

export interface SupplierBookingItem {
  orderId: string;
  productTitle: string;
  customerName: string;
  customerEmail: string;
  date: string;
  subtotalAmount: number;
  status: string;
  currency: string;
  createdAt: Date;
}

export interface SupplierActivityItem {
  id: string;
  title: string;
  dateStr: string;
  type: "experience_submitted" | "booking_received" | "profile_updated" | "experience_approved" | "status_change";
}

export interface SupplierDocumentItem {
  id: string;
  title: string;
  filename: string;
  fileSize?: string;
  uploadedAt?: string;
  url: string;
}

export interface AdminSupplierFullProfile {
  supplier: AdminSupplierDetail & {
    supplierCode: string;
    address: string;
    yearEstablished: string;
    heroImageUrl: string;
    description: string;
    categoryTags: string[];
    timeline: {
      submittedAt: Date | string;
      reviewedAt?: Date | string;
      approvedAt?: Date | string;
    };
    documents: SupplierDocumentItem[];
  };
  quickStats: {
    totalExperiences: number;
    totalBookings: number;
    totalEarnings: number;
    pendingPayouts: number;
    commissionRate: number;
  };
  experiences: SupplierExperienceItem[];
  bookings: SupplierBookingItem[];
  activities: SupplierActivityItem[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "supplier";
  let candidate = root;
  let n = 1;
  while (true) {
    const [existing] = await db.select({ id: suppliers.id }).from(suppliers).where(eq(suppliers.slug, candidate));
    if (!existing) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

function resolveCompanyCategory(name: string, about?: string | null, notes?: string | null): string {
  const lower = `${name} ${about || ""} ${notes || ""}`.toLowerCase();
  if (lower.includes("boat") || lower.includes("sailing") || lower.includes("cruise") || lower.includes("coast")) return "Boat Tours";
  if (lower.includes("wine") || lower.includes("chianti") || lower.includes("food") || lower.includes("tasting") || lower.includes("cucina") || lower.includes("cooking")) return "Wine & Food Tours";
  if (lower.includes("museum") || lower.includes("gallery") || lower.includes("uffizi") || lower.includes("accademia") || lower.includes("pitti") || lower.includes("duomo")) return "Museum Tours";
  if (lower.includes("outdoor") || lower.includes("culture") || lower.includes("cultural") || lower.includes("tuscan")) return "Outdoor & Cultural Tours";
  if (lower.includes("adventure") || lower.includes("bike") || lower.includes("hiking") || lower.includes("siena")) return "Adventure Tours";
  if (lower.includes("day trip") || lower.includes("pisa") || lower.includes("excursion")) return "Day Trips";
  if (lower.includes("walking") || lower.includes("heritage")) return "Walking & City Tours";
  return "Tour Operator";
}

function resolveCountryInfo(country: string | null): { name: string; code: string } {
  if (!country || country.trim().toLowerCase() === "italy" || country.trim().toLowerCase() === "it" || country.trim().toLowerCase() === "italia") {
    return { name: "Italy", code: "IT" };
  }
  const c = country.trim();
  if (c.toLowerCase() === "france" || c.toLowerCase() === "fr") return { name: "France", code: "FR" };
  if (c.toLowerCase() === "united states" || c.toLowerCase() === "usa" || c.toLowerCase() === "us") return { name: "United States", code: "US" };
  if (c.toLowerCase() === "united kingdom" || c.toLowerCase() === "uk" || c.toLowerCase() === "gb") return { name: "United Kingdom", code: "GB" };
  if (c.toLowerCase() === "spain" || c.toLowerCase() === "es") return { name: "Spain", code: "ES" };
  if (c.toLowerCase() === "germany" || c.toLowerCase() === "de") return { name: "Germany", code: "DE" };
  return { name: c, code: c.substring(0, 2).toUpperCase() };
}

export async function listAdminSuppliers(): Promise<AdminSupplierListItem[]> {
  const rows = await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));

  const productRows = await db
    .select({
      id: products.id,
      supplierId: products.supplierId,
    })
    .from(products);

  const productCountMap = new Map<string, number>();
  const productIdsMap = new Map<string, string[]>();

  for (const p of productRows) {
    if (p.supplierId) {
      productCountMap.set(p.supplierId, (productCountMap.get(p.supplierId) || 0) + 1);
      const list = productIdsMap.get(p.supplierId) || [];
      list.push(p.id);
      productIdsMap.set(p.supplierId, list);
    }
  }

  const orderItemRows = await db
    .select({
      productId: orderItems.productId,
    })
    .from(orderItems);

  const bookingsCountByProduct = new Map<string, number>();
  for (const item of orderItemRows) {
    if (item.productId) {
      bookingsCountByProduct.set(item.productId, (bookingsCountByProduct.get(item.productId) || 0) + 1);
    }
  }

  return rows.map((r) => {
    const sId = r.id;
    const expCount = productCountMap.get(sId) || 0;
    const prodIds = productIdsMap.get(sId) || [];
    let bookingsCount = 0;
    for (const pid of prodIds) {
      bookingsCount += bookingsCountByProduct.get(pid) || 0;
    }

    const countryInfo = resolveCountryInfo(r.country);
    const category = resolveCompanyCategory(r.name, r.about, r.notes);

    return {
      id: r.id,
      name: r.name,
      companyName: r.name,
      slug: r.slug,
      status: (r.status as SupplierStatus) || "approved",
      contactName: r.contactName,
      contactEmail: r.contactEmail,
      contactPhone: r.contactPhone,
      country: countryInfo.name,
      countryCode: countryInfo.code,
      city: r.city || null,
      companyCategory: category,
      logoUrl: r.logoUrl,
      commissionRateOverride: r.commissionRateOverride,
      experiencesCount: expCount,
      bookingsCount: bookingsCount,
      createdAt: r.createdAt,
    };
  });
}

export async function getAdminSupplierStats(): Promise<SupplierStatsSummary> {
  const rows = await db.select().from(suppliers);
  const total = rows.length;
  let pending = 0;
  let approved = 0;
  let rejected = 0;
  let suspended = 0;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  let totalRecent = 0;
  let totalPrev = 0;
  let pendingRecent = 0;
  let pendingPrev = 0;
  let approvedRecent = 0;
  let approvedPrev = 0;
  let rejectedRecent = 0;
  let rejectedPrev = 0;
  let suspendedRecent = 0;
  let suspendedPrev = 0;

  for (const r of rows) {
    const st = r.status as SupplierStatus;
    if (st === "pending") pending++;
    else if (st === "approved") approved++;
    else if (st === "rejected") rejected++;
    else if (st === "suspended") suspended++;

    const created = new Date(r.createdAt);
    const isRecent = created >= thirtyDaysAgo;
    const isPrev = created >= sixtyDaysAgo && created < thirtyDaysAgo;

    if (isRecent) {
      totalRecent++;
      if (st === "pending") pendingRecent++;
      else if (st === "approved") approvedRecent++;
      else if (st === "rejected") rejectedRecent++;
      else if (st === "suspended") suspendedRecent++;
    } else if (isPrev) {
      totalPrev++;
      if (st === "pending") pendingPrev++;
      else if (st === "approved") approvedPrev++;
      else if (st === "rejected") rejectedPrev++;
      else if (st === "suspended") suspendedPrev++;
    }
  }

  const computeTrend = (curr: number, prev: number) => {
    if (prev === 0) {
      if (curr === 0) return { text: "→ 0%", isPositive: true, isNeutral: true };
      return { text: `↑ +${curr}`, isPositive: true };
    }
    const pct = Math.round(((curr - prev) / prev) * 100);
    if (pct > 0) return { text: `↑ ${pct}%`, isPositive: true };
    if (pct < 0) return { text: `↓ ${Math.abs(pct)}%`, isPositive: false };
    return { text: "→ 0%", isPositive: true, isNeutral: true };
  };

  return {
    total,
    totalTrend: computeTrend(totalRecent, totalPrev),
    pending,
    pendingTrend: computeTrend(pendingRecent, pendingPrev),
    approved,
    approvedTrend: computeTrend(approvedRecent, approvedPrev),
    rejected,
    rejectedTrend: computeTrend(rejectedRecent, rejectedPrev),
    suspended,
    suspendedTrend: computeTrend(suspendedRecent, suspendedPrev),
  };
}

export async function getAdminSupplierById(id: string): Promise<AdminSupplierDetail | null> {
  const [row] = await db.select().from(suppliers).where(eq(suppliers.id, id));
  if (!row) return null;

  const productRows = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.supplierId, id));

  const countryInfo = resolveCountryInfo(row.country);
  // A real, applicant-provided business type (from the self-registration
  // wizard) always wins over the keyword-guessed fallback.
  const category = row.businessType || resolveCompanyCategory(row.name, row.about, row.notes);

  return {
    id: row.id,
    name: row.name,
    companyName: row.name,
    slug: row.slug,
    status: (row.status as SupplierStatus) || "approved",
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    website: row.website,
    taxId: row.taxId,
    country: countryInfo.name,
    countryCode: countryInfo.code,
    companyCategory: category,
    logoUrl: row.logoUrl,
    commissionRateOverride: row.commissionRateOverride,
    notes: row.notes,
    about: row.about,
    businessType: row.businessType,
    businessAddress: row.businessAddress,
    city: row.city,
    postalCode: row.postalCode,
    experiencesCount: productRows.length,
    bookingsCount: 0,
    createdAt: row.createdAt,
  };
}

export async function getAdminSupplierFullProfile(id: string): Promise<AdminSupplierFullProfile | null> {
  const [row] = await db.select().from(suppliers).where(eq(suppliers.id, id));
  if (!row) return null;

  const countryInfo = resolveCountryInfo(row.country);
  const category = row.businessType || resolveCompanyCategory(row.name, row.about, row.notes);

  // Products belonging to this supplier
  const productRows = await db
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      status: products.status,
      shortDescription: products.shortDescription,
      categoryId: products.categoryId,
      updatedAt: products.updatedAt,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(eq(products.supplierId, id));

  const productIds = productRows.map((p) => p.id);

  // Product images from DB
  const imagesMap = new Map<string, string>();
  if (productIds.length > 0) {
    const imgRows = await db
      .select({ productId: productImages.productId, url: productImages.url })
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(productImages.sortOrder);
    for (const img of imgRows) {
      if (!imagesMap.has(img.productId)) {
        imagesMap.set(img.productId, img.url);
      }
    }
  }

  // Product base prices from DB productOptions
  const pricesMap = new Map<string, number>();
  if (productIds.length > 0) {
    const optRows = await db
      .select({ productId: productOptions.productId, priceAmount: productOptions.priceAmount })
      .from(productOptions)
      .where(inArray(productOptions.productId, productIds));
    for (const opt of optRows) {
      if (!pricesMap.has(opt.productId)) {
        pricesMap.set(opt.productId, opt.priceAmount);
      }
    }
  }

  // Categories map from DB
  const catRows = await db.select({ id: categories.id, name: categories.name }).from(categories);
  const catMap = new Map(catRows.map((c) => [c.id, c.name]));

  // Bookings / Order items from DB
  let bookingRows: {
    orderId: string;
    productTitle: string;
    productId: string;
    date: string;
    customerName: string;
    customerEmail: string;
    status: string;
    subtotalAmount: number;
    currency: string;
    createdAt: Date;
  }[] = [];

  if (productIds.length > 0) {
    bookingRows = await db
      .select({
        orderId: orders.id,
        productTitle: orderItems.productTitle,
        productId: orderItems.productId,
        date: orderItems.date,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        status: orders.status,
        subtotalAmount: orderItems.subtotalAmount,
        currency: orderItems.currency,
        createdAt: orders.createdAt,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(inArray(orderItems.productId, productIds))
      .orderBy(desc(orders.createdAt));
  }

  // Supplier Payouts from DB
  const payoutRows = await db
    .select({
      id: supplierPayouts.id,
      amount: supplierPayouts.amount,
      status: supplierPayouts.status,
      paidAt: supplierPayouts.paidAt,
      createdAt: supplierPayouts.createdAt,
    })
    .from(supplierPayouts)
    .where(eq(supplierPayouts.supplierId, id));

  const totalPaidOut = payoutRows
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  // Compute real DB stats
  const totalExperiences = productRows.length;
  const totalBookings = bookingRows.length;

  const commissionRate = row.commissionRateOverride ?? 20;

  const confirmedBookingRows = bookingRows.filter(
    (b) => b.status === "confirmed" || b.status === "completed" || b.status === "paid"
  );
  const grossRevenue = confirmedBookingRows.reduce((sum, b) => sum + (b.subtotalAmount || 0), 0);
  const totalEarnings = Math.round(grossRevenue * (1 - commissionRate / 100));
  const pendingPayouts = Math.max(0, totalEarnings - totalPaidOut);

  // Map real experiences from DB
  const experiencesList: SupplierExperienceItem[] = productRows.map((p) => {
    const pBookings = bookingRows.filter((b) => b.productId === p.id);
    const pRev = pBookings.reduce((sum, b) => sum + (b.subtotalAmount || 0), 0);
    const imgUrl =
      imagesMap.get(p.id) ||
      (row.logoUrl ? row.logoUrl : "/images/duomo-tour.jpg");

    const categoryName = p.categoryId ? catMap.get(p.categoryId) || "Tours" : category;
    const priceAmount = pricesMap.get(p.id) || 0;

    let displayStatus = "Draft";
    if (p.status === "live") displayStatus = "Published";
    else if (p.status === "pending_review") displayStatus = "Pending";
    else if (p.status === "paused") displayStatus = "Paused";
    else if (p.status === "rejected") displayStatus = "Rejected";

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: displayStatus,
      imageUrl: imgUrl,
      categoryName,
      bookingsCount: pBookings.length,
      revenue: pRev,
      priceAmount,
    };
  });

  // Map real bookings from DB
  const formattedBookings: SupplierBookingItem[] = bookingRows.map((b) => ({
    orderId: b.orderId,
    productTitle: b.productTitle,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    date: b.date,
    subtotalAmount: b.subtotalAmount,
    status: b.status,
    currency: b.currency,
    createdAt: b.createdAt,
  }));

  // Query real activity from auditLogs and notifications
  const auditRows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(and(eq(auditLogs.entityType, "supplier"), eq(auditLogs.entityId, id)))
    .orderBy(desc(auditLogs.createdAt))
    .limit(10);

  const notifRows = await db
    .select({
      id: supplierNotifications.id,
      title: supplierNotifications.title,
      type: supplierNotifications.type,
      createdAt: supplierNotifications.createdAt,
    })
    .from(supplierNotifications)
    .where(eq(supplierNotifications.supplierId, id))
    .orderBy(desc(supplierNotifications.createdAt))
    .limit(10);

  const activities: SupplierActivityItem[] = [];

  for (const a of auditRows) {
    let title = `Supplier updated (${a.action})`;
    let type: SupplierActivityItem["type"] = "profile_updated";
    if (a.action === "supplier.create") {
      title = "Supplier account created";
    } else if (a.action === "supplier.status_change") {
      title = "Status changed by administrator";
      type = "status_change";
    } else if (a.action === "supplier.application_approve") {
      title = "Supplier application approved";
      type = "experience_approved";
    }
    activities.push({
      id: a.id,
      title,
      dateStr: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(a.createdAt)),
      type,
    });
  }

  for (const n of notifRows) {
    let type: SupplierActivityItem["type"] = "profile_updated";
    if (n.type.includes("approve")) type = "experience_approved";
    if (n.type.includes("booking")) type = "booking_received";
    activities.push({
      id: n.id,
      title: n.title,
      dateStr: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(n.createdAt)),
      type,
    });
  }

  // Include recent bookings in activity
  for (const b of bookingRows.slice(0, 3)) {
    activities.push({
      id: `bk-act-${b.orderId}`,
      title: `Booking received for ${b.productTitle}`,
      dateStr: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(b.createdAt)),
      type: "booking_received",
    });
  }

  // If activities empty, show creation record
  if (activities.length === 0) {
    activities.push({
      id: `created-${row.id}`,
      title: "Supplier account registered",
      dateStr: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(row.createdAt)),
      type: "experience_approved",
    });
  }

  // Collect category tags from this supplier's real products
  const categoryTagSet = new Set<string>();
  for (const p of productRows) {
    if (p.categoryId && catMap.has(p.categoryId)) {
      categoryTagSet.add(catMap.get(p.categoryId)!);
    }
  }
  if (categoryTagSet.size === 0) {
    categoryTagSet.add(category);
  }

  const supplierCode = `SUP-${row.id.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase() || "001"}`;

  const heroImageUrl =
    experiencesList.length > 0 && experiencesList[0].imageUrl
      ? experiencesList[0].imageUrl
      : row.logoUrl || "/images/duomo-tour.jpg";

  return {
    supplier: {
      id: row.id,
      name: row.name,
      companyName: row.name,
      slug: row.slug,
      status: (row.status as SupplierStatus) || "approved",
      contactName: row.contactName,
      contactEmail: row.contactEmail,
      contactPhone: row.contactPhone,
      website: row.website,
      taxId: row.taxId,
      country: countryInfo.name,
      countryCode: countryInfo.code,
      companyCategory: category,
      logoUrl: row.logoUrl,
      commissionRateOverride: row.commissionRateOverride,
      notes: row.notes,
      about: row.about,
      businessType: row.businessType,
      businessAddress: row.businessAddress,
      city: row.city,
      postalCode: row.postalCode,
      experiencesCount: totalExperiences,
      bookingsCount: totalBookings,
      createdAt: row.createdAt,
      supplierCode,
      address:
        [row.businessAddress, row.city, row.postalCode, row.country].filter(Boolean).join(", ") ||
        (row.country ? `${row.country}` : "Florence, Italy"),
      yearEstablished: `${new Date(row.createdAt).getFullYear()}`,
      heroImageUrl,
      description: row.about || row.notes || "No business description provided yet.",
      categoryTags: Array.from(categoryTagSet),
      timeline: {
        submittedAt: row.createdAt,
        reviewedAt: row.createdAt,
        approvedAt: row.status === "approved" ? row.updatedAt : undefined,
      },
      documents: row.documentUrl
        ? [
            {
              id: `${row.id}-application-document`,
              title: "Business / Compliance Document",
              filename: row.documentName || "Uploaded document",
              uploadedAt: new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date(row.createdAt)),
              url: row.documentUrl,
            },
          ]
        : [],
    },
    quickStats: {
      totalExperiences,
      totalBookings,
      totalEarnings,
      pendingPayouts,
      commissionRate,
    },
    experiences: experiencesList,
    bookings: formattedBookings,
    activities,
  };
}

/** Applications submitted through the public "Become a Supplier" form, awaiting review. */
export async function listPendingSupplierApplications(): Promise<PendingSupplierApplication[]> {
  const rows = await db
    .select()
    .from(leadSubmissions)
    .where(and(eq(leadSubmissions.type, "supplier_application"), eq(leadSubmissions.status, "new")))
    .orderBy(desc(leadSubmissions.createdAt));

  return rows.map((r) => {
    const payload = (r.payload ?? {}) as { website?: string | null; experienceType?: string | null };
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      company: r.company,
      message: r.message,
      website: payload.website ?? null,
      experienceType: payload.experienceType ?? null,
      createdAt: r.createdAt,
    };
  });
}

export interface SupplierEditInput {
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  taxId: string | null;
  country: string | null;
  commissionRateOverride: number | null;
  notes: string | null;
  about?: string | null;
  logoUrl?: string | null;
  status?: SupplierStatus;
}

export interface SupplierCreateInput {
  name: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  website?: string | null;
  taxId?: string | null;
  country?: string | null;
  commissionRateOverride?: number | null;
  notes?: string | null;
  about?: string | null;
  status?: SupplierStatus;
}

export async function createSupplier(input: SupplierCreateInput): Promise<MutationResult> {
  try {
    const slug = await uniqueSlug(input.name);
    const [created] = await db
      .insert(suppliers)
      .values({
        name: input.name.trim(),
        slug,
        status: input.status ?? "approved",
        contactName: input.contactName?.trim() || null,
        contactEmail: input.contactEmail?.trim() || null,
        contactPhone: input.contactPhone?.trim() || null,
        website: input.website?.trim() || null,
        taxId: input.taxId?.trim() || null,
        country: input.country?.trim() || "Italy",
        commissionRateOverride: input.commissionRateOverride ?? null,
        notes: input.notes?.trim() || null,
        about: input.about?.trim() || null,
      })
      .returning({ id: suppliers.id });
    return { success: true, id: created.id };
  } catch (err) {
    console.error("[admin/suppliers] createSupplier failed:", err);
    return { success: false, error: "Could not create supplier." };
  }
}

export async function updateSupplier(id: string, input: SupplierEditInput): Promise<MutationResult> {
  try {
    await db.update(suppliers).set(input).where(eq(suppliers.id, id));
    return { success: true, id };
  } catch (err) {
    console.error("[admin/suppliers] updateSupplier failed:", err);
    return { success: false, error: "Could not save supplier." };
  }
}

export async function setSupplierStatus(id: string, status: SupplierStatus): Promise<MutationResult> {
  try {
    await db.update(suppliers).set({ status }).where(eq(suppliers.id, id));
    return { success: true, id };
  } catch (err) {
    console.error("[admin/suppliers] setSupplierStatus failed:", err);
    return { success: false, error: "Could not update status." };
  }
}

export async function saveSupplierNote(id: string, note: string): Promise<MutationResult> {
  try {
    await db.update(suppliers).set({ notes: note }).where(eq(suppliers.id, id));
    return { success: true, id };
  } catch (err) {
    console.error("[admin/suppliers] saveSupplierNote failed:", err);
    return { success: false, error: "Could not save note." };
  }
}

export async function bulkSetSuppliersStatus(ids: string[], status: SupplierStatus): Promise<MutationResult> {
  try {
    if (ids.length === 0) return { success: true };
    await db.update(suppliers).set({ status }).where(inArray(suppliers.id, ids));
    return { success: true };
  } catch (err) {
    console.error("[admin/suppliers] bulkSetSuppliersStatus failed:", err);
    return { success: false, error: "Could not update suppliers." };
  }
}

export async function deleteSupplier(id: string): Promise<MutationResult> {
  try {
    await db.delete(suppliers).where(eq(suppliers.id, id));
    return { success: true, id };
  } catch (err) {
    console.error("[admin/suppliers] deleteSupplier failed:", err);
    return { success: false, error: "Could not delete supplier." };
  }
}

export async function bulkDeleteSuppliers(ids: string[]): Promise<MutationResult> {
  try {
    if (ids.length === 0) return { success: true };
    await db.delete(suppliers).where(inArray(suppliers.id, ids));
    return { success: true };
  } catch (err) {
    console.error("[admin/suppliers] bulkDeleteSuppliers failed:", err);
    return { success: false, error: "Could not delete suppliers." };
  }
}

/**
 * Turns a pending "Become a Supplier" application into a real roster row
 * and marks the lead as converted, in one transaction.
 */
export async function approveSupplierApplication(leadId: string): Promise<MutationResult> {
  try {
    const [lead] = await db.select().from(leadSubmissions).where(eq(leadSubmissions.id, leadId));
    if (!lead) return { success: false, error: "Application not found." };
    const payload = (lead.payload ?? {}) as { website?: string | null; experienceType?: string | null };

    const name = lead.company?.trim() || lead.name;
    const slug = await uniqueSlug(name);

    const result = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(suppliers)
        .values({
          name,
          slug,
          status: "approved",
          contactName: lead.name,
          contactEmail: lead.email,
          contactPhone: lead.phone,
          website: payload.website ?? null,
          notes: lead.message,
          about: payload.experienceType ?? null,
        })
        .returning({ id: suppliers.id });
      await tx.update(leadSubmissions).set({ status: "converted" }).where(eq(leadSubmissions.id, leadId));
      return created;
    });

    return { success: true, id: result.id };
  } catch (err) {
    console.error("[admin/suppliers] approveSupplierApplication failed:", err);
    return { success: false, error: "Could not approve this application." };
  }
}

export async function rejectSupplierApplication(leadId: string, reason: string): Promise<MutationResult> {
  try {
    const [lead] = await db.select().from(leadSubmissions).where(eq(leadSubmissions.id, leadId));
    if (!lead) return { success: false, error: "Application not found." };
    const payload = { ...((lead.payload as object) ?? {}), rejectionReason: reason || null };
    await db.update(leadSubmissions).set({ status: "rejected", payload }).where(eq(leadSubmissions.id, leadId));
    return { success: true, id: leadId };
  } catch (err) {
    console.error("[admin/suppliers] rejectSupplierApplication failed:", err);
    return { success: false, error: "Could not reject this application." };
  }
}
