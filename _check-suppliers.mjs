import { db } from "./src/lib/db/index.ts";
import { users, suppliers } from "./src/lib/db/schema.ts";
import { eq } from "drizzle-orm";

const rows = await db
  .select({
    userId: users.id,
    email: users.email,
    accountType: users.accountType,
    emailVerified: users.emailVerified,
    supplierId: suppliers.id,
    supplierStatus: suppliers.status,
  })
  .from(users)
  .innerJoin(suppliers, eq(suppliers.userId, users.id))
  .limit(10);

console.log(JSON.stringify(rows, null, 2));
process.exit(0);
