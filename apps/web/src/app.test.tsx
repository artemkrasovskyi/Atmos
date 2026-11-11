import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { healthResponseSchema } from "@atmos/contracts";
import { createAppRouter } from "./router";

afterEach(cleanup);

describe("root route", () => {
  it("renders the Atmos identifier with no provider calls or controls", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const router = createAppRouter(createMemoryHistory({ initialEntries: ["/"] }));
    render(<RouterProvider router={router} />);
    expect(await screen.findByRole("heading", { name: "Atmos" })).toBeTruthy();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("shared health schema in the browser target", () => {
  it("accepts valid and rejects malformed payloads", () => {
    expect(healthResponseSchema.safeParse({ status: "ok" }).success).toBe(true);
    expect(healthResponseSchema.safeParse({ status: "bad" }).success).toBe(false);
  });
});
