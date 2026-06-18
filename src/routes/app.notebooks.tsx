import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Badge } from "@/components/lab/panel";
import { CodeEditor } from "@/components/lab/code-editor";
import { Play } from "lucide-react";

export const Route = createFileRoute("/app/notebooks")({ component: Page });

function Page() {
  return (
    <>
      <PageHeader title="Notebooks" subtitle="Jupyter-style data science environment" actions={
        <button className="text-sm px-3 py-2 rounded-md bg-primary text-primary-foreground">+ New Notebook</button>
      } />

      <Panel title="completion-predictor.ipynb" subtitle="Last run: 14 Jun 2026 · L. Patel">
        <div className="space-y-3">
          {[
            { type: "md", content: "# Learner Completion Model — feature engineering" },
            { type: "code", content: "import pandas as pd\nfrom sklearn.ensemble import GradientBoostingClassifier\n\ndf = pd.read_sql('SELECT * FROM mart.completion_rates', conn)\ndf.head()", out: "DataFrame[12 rows × 8 cols]" },
            { type: "code", content: "features = ['province','programme','provider','funding','prev_rate']\nX, y = df[features], df['completed']\nmodel = GradientBoostingClassifier().fit(X, y)\nmodel.score(X, y)", out: "0.847" },
          ].map((c, i) => (
            <div key={i} className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted text-xs">
                <Badge tone={c.type === "code" ? "info" : "muted"}>{c.type === "code" ? "py" : "md"}</Badge>
                {c.type === "code" && <button className="ml-auto text-xs inline-flex items-center gap-1"><Play className="size-3" /> Run</button>}
              </div>
              {c.type === "code" ? (
                <CodeEditor value={c.content} language="python" readOnly height="auto" />
              ) : (
                <pre className="p-3 text-xs font-mono whitespace-pre-wrap">{c.content}</pre>
              )}
              {c.out && <div className="px-3 py-2 border-t border-border bg-background text-xs font-mono text-success">→ {c.out}</div>}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
