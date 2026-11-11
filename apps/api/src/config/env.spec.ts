import { validateEnv } from "./env.js";

const valid = {
  NODE_ENV: "development",
  PORT: "3000",
  DATABASE_URL: "postgresql://u:secretpw@localhost:5432/atmos",
  REDIS_URL: "redis://localhost:6379",
};

describe("validateEnv", () => {
  it("accepts valid settings", () => {
    expect(validateEnv(valid).PORT).toBe(3000);
  });

  it.each([
    ["NODE_ENV", "staging"],
    ["PORT", "0"],
    ["PORT", "abc"],
    ["DATABASE_URL", "mysql://secretpw@h/db"],
    ["REDIS_URL", "not-a-url"],
  ])("rejects invalid %s without leaking the value", (key, value) => {
    expect(() => validateEnv({ ...valid, [key]: value })).toThrow(key);
    try {
      validateEnv({ ...valid, [key]: value });
    } catch (e) {
      expect((e as Error).message).not.toContain(value);
    }
  });

  it.each(Object.keys(valid))("rejects missing %s", (key) => {
    const { [key]: _omit, ...rest } = valid as Record<string, string>;
    expect(() => validateEnv(rest)).toThrow(key);
  });
});
