import { Chip, CodeBlock, HelpTip, Panel } from "@/components";
import type { CleaningChapter, CleaningDepth, CleaningMethod } from "../types";

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
  const expert = methods.filter((item) => item.audience === "expert");
  const shown = depth === "expert" ? methods : everyday.length > 0 ? everyday : methods;

  return (
    <Panel>
      <p className="label-paren">
        ({chapter.number} · {depth === "expert" ? "expert methods" : "the simple choice"})
      </p>
      <h2 className="heading-2 mt-1">{chapter.title}</h2>
      <p className="mt-3 max-w-[68ch] text-sm">{chapter.plain}</p>
      <p className="mt-3 max-w-[68ch] text-sm text-muted-foreground">
        <strong className="font-medium text-foreground">What we found. </strong>
        {chapter.finding}
      </p>
      {depth === "expert" ? (
        <p className="mt-3 max-w-[68ch] text-sm text-muted-foreground">{chapter.expert}</p>
      ) : null}

      <div className="mt-6 space-y-2">
        {shown.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`w-full border px-4 py-3 text-left ${
              selected.id === item.id ? "border-transparent bg-surface-inverse text-background" : "border-line-strong hover:bg-accent/40"
            }`}
          >
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{item.name}</span>
              {item.recommended ? (
                <Chip tone={selected.id === item.id ? "neutral" : "ok"}>suggested</Chip>
              ) : null}
              {item.audience === "expert" ? <Chip>expert</Chip> : null}
            </span>
            <span className={`mt-1 block text-sm ${selected.id === item.id ? "text-white/70" : "text-muted-foreground"}`}>
              {item.plain}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Before</p>
          <ul className="mt-2 space-y-1 font-mono text-sm">
            {selected.preview.before.map((item, index) => (
              <li key={`before-${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">After, on the sample</p>
          <ul className="mt-2 space-y-1 font-mono text-sm">
            {selected.preview.after.map((item, index) => (
              <li key={`after-${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Affects {selected.affected}</p>

      <div className="mt-4">
        <HelpTip title="Why this method?">
          <p>{selected.expert}</p>
          <p className="mt-2">
            <strong className="text-foreground">Take care. </strong>
            {selected.caution}
          </p>
        </HelpTip>
      </div>

      {depth === "expert" ? (
        <div className="mt-5">
          <CodeBlock code={selected.code} label="Recorded transform" />
        </div>
      ) : (
        <div className="mt-4">
          <HelpTip title="Show the code for this step">
            <CodeBlock code={selected.code} label="Recorded transform" />
          </HelpTip>
        </div>
      )}

      {depth === "expert" && expert.length > 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Everyday choices sit with a suggested mark. Expert methods stay in the same list so the recipe can record
          MICE, linkage, Isolation Forest or a constraint repair without leaving the wizard.
        </p>
      ) : null}
    </Panel>
  );
}
