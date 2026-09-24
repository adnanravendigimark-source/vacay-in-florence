"use client";

import { useState, type ReactNode } from "react";

export function Tabs({
  tabs,
  defaultTab,
}: {
  tabs: Array<{ key: string; label: string; content: ReactNode }>;
  defaultTab?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);

  return (
    <div>
      <div className="mb-5 flex gap-1 border-b border-stone">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              active === tab.key
                ? "border-brand text-brand-deep"
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
