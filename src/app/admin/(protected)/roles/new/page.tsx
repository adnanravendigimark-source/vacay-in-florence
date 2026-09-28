import type { Metadata } from "next";
import Link from "next/link";
import { listPermissionCatalog } from "@/lib/data/admin/roles";
import { requirePermission } from "@/lib/require-user";
import { RoleEditor } from "@/components/admin/role-editor";

export const metadata: Metadata = {
  title: "New Role | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function NewRolePage() {
  await requirePermission("roles.manage", "/admin/roles/new");
  const catalog = await listPermissionCatalog();

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-7">
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Dashboard
          </Link>{" "}
          /{" "}
          <Link href="/admin/roles" className="hover:text-[#2b0934]">
            Users &amp; Roles
          </Link>{" "}
          / New Role
        </p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
          New Role
        </h1>
      </div>
      <RoleEditor mode="create" catalog={catalog} />
    </div>
  );
}
