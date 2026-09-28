import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminRoleById, listPermissionCatalog } from "@/lib/data/admin/roles";
import { requirePermission } from "@/lib/require-user";
import { RoleEditor } from "@/components/admin/role-editor";

export const metadata: Metadata = {
  title: "Edit Role | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("roles.manage", `/admin/roles/${id}`);
  const [role, catalog] = await Promise.all([getAdminRoleById(id), listPermissionCatalog()]);
  if (!role) notFound();

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
          / {role.name}
        </p>
        <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
          {role.name}
        </h1>
      </div>
      <RoleEditor mode="edit" role={role} catalog={catalog} />
    </div>
  );
}
