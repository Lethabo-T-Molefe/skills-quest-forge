import { Info } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export type InfoContent = {
  what: string;
  calculation?: string;
  source?: string;
  updated?: string;
};

export function InfoHint({ title, content, className = "" }: { title?: string; content: InfoContent; className?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={e => e.stopPropagation()}
          className={`inline-flex items-center justify-center size-4 rounded-full border border-ink/40 text-ink/50 hover:border-ink hover:text-ink hover:bg-muted shrink-0 transition-colors ${className}`}
          aria-label={`About ${title ?? "this metric"}`}
        >
          <Info className="size-2.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="sw-card w-80 p-0 bg-card text-sm" align="start">
        {title && <div className="px-4 py-3 border-b border-border font-display font-extrabold uppercase tracking-tight text-xs">{title}</div>}
        <div className="p-4 flex flex-col gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">What it means</div>
            <div className="text-foreground">{content.what}</div>
          </div>
          {content.calculation && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">How it's calculated</div>
              <div className="text-foreground">{content.calculation}</div>
            </div>
          )}
          {content.source && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Data source</div>
              <div className="text-foreground font-mono text-xs">{content.source}</div>
            </div>
          )}
          {content.updated && (
            <div className="text-xs text-muted-foreground border-t border-border pt-2">{content.updated}</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
