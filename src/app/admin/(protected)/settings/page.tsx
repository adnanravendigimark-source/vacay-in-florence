import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data/site-content";
import { requirePermission } from "@/lib/require-user";
import { SiteSettingsEditor } from "@/components/admin/site-settings-editor";

export const metadata: Metadata = {
  title: "Website Settings | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminSettingsPage() {
  await requirePermission("content.view", "/admin/settings");
  const settings = await getSiteSettings();
  return <SiteSettingsEditor initialData={settings} />;
}
