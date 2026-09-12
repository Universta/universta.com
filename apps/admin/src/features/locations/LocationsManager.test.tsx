import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocationsManager } from "./LocationsManager";

const authFetch = vi.fn();

vi.mock("@/features/auth/auth-client", () => ({
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => authFetch(input, init),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/locations",
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

function response(data: unknown) {
  return Promise.resolve({
    ok: true,
    json: async () => ({ data, error: null }),
  } as Response);
}

describe("LocationsManager", () => {
  beforeEach(() => {
    authFetch.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/states")) return response([]);
      if (url.endsWith("/cities")) {
        return response([
          {
            id: "legacy-city",
            name: "Legacy City",
            slug: "legacy-city",
            shortDescription: null,
            isFeatured: false,
            status: "PUBLISHED",
            country: null,
            state: null,
          },
        ]);
      }
      if (url.includes("/countries?limit=100")) return response([]);
      throw new Error(`Unexpected request: ${url}`);
    });
  });

  it("keeps the locations page usable when a legacy city has no linked country", async () => {
    render(<LocationsManager />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "1 legacy location record is not shown because the linked country no longer exists.",
    );
    expect(screen.getByText("No cities yet.")).toBeVisible();
    expect(screen.queryByText("Legacy City")).not.toBeInTheDocument();
  });
});
