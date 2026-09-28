"use client";

import { useState, type ReactNode } from "react";

export function Tabs({
  tabs,
  defaultTab,
  active: controlledActive,
  onChange,
}: {
  tabs: Array<{ key: string; label: string; content: ReactNode }>;
  defaultTab?: string;
  // Optional controlled mode: pass `active` + `onChange` when a parent
  // needs to switch tabs itself (e.g. a "Manage →" link jumping to a
  // specific tab). Uncontrolled (internal state) when omitted, same as
  // before.
  active?: string;
  onChange?: (key: string) => void;
}) {
  const [internalActive, setInternalActive] = useState(defaultTab ?? tabs[0]?.key);
  const active = controlledActive ?? internalActive;

  function selectTab(key: string) {
    if (onChange) onChange(key);
    else setInternalActive(key);
  }

  return (
    <div>
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-stone">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => selectTab(tab.key)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              active === tab.key
                ? "border-cypress text-cypress"
                : "border-transparent text-ink-faint hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find((t) => t.key === active)?.content}
    </div>
  );
}
