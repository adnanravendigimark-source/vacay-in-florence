import "server-only";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, orders, leadSubmissions } from "@/lib/db/schema";
import { getOrdersForUser, type OrderView } from "@/lib/data/orders";

export interface AdminCustomerListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  orderCount: number;
  totalSpent: number;
}

export interface AdminCustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  emailVerified: Date | null;
  orders: OrderView[];
  contactMessages: { id: string; message: string | null; status: string; createdAt: Date }[];
}

export interface AdminCustomerFilters {
  search?: string;
}

/**
 * Real customers only. Scoped to accountType "customer" (not the older
 * `roleId is null` check, which staff-vs-customer used before the
 * account-isolation overhaul — a supplier account also has roleId null,
 * so that check alone would now wrongly include suppliers here too).
 * Order count/spend come from one grouped aggregate query, not N+1 lookups
 * per customer. "Spent" only counts confirmed orders, matching how the
 * dashboard's own revenue figure is scoped.
 */
export async function listAdminCustomers(filters: AdminCustomerFilters = {}): Promise<AdminCustomerListItem[]> {
  const conditions = [eq(users.accountType, "customer")];
  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(or(like(users.name, term), like(users.email, term))!);
  }

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      createdAt: users.createdAt,
      orderCount: sql<number>`count(${orders.id})::int`,
      totalSpent: sql<number>`coalesce(sum(case when ${orders.status} = 'confirmed' then ${orders.totalAmount} else 0 end), 0)::float`,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .where(and(...conditions))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt))
    .limit(300);

  return rows;
}

export async function getAdminCustomerById(id: string): Promise<AdminCustomerDetail | null> {
  const [user] = await db.select().from(users).where(and(eq(users.id, id), eq(users.accountType, "customer")));
  if (!user) return null;

  const [customerOrders, contactRows] = await Promise.all([
    getOrdersForUser(user.id),
    db
      .select({ id: leadSubmissions.id, message: leadSubmissions.message, status: leadSubmissions.status, createdAt: leadSubmissions.createdAt })
      .from(leadSubmissions)
      .where(and(eq(leadSubmissions.type, "contact"), eq(leadSubmissions.email, user.email)))
      .orderBy(desc(leadSubmissions.createdAt)),
  ]);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    nationality: user.nationality,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    emailVerified: user.emailVerified,
    orders: customerOrders,
    contactMessages: contactRows,
  };
}
