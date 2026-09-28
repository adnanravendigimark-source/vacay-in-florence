"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteRoleAction } from "@/app/admin/(protected)/roles/actions";
import type { AdminRoleListItem } from "@/lib/data/admin/roles";
import { Modal, useToast } from "@/components/admin/ui";
import { useRouter } from "next/navigation";

export function RolesTable({ roles }: { roles: AdminRoleListItem[] }) {
  const [deleteTarget, setDeleteTarget] = useState<AdminRoleListItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const role = deleteTarget;
    startTransition(async () => {
      const result = await deleteRoleAction(role.id);
      if (!result.success) showToast(result.error ?? "Could not delete role.", "error");
      else {
        showToast("Role deleted.", "success");
        router.refresh();
      }
      setDeleteTarget(null);
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-[#EAE6DF] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#F0ECE6] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Permissions</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-[#F5F3EF] last:border-0 hover:bg-[#FAF8F5]">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">
                    {role.name}
                    {role.isSystem ? (
                      <span className="ml-2 inline-flex items-center rounded-full bg-[#FAF5FC] px-2 py-0.5 text-[10px] font-semibold text-[#2b0934]">
                        System
                      </span>
                    ) : null}
                  </p>
                  {role.description ? <p className="text-[11px] text-neutral-500">{role.description}</p> : null}
                </td>
                <td className="px-4 py-3 text-neutral-600">{role.permissionCount}</td>
                <td className="px-4 py-3 text-neutral-600">{role.memberCount}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/roles/${role.id}`} className="text-[11px] font-semibold text-[#2b0934] hover:underline">
                      Edit
                    </Link>
                    {!role.isSystem ? (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(role)}
                        className="text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete role">
        <div className="space-y-3">
          <p className="text-sm text-neutral-600">
            Delete the &quot;{deleteTarget?.name}&quot; role? This can&apos;t be undone.
            {deleteTarget && deleteTarget.memberCount > 0
              ? ` ${deleteTarget.memberCount} staff member${deleteTarget.memberCount === 1 ? " has" : "s have"} this role assigned, so this will be blocked until they're moved to another role.`
              : ""}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={confirmDelete}
              className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Delete role
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
