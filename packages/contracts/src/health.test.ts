import { describe, expect, it } from "vitest";
import { healthResponseSchema } from "./health.js";

describe("healthResponseSchema", () => {
  it("accepts a valid payload", () => {
    expect(healthResponseSchema.parse({ status: "ok" })).toEqual({ status: "ok" });
  });

  it.each([{}, { status: "down" }, { status: "ok", extra: 1 }, null, "ok"])(
    "rejects malformed payload %j",
    (payload) => {
      expect(healthResponseSchema.safeParse(payload).success).toBe(false);
    },
  );
});
