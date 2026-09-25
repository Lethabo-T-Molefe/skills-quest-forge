import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({ code, label = "Generated SQL" }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  return (
    <div className="border border-border bg-surface-inverse text-background">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <p className="label-paren text-white/60">({label})</p>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? <Check className="size-3.5" strokeWidth={1.75} /> : <Copy className="size-3.5" strokeWidth={1.5} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">{code}</pre>
    </div>
  );
}
