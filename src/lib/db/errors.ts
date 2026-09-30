/**
 * node-postgres (via drizzle-orm's node-postgres driver) wraps every
 * failed query in its own Error whose top-level `.code` is undefined —
 * the real Postgres error code (e.g. "23505" unique_violation, "23503"
 * foreign_key_violation) lives one level down, on `.cause.code`.
 * Confirmed live against the real Neon DB: `err.code` was always
 * `undefined` on a genuine unique-violation insert, while `err.cause.code`
 * was `"23505"`. Every catch block that inspects a Postgres error code to
 * turn it into a specific, friendly message (e.g. "A role with this name
 * already exists" vs a generic "Could not save") must go through this
 * helper rather than reading `err.code` directly, or the check silently
 * never matches and the friendly branch never fires.
 */
export function getPgErrorCode(err: unknown): string | undefined {
  const top = err as { code?: string; cause?: { code?: string } } | null | undefined;
  return top?.code ?? top?.cause?.code;
}
