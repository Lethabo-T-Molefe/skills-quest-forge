import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getStoredSession } from "@/lib/auth";
import * as authApi from "@/lib/api/auth";

const navigateMock = vi.fn();
vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    createFileRoute: () => (config: unknown) => config,
    useNavigate: () => navigateMock,
    Link: ({ children, ...props }: { children?: ReactNode; to?: string }) => <a {...props}>{children}</a>,
  };
});
vi.mock("@/lib/api/auth");

const { SignIn } = await import("./signin");

describe("Sign in", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockReset();
    window.localStorage.clear();
  });

  it("persists the session and navigates to /app on a successful login", async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      token: "real.jwt.token",
      user: { id: 1, name: "T. Mokoena", email: "t.mokoena@chieta.org.za", role: "System Admin", is_active: true },
    });
    const user = userEvent.setup();
    render(<SignIn />);

    await user.click(screen.getByRole("button", { name: /enter as system admin/i }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith({ to: "/app" }));
    expect(authApi.login).toHaveBeenCalledWith("t.mokoena@chieta.org.za", "chieta");
    expect(getStoredSession()?.user.email).toBe("t.mokoena@chieta.org.za");
  });

  it("shows the server's error and does not navigate on a failed login", async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error("Invalid email or password"));
    const user = userEvent.setup();
    render(<SignIn />);

    await user.click(screen.getByRole("button", { name: /enter as system admin/i }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(getStoredSession()).toBeNull();
  });

  it("switches the login email when a different role card is selected", async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      token: "t",
      user: { id: 2, name: "S. Naidoo", email: "s.naidoo@chieta.org.za", role: "Data Steward", is_active: true },
    });
    const user = userEvent.setup();
    render(<SignIn />);

    await user.click(screen.getByRole("button", { name: "Data Steward" }));
    await user.click(screen.getByRole("button", { name: /enter as data steward/i }));

    await waitFor(() => expect(authApi.login).toHaveBeenCalledWith("s.naidoo@chieta.org.za", "chieta"));
  });
});
