"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BlogSearchBox({
  placeholder = "Search articles...",
  initialQuery = "",
  className = "",
}: {
  placeholder?: string;
  initialQuery?: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(params.toString() ? `/blog?${params.toString()}#articles` : "/blog#articles");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full max-w-md bg-white rounded-full p-1.5 pl-4 shadow-md border border-neutral-200/90 focus-within:border-[#a813c9] focus-within:shadow-lg transition-all ${className}`}
    >
      <svg
        viewBox="0 0 20 20"
        className="w-4 h-4 text-neutral-400 shrink-0 mr-2.5 fill-none stroke-current stroke-2"
        aria-hidden="true"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="m17 17-4.35-4.35" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label="Search articles"
        className="w-full bg-transparent pr-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2B0934] hover:bg-[#3D0D4A] text-white shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
          <path d="M4 10h11m-4-4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  );
}
