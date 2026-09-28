"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignUserRoleAction, removeStaffAccessAction } from "@/app/admin/(protected)/roles/actions";
import type { AdminRoleListItem, AdminStaffMember } from "@/lib/data/admin/roles";
import { Field, Input, Select, Button, useToast } from "@/components/admin/ui";

export function StaffMembersPanel({
  members,
  roles,
  currentUserId,
}: {
  members: AdminStaffMember[];
  roles: AdminRoleListItem[];
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");

  const promote = () => {
    if (!email.trim() || !roleId) return;
    startTransition(async () => {
      const result = await assignUserRoleAction(email.trim().toLowerCase(), roleId);
      if (!result.success) showToast(result.error ?? "Could not assign role.", "error");
      else {
        showToast("Role assigned.", "success");
        setEmail("");
        router.refresh();
      }
    });
  };

  const changeRole = (userId: string, newRoleId: string) => {
    const member = members.find((m) => m.id === userId);
    startTransition(async () => {
      const result = await assignUserRoleAction(member?.email ?? "", newRoleId);
      if (!result.success) showToast(result.error ?? "Could not change role.", "error");
      else {
        showToast("Role changed.", "success");
        router.refresh();
      }
    });
  };

  const removeAccess = (userId: string) => {
    startTransition(async () => {
      const result = await removeStaffAccessAction(userId);
      if (!result.success) showToast(result.error ?? "Could not remove access.", "error");
      else {
        showToast("Admin access removed — they're now an ordinary customer account.", "success");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
        <h3 className="mb-3 text-xs font-semibold text-neutral-700">Give someone admin access</h3>
        <p className="mb-3 text-xs text-neutral-500">
          They need an existing account (via Register) first — this just assigns it a staff role.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@example.com" />
            </Field>
          </div>
          <div className="min-w-[180px]">
            <Field label="Role">
              <Select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button onClick={promote} disabled={isPending || !email.trim()}>
            Assign
          </Button>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-8 text-center text-sm text-neutral-500">
          No staff members yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#EAE6DF] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#F0ECE6] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-[#F5F3EF] last:border-0 hover:bg-[#FAF8F5]">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {m.name}
                    {m.id === currentUserId ? <span className="ml-1.5 text-[11px] text-neutral-400">(you)</span> : null}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{m.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={m.roleId}
                      disabled={isPending}
                      onChange={(e) => changeRole(m.id, e.target.value)}
                      className="rounded-lg border border-[#EAE6DF] bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 shadow-sm disabled:opacity-50"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.id !== currentUserId ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => removeAccess(m.id)}
                        className="text-[11px] font-semibold text-rose-600 hover:underline disabled:opacity-50"
                      >
                        Remove access
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
