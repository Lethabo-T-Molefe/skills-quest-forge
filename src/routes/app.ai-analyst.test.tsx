import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Page } from "./app.ai-analyst";
import { askQuestion, getHistory } from "@/lib/api/ai-analyst";
import { runSql } from "@/lib/api/analytics";

vi.mock("@/lib/api/ai-analyst", () => ({
  askQuestion: vi.fn(),
  getHistory: vi.fn(),
}));
vi.mock("@/lib/api/analytics", () => ({
  runSql: vi.fn(),
}));
// Real CodeMirror throws in jsdom (no getClientRects); swap in a plain textarea.
vi.mock("@/components/lab/code-editor", () => ({
  CodeEditor: ({ value, onChange }: { value: string; onChange?: (v: string) => void }) => (
    <textarea aria-label="sql-editor" value={value} onChange={(e) => onChange?.(e.target.value)} />
  ),
}));

const mockedAsk = vi.mocked(askQuestion);
const mockedHistory = vi.mocked(getHistory);
const mockedRunSql = vi.mocked(runSql);

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("AI Analyst page", () => {
  beforeEach(() => {
    mockedAsk.mockReset();
    mockedHistory.mockReset().mockResolvedValue([]);
    mockedRunSql.mockReset();
  });

  it("asks a question and populates the SQL editor with the generated query", async () => {
    mockedAsk.mockResolvedValue({
      question: "total allocated by province",
      sql: "SELECT province, SUM(allocated) AS sum_allocated FROM bronze.grants GROUP BY province",
      explanation: "Summed allocated, grouped by province, highest first.",
      confidence: "high",
      columns: ["province", "sum_allocated"],
      rows: [["Gauteng", 500000]],
      chart: { type: "bar", x: "province", keys: ["sum_allocated"] },
    });
    const user = userEvent.setup();
    render(<Page />, { wrapper });

    await user.type(screen.getByPlaceholderText(/total allocated by province/i), "total allocated by province");
    await user.click(screen.getByRole("button", { name: /^ask$/i }));

    await waitFor(() => expect(mockedAsk.mock.calls[0]?.[0]).toBe("total allocated by province"));
    expect(await screen.findByText(/Summed allocated, grouped by province/)).toBeInTheDocument();
    expect(screen.getByLabelText("sql-editor")).toHaveValue(
      "SELECT province, SUM(allocated) AS sum_allocated FROM bronze.grants GROUP BY province"
    );
  });

  it("re-runs edited SQL through the existing analytics endpoint, not a new ask", async () => {
    mockedAsk.mockResolvedValue({
      question: "top 5 grants by spent",
      sql: "SELECT * FROM bronze.grants ORDER BY spent DESC LIMIT 5",
      explanation: "Showing the 5 rows in grants with the highest spent.",
      confidence: "high",
      columns: ["grant_id", "spent"],
      rows: [["DG-1", 100]],
      chart: { type: "table", x: null, keys: [] },
    });
    mockedRunSql.mockResolvedValue({
      columns: ["grant_id", "spent"],
      rows: [["DG-2", 999]],
    });
    const user = userEvent.setup();
    render(<Page />, { wrapper });

    await user.type(screen.getByPlaceholderText(/total allocated by province/i), "top 5 grants by spent");
    await user.click(screen.getByRole("button", { name: /^ask$/i }));
    await screen.findByText(/Showing the 5 rows/);

    await user.click(screen.getByRole("button", { name: /^run$/i }));

    await waitFor(() =>
      expect(mockedRunSql.mock.calls[0]?.[0]).toBe(
        "SELECT * FROM bronze.grants ORDER BY spent DESC LIMIT 5"
      )
    );
    expect(await screen.findByText("DG-2")).toBeInTheDocument();
  });

  it("shows a low-confidence banner for unparseable questions", async () => {
    mockedAsk.mockResolvedValue({
      question: "asdkjaslkdj",
      sql: "SELECT * FROM bronze.grants LIMIT 20",
      explanation: "I couldn't confidently tell which dataset you meant.",
      confidence: "low",
      columns: ["grant_id"],
      rows: [["DG-1"]],
      chart: { type: "table", x: null, keys: [] },
    });
    const user = userEvent.setup();
    render(<Page />, { wrapper });

    await user.type(screen.getByPlaceholderText(/total allocated by province/i), "asdkjaslkdj");
    await user.click(screen.getByRole("button", { name: /^ask$/i }));

    expect(await screen.findByText(/wasn't fully sure/i)).toBeInTheDocument();
  });
});
