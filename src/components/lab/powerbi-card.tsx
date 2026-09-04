import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { PBI_FONT, PBI_TEXT, PBI_SUBTEXT, PBI_BORDER } from "@/lib/powerbi-theme";

// Shared Power BI visual chrome — Fluent's actual card shadow, not CHIETA's
// thick "sw-card" style. Used by both the demo report (powerbi-report.tsx)
// and the user's own Report Builder (powerbi-builder.tsx) so both look like
// the same real Power BI canvas.
export const PBI_VISUAL_SHADOW = "0 1.6px 3.6px rgba(0,0,0,.13), 0 0.3px 0.9px rgba(0,0,0,.11)";

export function PbiCard({ title, subtitle, action, children, className = "" }: {
  title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-[2px] flex flex-col ${className}`}
      style={{ border: `1px solid ${PBI_BORDER}`, boxShadow: PBI_VISUAL_SHADOW, fontFamily: PBI_FONT }}
    >
      <div className="flex items-start justify-between gap-2 px-3 pt-2.5 pb-1">
        <div>
          <div className="text-[13px] font-semibold" style={{ color: PBI_TEXT }}>{title}</div>
          {subtitle && <div className="text-[11px]" style={{ color: PBI_SUBTEXT }}>{subtitle}</div>}
        </div>
        {action ?? <MoreHorizontal className="size-4 shrink-0" style={{ color: PBI_SUBTEXT }} />}
      </div>
      <div className="flex-1 px-2 pb-2 min-h-0">{children}</div>
    </div>
  );
}

export function PbiKpiCard({ label, value, color, narrative }: {
  label: string; value: string; color?: string; narrative?: string;
}) {
  return (
    <div
      className="bg-white rounded-[2px] px-4 py-3 flex flex-col gap-1"
      style={{ border: `1px solid ${PBI_BORDER}`, boxShadow: PBI_VISUAL_SHADOW, fontFamily: PBI_FONT }}
    >
      <div className="text-[11px]" style={{ color: PBI_SUBTEXT }}>{label}</div>
      <div className="text-[26px] font-semibold leading-none" style={{ color: color ?? PBI_TEXT }}>{value}</div>
      {narrative && <div className="text-[11px] mt-0.5" style={{ color: PBI_SUBTEXT }}>{narrative}</div>}
    </div>
  );
}
