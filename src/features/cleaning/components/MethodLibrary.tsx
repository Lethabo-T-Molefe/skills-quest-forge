import { Chip, CodeBlock, HelpTip } from "@/components";
import { methodFamilies } from "../data/catalogue";
import type { CleaningChapter, CleaningMethod } from "../types";

export function MethodLibrary({
  chapters,
  methods,
  onPick,
}: {
  chapters: CleaningChapter[];
  methods: CleaningMethod[];
  onPick: (methodId: string) => void;
}) {
  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Every family from profiling through governance. Pick a method to add it to the recipe at the matching chapter.
        Everyday methods are marked. Expert methods stay available so a practitioner does not leave the wizard.
      </p>

      <ul className="space-y-3 text-sm">
        {methodFamilies.map((family) => (
          <li key={family.id}>
            <p className="font-medium">{family.title}</p>
            <p className="mt-1 text-muted-foreground">{family.body}</p>
          </li>
        ))}
      </ul>

      <HelpTip title="How the work is done, and when">
        <p>
          Preventive checks belong at the form. This wizard is batch cleaning on a landed file. Streaming would route
          bad rows to a dead-letter queue. Continuous monitors watch freshness and drift after silver exists.
        </p>
        <p className="mt-2">
          Methods can be manual, rule-based, statistical, learned, constraint-based, knowledge-based, or
          human-in-the-loop. An LLM may propose a mapping; the recipe still records a deterministic transform and a
          steward can refuse it.
        </p>
        <p className="mt-2">
          Bronze is never overwritten. Every accepted step is an audit line. The recipe is versioned so the same silver
          table can be reproduced.
        </p>
      </HelpTip>

      {chapters
        .filter((chapter) => chapter.kind === "transform")
        .map((chapter) => {
          const items = methods.filter((item) => item.chapterId === chapter.id);
          return (
            <section key={chapter.id}>
              <p className="label-paren">({chapter.number})</p>
              <h3 className="heading-2 mt-1">{chapter.title}</h3>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="w-full border border-border px-3 py-2 text-left text-sm hover:bg-accent/40"
                      onClick={() => onPick(item.id)}
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        {item.recommended ? <Chip tone="ok">suggested</Chip> : null}
                        <Chip>{item.audience}</Chip>
                      </span>
                      <span className="mt-1 block text-muted-foreground">{item.plain}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

      <div>
        <p className="text-xs text-muted-foreground">The selected method&apos;s transform is always inspectable.</p>
        <div className="mt-3">
          <CodeBlock
            label="Recipe contract"
            code={`# Each accepted step stores
#   method_id, parameters, sample_preview, full_row_count
# Replay must match the sample preview on the same bronze version.`}
          />
        </div>
      </div>
    </div>
  );
}
