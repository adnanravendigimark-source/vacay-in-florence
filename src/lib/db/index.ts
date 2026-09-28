import { Pool, type PoolConfig } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dns from "node:dns";
import * as schema from "./schema";

// @types/pg's PoolConfig doesn't declare `lookup`, even though pg forwards
// unrecognized config straight through to Node's net.connect()/tls.connect(),
// which does accept it — extend the type locally rather than losing type
// safety on the rest of the config with a blanket cast.
type PoolConfigWithLookup = PoolConfig & {
  lookup?: (
    hostname: string,
    options: dns.LookupOptions,
    callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void,
  ) => void;
};

/**
 * Singleton DB client, backed by Neon Postgres over plain TCP
 * (node-postgres `Pool` against Neon's pooled connection string —
 * the `-pooler` host in DATABASE_URL is PgBouncer in transaction mode,
 * which is fine for the BEGIN/COMMIT transactions this app runs).
 *
 * node-postgres (rather than @neondatabase/serverless) was chosen
 * specifically because the checkout flow needs a real interactive
 * transaction — read current availability, decide whether to throw,
 * then write — and Neon's HTTP driver (neon-http) does not support
 * that; only a session-based Postgres connection does.
 *
 * Next.js dev-mode module reloading would otherwise open a fresh pool
 * on every hot reload; stashing it on `globalThis` avoids that,
 * mirroring the usual Prisma-client-singleton pattern.
 */
const globalForDb = globalThis as unknown as {
  __pgPool__?: InstanceType<typeof Pool>;
};

const poolConfig: PoolConfigWithLookup = {
  connectionString: process.env.DATABASE_URL,
  // Force IPv4 DNS resolution for the Neon host. Node's default
  // dual-stack ("happy eyeballs") resolution can hang trying IPv6
  // addresses first on networks where IPv6 is enabled but not
  // actually routed end-to-end (common on many home/ISP setups) —
  // symptom is `pg` timing out with an AggregateError of several
  // failed connection attempts, even though a plain IPv4 TCP check
  // (e.g. `nc`) to the same host succeeds instantly. Pinning to IPv4
  // here sidesteps that entirely; it's a no-op if IPv6 was never the
  // problem.
  // `all: false` pins the callback to the single-address overload
  // (string, not LookupAddress[]) regardless of what the caller passed in.
  lookup: (hostname, options, callback) =>
    dns.lookup(hostname, { ...options, family: 4, all: false }, callback),
};

const pool = globalForDb.__pgPool__ ?? new Pool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  globalForDb.__pgPool__ = pool;
}

export const db = drizzle(pool, { schema });
