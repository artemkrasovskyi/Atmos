import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().int().min(1).max(65535),
  DATABASE_URL: z
    .string()
    .refine((v) => /^postgres(ql)?:\/\//.test(v) && URL.canParse(v)),
  REDIS_URL: z
    .string()
    .refine((v) => /^rediss?:\/\//.test(v) && URL.canParse(v)),
  OPEN_METEO_FORECAST_URL: z.url(),
  OPEN_METEO_GEOCODING_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;

// Diagnostics name the offending keys only, never their values.
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const keys = [
      ...new Set(result.error.issues.map((i) => String(i.path[0]))),
    ];
    throw new Error(
      `Invalid or missing environment settings: ${keys.join(", ")}`,
    );
  }
  return result.data;
}
