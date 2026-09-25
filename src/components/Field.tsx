import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && !error ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-destructive" role="alert">
          <span aria-hidden>!</span>
          {error}
        </p>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-[999px] border border-line-strong bg-surface-raised px-4 py-2.5 text-sm placeholder:text-muted-foreground disabled:opacity-50";

export const textareaClass =
  "w-full rounded-none border border-line-strong bg-surface-raised px-4 py-3 font-mono text-sm placeholder:text-muted-foreground disabled:opacity-50";
