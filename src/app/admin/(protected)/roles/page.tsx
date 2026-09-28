import type { Metadata } from "next";
import Link from "next/link";
import { listAdminRoles, listStaffMembers } from "@/lib/data/admin/roles";
import { requirePermission } from "@/lib/require-user";
import { RolesTable } from "@/components/admin/roles-table";
import { StaffMembersPanel } from "@/components/admin/staff-members-panel";

export const metadata: Metadata = {
  title: "Users & Roles | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminRolesPage() {
  const staffCtx = await requirePermission("roles.view", "/admin/roles");
  const [rolesList, staffMembers] = await Promise.all([listAdminRoles(), listStaffMembers()]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 sm:space-y-7">
      <div>
        <p className="text-[11px] font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-[#2b0934]">
            Dashboard
          </Link>{" "}
          / Users &amp; Roles
        </p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
              Users &amp; Roles
            </h1>
            <p className="mt-1 text-xs text-neutral-500 sm:text-[13px]">
              Roles define what staff can do; permission changes here take effect immediately, no deploy needed.
            </p>
          </div>
          <Link
            href="/admin/roles/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2b0934] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3d0d4a]"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Role</span>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Roles ({rolesList.length})
        </h2>
        <RolesTable roles={rolesList} />
      </div>

      <div>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Staff members ({staffMembers.length})
        </h2>
        <StaffMembersPanel members={staffMembers} roles={rolesList} currentUserId={staffCtx.userId} />
      </div>
    </div>
  );
}
