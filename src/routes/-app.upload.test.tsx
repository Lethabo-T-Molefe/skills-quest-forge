import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Page } from "./app.upload";
import { uploadDataset } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  uploadDataset: vi.fn(),
}));

const mockedUpload = vi.mocked(uploadDataset);

function makeFile(name = "grants.csv") {
  return new File(["grant_id,allocated\nDG-1,500000\n"], name, { type: "text/csv" });
}

describe("Upload Dataset wizard", () => {
  beforeEach(() => {
    mockedUpload.mockReset();
  });

  it("disables Continue until a file is selected", () => {
    render(<Page />);
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
  });

  it("enables Continue and shows the file name once a file is chosen", async () => {
    const user = userEvent.setup();
    render(<Page />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeFile());

    expect(screen.getByRole("button", { name: /continue/i })).toBeEnabled();
    expect(screen.getByText(/grants\.csv/)).toBeInTheDocument();
  });

  it("uploads the file and advances to the Metadata step on success", async () => {
    mockedUpload.mockResolvedValue({
      id: 1,
      name: "grants",
      original_filename: "grants.csv",
      content_type: "text/csv",
      size_bytes: 30,
      row_count: 4,
      column_count: 2,
      warehouse_schema: "bronze",
      warehouse_table: "grants",
      columns: [
        { name: "grant_id", data_type: "TEXT" },
        { name: "allocated", data_type: "BIGINT" },
      ],
      owner: null,
      description: "",
      tags: [],
      classification: "INTERNAL–General",
      version: 1,
      previous_version_id: null,
      masked_columns: [],
    });
    const user = userEvent.setup();
    render(<Page />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeFile());
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => expect(screen.getByText(/Step 2 of 3/)).toBeInTheDocument());
    expect(mockedUpload).toHaveBeenCalledWith(expect.any(File), "grants");
  });

  it("shows the error and stays on step 1 when the upload fails", async () => {
    mockedUpload.mockRejectedValue(new Error("Unsupported file type: .csv"));
    const user = userEvent.setup();
    render(<Page />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeFile());
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() =>
      expect(screen.getByText("Unsupported file type: .csv")).toBeInTheDocument()
    );
    expect(screen.getByText(/Step 1 of 3/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeEnabled();
  });

  it("shows real row/column counts on the profiling step, not hardcoded mock numbers", async () => {
    mockedUpload.mockResolvedValue({
      id: 2,
      name: "learners",
      original_filename: "learners.json",
      content_type: "application/json",
      size_bytes: 500,
      row_count: 777,
      column_count: 3,
      warehouse_schema: "bronze",
      warehouse_table: "learners",
      columns: [{ name: "learner_id", data_type: "TEXT" }],
      owner: null,
      description: "",
      tags: [],
      classification: "INTERNAL–General",
      version: 1,
      previous_version_id: null,
      masked_columns: [],
    });
    const user = userEvent.setup();
    render(<Page />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeFile("learners.json"));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await waitFor(() => expect(screen.getByText(/Step 2 of 3/)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByText("777")).toBeInTheDocument();
    expect(screen.getByText("bronze.learners")).toBeInTheDocument();
    expect(screen.getByText("learner_id")).toBeInTheDocument();
  });
});
