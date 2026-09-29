import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Shown on hover, and read out after the label. */
  hint?: string;
  disabled?: boolean;
}

/** A single-choice pill switch for options that change how something is calculated or shown. */
export function Segmented<T extends string>({
  label,
  value,
  onValueChange,
  options,
  className,
  size = "md",
}: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <ToggleGroup.Root
      type="single"
      aria-label={label}
      value={value}
      // Radix allows clearing a single toggle group; a segmented control always keeps one choice.
      onValueChange={(next) => {
        if (next) onValueChange(next as T);
      }}
      className={cn("inline-flex max-w-full flex-wrap gap-1 rounded-[999px] bg-surface-alt p-1", className)}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          title={option.hint}
          aria-label={option.hint ? `${option.label}. ${option.hint}` : option.label}
          className={cn(
            "rounded-[999px] text-muted-foreground transition-colors hover:text-foreground",
            "data-[state=on]:bg-surface-inverse data-[state=on]:text-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal disabled:pointer-events-none disabled:opacity-40",
            size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
          )}
        >
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
