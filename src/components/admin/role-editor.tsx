"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRoleAction, updateRoleAction, deleteRoleAction } from "@/app/admin/(protected)/roles/actions";
import type { AdminRoleDetail, PermissionCatalogEntry } from "@/lib/data/admin/roles";
import { Field, Input, Button, Modal, useToast } from "@/components/admin/ui";

export function RoleEditor({
  mode,
  role,
  catalog,
}: {
  mode: "create" | "edit";
  role?: AdminRoleDetail;
  catalog: PermissionCatalogEntry[];
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set(role?.permissionKeys ?? []));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const byCategory = useMemo(() => {
    const groups = new Map<string, PermissionCatalogEntry[]>();
    for (const p of catalog) {
      const list = groups.get(p.category) ?? [];
      list.push(p);
      groups.set(p.category, list);
    }
    return Array.from(groups.entries());
  }, [catalog]);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const save = () => {
    if (!name.trim()) {
      showToast("Give the role a name.", "error");
      return;
    }
    const input = { name: name.trim(), description: description.trim() || null, permissionKeys: Array.from(selected) };
    startTransition(async () => {
      const result = mode === "create" ? await createRoleAction(input) : await updateRoleAction(role!.id, input);
      if (!result.success) showToast(result.error ?? "Could not save role.", "error");
      else {
        showToast(mode === "create" ? "Role created." : "Role saved.", "success");
        router.push("/admin/roles");
        router.refresh();
      }
    });
  };

  const remove = () => {
    if (!role) return;
    startTransition(async () => {
      const result = await deleteRoleAction(role.id);
      if (!result.success) showToast(result.error ?? "Could not delete role.", "error");
      else {
        showToast("Role deleted.", "success");
        router.push("/admin/roles");
        router.refresh();
      }
      setConfirmDelete(false);
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#EAE6DF] bg-white p-5 sm:grid-cols-2">
        <Field label="Role name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={role?.isSystem} placeholder="e.g. Support" />
        </Field>
        <Field label="Description">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this role is for" />
        </Field>
      </div>
      {role?.isSystem ? (
        <p className="text-xs text-neutral-500">
          This is the Super Admin system role — its name can&apos;t be changed and it can&apos;t be deleted, but you can still
          adjust which permissions it has below.
        </p>
      ) : null}

      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5">
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400">Permissions</h2>
        <div className="space-y-5">
          {byCategory.map(([category, perms]) => (
            <div key={category}>
              <p className="mb-2 text-xs font-semibold text-neutral-700">{category}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {perms.map((p) => (
                  <label
                    key={p.key}
                    className="flex items-center gap-2.5 rounded-xl border border-[#F0ECE6] px-3 py-2 text-sm text-neutral-700 hover:bg-[#FAF8F5]"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(p.key)}
                      onChange={() => toggle(p.key)}
                      className="h-4 w-4 rounded border-neutral-300 text-[#2b0934] focus:ring-[#2b0934]/30"
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {mode === "edit" && !role?.isSystem ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Delete role
            </button>
          ) : null}
        </div>
        <Button onClick={save} disabled={isPending}>
          {isPending ? "Saving…" : mode === "create" ? "Create role" : "Save changes"}
        </Button>
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete role">
        <div className="space-y-3">
          <p className="text-sm text-neutral-600">Delete the &quot;{role?.name}&quot; role? This can&apos;t be undone.</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={remove}
              className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Delete role
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
