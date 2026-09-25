import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchField({
  id,
  value,
  onChange,
  placeholder,
  className,
  onSubmit,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSubmit?: () => void;
}) {
  return (
    <form
      className={cn("relative w-full max-w-md", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
      <label className="sr-only" htmlFor={id}>
        {placeholder ?? "Search"}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[999px] border border-line-strong bg-surface-raised py-2.5 pr-4 pl-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
      />
    </form>
  );
}
