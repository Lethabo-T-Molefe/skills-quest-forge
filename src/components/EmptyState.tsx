import type { ReactNode } from "react";
import { media } from "@/config/media";

export function EmptyState({
  label,
  title,
  body,
  action,
}: {
  label?: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="aspect-[16/7] overflow-hidden bg-surface-alt">
        <img src={media.empty.src} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="px-6 py-10 text-center">
        {label ? <p className="label-paren">({label})</p> : null}
        <h2 className="heading-2 mt-1">{title}</h2>
        <p className="mx-auto mt-3 max-w-[55ch] text-sm text-muted-foreground">{body}</p>
        {action ? <div className="mt-6 flex justify-center gap-2">{action}</div> : null}
      </div>
    </div>
  );
}
