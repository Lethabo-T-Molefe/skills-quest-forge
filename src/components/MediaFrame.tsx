import { cn } from "@/lib/utils";

export function MediaFrame({
  src,
  alt,
  caption,
  ratio = "4 / 3",
  className,
  priority,
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={cn("overflow-hidden bg-surface-alt", className)}>
      <div className="overflow-hidden" style={{ aspectRatio: ratio }}>
        <img
          src={src}
          alt={alt}
          width={1600}
          height={1200}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
        />
      </div>
      {caption ? <figcaption className="mt-2 text-xs text-muted-foreground">{caption}</figcaption> : null}
    </figure>
  );
}
