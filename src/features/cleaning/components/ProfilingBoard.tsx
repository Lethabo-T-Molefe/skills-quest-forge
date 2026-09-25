import { Chip, HelpTip, Panel } from "@/components";
import { formatNumber } from "@/lib/format";
import type { CleaningProfile } from "../types";

export function ProfilingBoard({ profile }: { profile: CleaningProfile }) {
  return (
    <div className="space-y-6">
      <Panel>
        <p className="label-paren">(in plain words)</p>
        <h2 className="heading-2 mt-1">What the file is like, before we change it</h2>
        <p className="mt-3 max-w-[68ch] text-sm text-muted-foreground">
          Profiling is the measurement step. We count empty cells, list the shapes of values, look for columns that
          should determine each other, and check whether IDs exist in the master list. Nothing is rewritten.
        </p>
        <div className="num mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-3">
          {profile.dimensions.map((item) => (
            <div key={item.name} className="bg-surface-raised p-4">
              <p className="font-sans text-xs text-muted-foreground">{item.name}</p>
              <p className="mt-1 font-display text-2xl font-light">{item.score}</p>
              <p className="mt-2 font-sans text-xs text-muted-foreground">{item.note}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <h2 className="heading-2">Column profile</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Type, emptiness, distinct count, and the centre of numeric columns. Measured on{" "}
          <span className="num">{formatNumber(profile.rows)}</span> rows.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-strong text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Column</th>
                <th className="py-2 pr-3 font-medium">Declared</th>
                <th className="py-2 pr-3 font-medium">Inferred</th>
                <th className="py-2 pr-3 font-medium">Nulls</th>
                <th className="py-2 pr-3 font-medium">Distinct</th>
                <th className="py-2 pr-3 font-medium">Median</th>
                <th className="py-2 font-medium">Missingness</th>
              </tr>
            </thead>
            <tbody>
              {profile.columns.map((column) => (
                <tr key={column.name} className="border-b border-border last:border-0 align-top">
                  <td className="py-2.5 pr-3 font-medium">
                    {column.name}
                    {column.masked ? <span className="ml-2 text-xs text-signal-strong">masked</span> : null}
                  </td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{column.declaredType}</td>
                  <td className="py-2.5 pr-3">{column.inferredType}</td>
                  <td className={`num py-2.5 pr-3 ${column.nullPct > 5 ? "text-signal-strong" : "text-muted-foreground"}`}>
                    {column.nullPct}%
                  </td>
                  <td className="num py-2.5 pr-3 text-muted-foreground">{formatNumber(column.distinct)}</td>
                  <td className="num py-2.5 pr-3 text-muted-foreground">{column.median ?? "—"}</td>
                  <td className="py-2.5">
                    <Chip tone={column.missingness === "none" ? "ok" : column.missingness === "MNAR" ? "signal" : "warn"}>
                      {column.missingness}
                    </Chip>
                    <p className="mt-1 max-w-[36ch] text-xs text-muted-foreground">{column.missingNote}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <h2 className="heading-2">Pattern profile</h2>
        <p className="mt-2 max-w-[68ch] text-sm text-muted-foreground">
          Each value is reduced to a shape. Rare shapes are usually typing errors. 0821234567 becomes 9999999999.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {profile.columns
            .filter((column) => column.patterns.length > 1 || column.patterns.some((item) => item.rare))
            .map((column) => (
              <div key={column.name}>
                <p className="text-sm font-medium">{column.name}</p>
                <ul className="mt-2 space-y-1 font-mono text-xs">
                  {column.patterns.map((item) => (
                    <li key={item.pattern} className="flex justify-between gap-3">
                      <span>
                        {item.pattern}
                        {item.rare ? <span className="ml-2 font-sans text-signal-strong">rare</span> : null}
                      </span>
                      <span className="num text-muted-foreground">{formatNumber(item.count)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="heading-2">How the blanks happen</h2>
          <p className="mt-3 text-sm">
            Little&apos;s MCAR test · {profile.littlesMcar.statistic} · p = {profile.littlesMcar.pValue}
          </p>
          <p className="mt-2 max-w-[58ch] text-sm text-muted-foreground">{profile.littlesMcar.reading}</p>
          <div className="mt-4">
            <HelpTip title="What MCAR, MAR and MNAR mean">
              <p>
                <strong className="text-foreground">MCAR</strong> — the blank is unrelated to anything. Dropping those
                rows is unbiased but wasteful.
              </p>
              <p className="mt-2">
                <strong className="text-foreground">MAR</strong> — the blank depends on other columns we can see. Filling
                from those columns is valid.
              </p>
              <p className="mt-2">
                <strong className="text-foreground">MNAR</strong> — the blank depends on the missing value itself. We keep
                a flag, or we model why it is hidden.
              </p>
            </HelpTip>
          </div>
        </Panel>
        <Panel>
          <h2 className="heading-2">Keys, dependencies, orphans</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {profile.candidateKeys.map((key) => (
              <li key={key}>
                <p className="text-xs text-muted-foreground">Candidate key</p>
                <p>{key}</p>
              </li>
            ))}
            {profile.dependencies.map((item) => (
              <li key={`${item.left}-${item.right}`}>
                <p className="text-xs text-muted-foreground">
                  {item.left} → {item.right}
                </p>
                <p>
                  {item.hold ? "Holds" : "Does not hold"} · {item.support}
                </p>
              </li>
            ))}
            {profile.crossTable.map((item) => (
              <li key={item.parent}>
                <p className="text-xs text-muted-foreground">
                  {item.child} vs {item.parent}
                </p>
                <p>
                  {item.orphanPct}% orphans. {item.note}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
