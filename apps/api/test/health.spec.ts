import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";

const validEnv = {
  NODE_ENV: "test",
  PORT: "3000",
  // Unreachable on purpose: health must stay 200 while dependencies are down.
  DATABASE_URL: "postgresql://atmos:atmos@127.0.0.1:1/atmos",
  REDIS_URL: "redis://127.0.0.1:1",
};

// ConfigModule.forRoot validates env at import time, so set it first.
Object.assign(process.env, validEnv);
const { AppModule } = await import("../src/app.module.js");

describe("GET /api/health", () => {
  let app: INestApplication;
  const saved = { ...process.env };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.env = saved;
  });

  it("returns 200 and exactly { status: 'ok' } without auth, with dependencies unavailable", async () => {
    const res = await request(app.getHttpServer()).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
