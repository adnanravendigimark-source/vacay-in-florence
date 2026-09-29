"use client";

import { useState } from "react";
import { ImageField } from "@/components/admin/ui";

/**
 * ImageField is a controlled component (its own URL input + upload
 * button), so it needs real client-side state — a plain hidden input with
 * a static defaultValue would never reflect what the supplier just typed
 * or uploaded. This thin wrapper holds that state and mirrors it into a
 * hidden input so the surrounding server-action <form> still submits it
 * like every other field.
 */
export function SupplierLogoField({ initialValue }: { initialValue: string }) {
  const [url, setUrl] = useState(initialValue);
  return (
    <>
      <ImageField label="Logo" value={url} onChange={setUrl} hint="Shown in your dashboard and on your listings" />
      <input type="hidden" name="logoUrl" value={url} readOnly />
    </>
  );
}
