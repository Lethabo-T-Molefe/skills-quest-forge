import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RoleProvider } from "./role-context";
import { slugifyUsername, useJupyterUserPath } from "./use-playground-links";

describe("slugifyUsername", () => {
  it("strips the domain and lowercases", () => {
    expect(slugifyUsername("S.Naidoo@chieta.org.za")).toBe("s-naidoo");
  });

  it("replaces non [a-z0-9_-] characters with a hyphen", () => {
    expect(slugifyUsername("t mokoena!!")).toBe("t-mokoena");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugifyUsername("--r.mahlangu--@cput.ac.za")).toBe("r-mahlangu");
  });

  it("falls back to 'chieta' when nothing safe is left", () => {
    expect(slugifyUsername("@@@")).toBe("chieta");
    expect(slugifyUsername("")).toBe("chieta");
  });
});

describe("useJupyterUserPath", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  function wrapper({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return (
      <QueryClientProvider client={queryClient}>
        <RoleProvider>{children}</RoleProvider>
      </QueryClientProvider>
    );
  }

  it("builds an auto-login path keyed to the current identity's slug", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("no backend in tests")));
    // A signed-in System Admin session — role now comes from a real stored
    // session (§ auth rewrite), not an implicit "default role".
    window.localStorage.setItem(
      "chieta-data-lab-session",
      JSON.stringify({
        token: "test-token",
        user: { id: 1, name: "T. Mokoena", email: "t.mokoena@chieta.org.za", role: "System Admin", is_active: true },
      })
    );

    const { result } = renderHook(() => useJupyterUserPath(), { wrapper });

    await waitFor(() => expect(result.current.isLive).toBe(false));

    // Signed in as System Admin -> T. Mokoena -> t-mokoena
    expect(result.current.username).toBe("t-mokoena");
    // next must be /hub/spawn/<user>, not /user/<user>/lab directly — the
    // latter 424s on first visit since JupyterHub requires spawns to go
    // through an XSRF-protected POST; /hub/spawn/<user> (no options form
    // configured) triggers the spawn itself via a plain GET.
    expect(result.current.path).toBe(
      "/hub/login?user=t-mokoena&next=%2Fhub%2Fspawn%2Ft-mokoena"
    );
    expect(result.current.service.url).toContain("8100");
  });
});
