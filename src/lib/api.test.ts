import { afterEach, describe, expect, it, vi } from "vitest";
import { getPlaygroundLinks, uploadDataset, type PlaygroundLinks } from "./api";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe("getPlaygroundLinks", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed playground links on success", async () => {
    const links: PlaygroundLinks = {
      jupyterhub: { url: "http://localhost:8100", label: "JupyterHub", description: "d" },
      superset: { url: "http://localhost:8088", label: "Superset", description: "d" },
      mlflow: { url: "http://localhost:5000", label: "MLflow", description: "d" },
      codeServer: { url: "http://localhost:8443", label: "code-server", description: "d" },
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(links));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPlaygroundLinks();

    expect(result).toEqual(links);
    expect(fetchMock.mock.calls[0][0]).toContain("/playground/links");
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, false, 500)));

    await expect(getPlaygroundLinks()).rejects.toThrow("GET /playground/links failed: 500");
  });
});

describe("uploadDataset", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts a multipart form with the file and name, returns the parsed dataset", async () => {
    const dataset = {
      id: 1,
      name: "Grants",
      original_filename: "grants.csv",
      content_type: "text/csv",
      size_bytes: 10,
      row_count: 2,
      column_count: 2,
      warehouse_schema: "bronze",
      warehouse_table: "grants",
      columns: [],
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(dataset));
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["a,b\n1,2\n"], "grants.csv", { type: "text/csv" });

    const result = await uploadDataset(file, "Grants");

    expect(result).toEqual(dataset);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/datasets/upload");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("file")).toBe(file);
    expect(options.body.get("name")).toBe("Grants");
  });

  it("throws the server's error detail when the upload fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ detail: "Unsupported file type: .parquet" }, false, 400))
    );
    const file = new File(["x"], "data.parquet");

    await expect(uploadDataset(file, "Bad")).rejects.toThrow("Unsupported file type: .parquet");
  });

  it("falls back to a generic error when the server gives no JSON body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("not json");
        },
      } as unknown as Response)
    );
    const file = new File(["x"], "data.csv");

    await expect(uploadDataset(file, "X")).rejects.toThrow("POST /datasets/upload failed: 500");
  });
});
