import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { DayPicker } from "react-day-picker";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

function formatDay(date?: Date) {
  if (!date) return "Choose a date";
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function DatePicker({
  label,
  value,
  onChange,
}: {
  label?: string;
  value?: Date | undefined;
  onChange: (date?: Date) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <label className="block text-sm">
      {label ? <span className="font-medium">{label}</span> : null}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              "mt-1.5 inline-flex w-full items-center justify-between rounded-[999px] border border-line-strong bg-surface-raised px-4 py-2.5 text-left text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal",
            )}
          >
            <span className={value ? "" : "text-muted-foreground"}>{formatDay(value)}</span>
            <CalendarDays className="size-4 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            className="z-50 border border-border bg-surface-raised p-3"
          >
            <DayPicker
              mode="single"
              selected={value}
              onSelect={(date) => {
                onChange(date);
                setOpen(false);
              }}
              className="text-sm"
              classNames={{
                months: "flex flex-col",
                month_caption: "flex justify-center py-2 font-medium",
                nav: "flex items-center justify-between",
                button_previous: "rounded-full p-1 hover:bg-accent",
                button_next: "rounded-full p-1 hover:bg-accent",
                weekdays: "grid grid-cols-7 text-xs text-muted-foreground",
                weekday: "py-1 text-center",
                weeks: "mt-1",
                week: "grid grid-cols-7",
                day: "text-center",
                day_button: "size-8 hover:bg-accent",
                selected: "bg-surface-inverse text-background",
                today: "text-signal-strong",
                outside: "text-muted-foreground/50",
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </label>
  );
}
