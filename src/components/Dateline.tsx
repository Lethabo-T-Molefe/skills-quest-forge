import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

export function Dateline({ city = "Johannesburg" }: { city?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) return <span className="inline-block min-h-[1lh]" aria-hidden="true" />;

  const text = new Intl.DateTimeFormat(siteConfig.locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  return (
    <time dateTime={now.toISOString()} className="num text-sm text-muted-foreground">
      {text}, {city}
    </time>
  );
}
