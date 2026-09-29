import { Chip, CodeBlock, TabsContent, TabsList, TabsRoot, TabsTrigger } from "@/components";
import { cn } from "@/lib/utils";
import type { CleaningChapter, CleaningDepth, CleaningMethod } from "../types";

/**
 * One cleaning step: what the problem is and what was found, the methods to choose from,
 * and the chosen method's before-and-after, reasoning and code side by side.
 */
export function ChapterWorkbench({
  chapter,
  methods,
  selected,
  depth,
  onSelect,
}: {
  chapter: CleaningChapter;
  methods: CleaningMethod[];
  selected: CleaningMethod;
  depth: CleaningDepth;
  onSelect: (methodId: string) => void;
}) {
  const everyday = methods.filter((item) => item.audience === "everyday");
  const shown = depth === "expert" || everyday.length === 0 ? methods : everyday;
  const hidden = methods.length - shown.length;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div>
        <p className="max-w-[68ch] text-sm">{chapter.plain}</p>
        <div className="mt-3 bg-surface-alt px-4 py-3 text-sm">
          <p className="text-xs font-medium text-muted-foreground">What we found in this file</p>
          <p className="mt-1">{chapter.finding}</p>
        </div>
        {depth === "expert" ? <p className="mt-3 max-w-[68ch] text-xs text-muted-foreground">{chapter.expert}</p> : null}

        <h3 className="font-sans mt-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Choose a method</h3>
        <div className="mt-2 space-y-2" role="radiogroup" aria-label={`Method for ${chapter.title}`}>
          {shown.map((item) => {
            const checked = selected.id === item.id;
            return (
              <label
                key={item.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors",
                  checked ? "border-transparent bg-surface-inverse text-background" : "border-line-strong hover:bg-accent/40",
                )}
              >
                <input
                  type="radio"
                  name={`method-${chapter.id}`}
                  value={item.id}
                  checked={checked}
                  onChange={() => onSelect(item.id)}
                  className="mt-1 accent-[var(--signal)]"
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{item.name}</span>
                    {item.recommended ? <Chip tone={checked ? "neutral" : "ok"}>suggested</Chip> : null}
                    {item.audience === "expert" ? <Chip>expert</Chip> : null}
                  </span>
                  <span className={cn("mt-0.5 block text-xs", checked ? "text-white/70" : "text-muted-foreground")}>
                    {item.plain}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {hidden > 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {hidden} expert {hidden === 1 ? "method is" : "methods are"} hidden. Switch to Expert above to see{" "}
            {hidden === 1 ? "it" : "them"}.
          </p>
        ) : null}
      </div>

      <TabsRoot key={selected.id} defaultValue="preview" className="min-w-0">
        <TabsList aria-label="About the chosen method">
          <TabsTrigger value="preview">Before and after</TabsTrigger>
          <TabsTrigger value="why">Why this method</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="mt-3">
          <div className="grid grid-cols-2 gap-px border border-border bg-border">
            <div className="bg-surface-raised p-3">
              <p className="text-xs text-muted-foreground">Before</p>
              <ul className="mt-2 space-y-1 font-mono text-sm">
                {selected.preview.before.map((item, index) => (
                  <li key={`before-${index}-${item}`} className="truncate" title={item}>
                    {item || <span className="text-muted-foreground">(empty)</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface-raised p-3">
              <p className="text-xs text-muted-foreground">After, on a sample</p>
              <ul className="mt-2 space-y-1 font-mono text-sm">
                {selected.preview.after.map((item, index) => (
                  <li key={`after-${index}-${item}`} className="truncate" title={item}>
                    {item || <span className="text-muted-foreground">(empty)</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Affects {selected.affected}. The full file is only changed when you finish, and bronze stays as it arrived.
          </p>
        </TabsContent>
        <TabsContent value="why" className="mt-3 space-y-3 text-sm">
          <p>{selected.expert}</p>
          <p className="bg-surface-alt px-3 py-2">
            <strong className="font-medium">Take care. </strong>
            {selected.caution}
          </p>
        </TabsContent>
        <TabsContent value="code" className="mt-3">
          <CodeBlock code={selected.code} label="Recorded transform" />
          <p className="mt-2 text-xs text-muted-foreground">This exact transform is saved in the recipe, so the result can be reproduced.</p>
        </TabsContent>
      </TabsRoot>
    </div>
  );
}
