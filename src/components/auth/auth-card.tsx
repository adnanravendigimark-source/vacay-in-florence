import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="bg-cream-deep/60 py-14 sm:py-20">
      <Container className="max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-[var(--shadow-card)] ring-1 ring-stone/60 sm:p-10">
          <Link href="/" className="mb-6 inline-block text-sm text-ink-faint hover:text-ink">
            &larr; Back to VACAY Florence
          </Link>
          <h1 className="font-display text-2xl font-medium text-ink">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6 border-t border-stone pt-5 text-sm text-ink-soft">{footer}</div> : null}
        </div>
      </Container>
    </div>
  );
}

export function FormField({
  label,
  name,
  type = "text",
  required = true,
  defaultValue,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-stone-dark px-3.5 py-2.5 text-sm text-ink outline-none focus:border-cypress"
      />
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-terracotta-light px-3.5 py-2.5 text-sm text-terracotta-dark">
      {message}
    </p>
  );
}

export function FormNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="status" className="rounded-xl bg-cypress-light px-3.5 py-2.5 text-sm text-cypress">
      {message}
    </p>
  );
}

export function SubmitButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="w-full rounded-full bg-cypress px-6 py-3 text-sm font-semibold text-white transition hover:bg-cypress/90"
    >
      {label}
    </button>
  );
}

export function FormTextArea({
  label,
  name,
  required = true,
  rows = 5,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1.5 w-full resize-y rounded-xl border border-stone-dark px-3.5 py-2.5 text-sm text-ink outline-none focus:border-cypress"
      />
    </div>
  );
}
