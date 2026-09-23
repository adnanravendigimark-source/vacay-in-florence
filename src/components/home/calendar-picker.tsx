"use client";

import { useState } from "react";

interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date | null, formattedLabel: string) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  onClose,
}: CalendarPickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date(today);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Quick Preset Handlers
  const handleQuickPreset = (preset: "today" | "tomorrow" | "weekend" | "anytime") => {
    if (preset === "anytime") {
      onSelectDate(null, "Select date");
      onClose();
      return;
    }

    const target = new Date(today);
    if (preset === "today") {
      onSelectDate(target, `Today, ${formatDateShort(target)}`);
    } else if (preset === "tomorrow") {
      target.setDate(target.getDate() + 1);
      onSelectDate(target, `Tomorrow, ${formatDateShort(target)}`);
    } else if (preset === "weekend") {
      const day = target.getDay();
      const daysUntilSaturday = (6 - day + 7) % 7 || 7;
      target.setDate(target.getDate() + daysUntilSaturday);
      onSelectDate(target, `This Weekend (${formatDateShort(target)})`);
    }
    onClose();
  };

  // Generate calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleSelectDay = (day: number) => {
    const clickedDate = new Date(year, month, day);
    clickedDate.setHours(0, 0, 0, 0);

    const formatted = clickedDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    onSelectDate(clickedDate, formatted);
    onClose();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
  };

  const isPast = (day: number) => {
    const checkDate = new Date(year, month, day);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isToday = (day: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  return (
    <div className="w-[315px] sm:w-[335px] rounded-3xl border border-neutral-200/90 bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-black/5 text-neutral-900 select-none">
      {/* Quick Presets Strip */}
      <div className="grid grid-cols-4 gap-1.5 pb-3.5 border-b border-neutral-100">
        <button
          type="button"
          onClick={() => handleQuickPreset("today")}
          className="rounded-full bg-neutral-100/90 px-2.5 py-1.5 text-[11.5px] font-semibold text-neutral-800 transition-colors hover:bg-[#183528] hover:text-white cursor-pointer"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => handleQuickPreset("tomorrow")}
          className="rounded-full bg-neutral-100/90 px-2.5 py-1.5 text-[11.5px] font-semibold text-neutral-800 transition-colors hover:bg-[#183528] hover:text-white cursor-pointer"
        >
          Tomorrow
        </button>
        <button
          type="button"
          onClick={() => handleQuickPreset("weekend")}
          className="rounded-full bg-neutral-100/90 px-2.5 py-1.5 text-[11.5px] font-semibold text-neutral-800 transition-colors hover:bg-[#183528] hover:text-white cursor-pointer"
        >
          Weekend
        </button>
        <button
          type="button"
          onClick={() => handleQuickPreset("anytime")}
          className="rounded-full bg-neutral-100/90 px-2.5 py-1.5 text-[11.5px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-200 cursor-pointer"
        >
          Anytime
        </button>
      </div>

      {/* Month Header & Controls */}
      <div className="flex items-center justify-between pt-3 pb-2 px-1">
        <h4 className="text-sm font-bold text-neutral-900">
          {MONTH_NAMES[month]} {year}
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 gap-1 text-center py-1 text-[11px] font-bold text-neutral-400">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 pt-1">
        {/* Leading blank days */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8 w-8" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const disabled = isPast(day);
          const active = isSelected(day);
          const current = isToday(day);

          return (
            <button
              key={`day-${day}`}
              type="button"
              disabled={disabled}
              onClick={() => handleSelectDay(day)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${active
                  ? "bg-[#183528] text-white shadow-sm scale-105"
                  : disabled
                    ? "text-neutral-300 cursor-not-allowed"
                    : current
                      ? "border border-[#183528] text-[#183528] hover:bg-[#183528]/10"
                      : "text-neutral-800 hover:bg-neutral-100"
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
        <span>Free cancellation available</span>
        <button
          type="button"
          onClick={() => {
            onSelectDate(null, "Select date");
            onClose();
          }}
          className="text-neutral-600 hover:text-neutral-900 font-semibold underline decoration-dotted"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
