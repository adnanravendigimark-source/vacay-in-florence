/**
 * Builds a `pathname?query` string, merging a base set of params with
 * overrides and dropping empty/undefined values. Used by listing pages
 * to build pagination, sort, and filter links that preserve the rest of
 * the current query string.
 */
export function buildHref(
  pathname: string,
  base: Record<string, string | undefined>,
  overrides: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
