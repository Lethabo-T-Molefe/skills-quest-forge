import { Check, ChevronDown } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { ScrollPane } from "./ScrollPane";

export function SelectMenu({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Choose",
  id,
}: {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  id?: string;
}) {
  return (
    <label className="block text-sm">
      {label ? <span className="font-medium">{label}</span> : null}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
        <SelectPrimitive.Trigger
          id={id}
          className={cn(
            "mt-1.5 flex w-full items-center justify-between rounded-[999px] border border-line-strong bg-surface-raised px-4 py-2.5 text-left text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal",
            "disabled:opacity-50",
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="size-4 text-muted-foreground" strokeWidth={1.5} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden border border-border bg-surface-raised"
          >
            <ScrollPane className="max-h-72" orientation="vertical">
              <SelectPrimitive.Viewport className="p-1">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className="relative flex cursor-pointer items-center justify-between px-3 py-2 text-sm outline-none data-[highlighted]:bg-accent data-[state=checked]:font-medium"
                  >
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator>
                      <Check className="size-3.5 text-signal-strong" strokeWidth={1.75} />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </ScrollPane>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </label>
  );
}
