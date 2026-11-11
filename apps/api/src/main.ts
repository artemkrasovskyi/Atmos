import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { validateEnv } from "./config/env.js";

async function bootstrap() {
  const env = validateEnv(process.env);
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  await app.listen(env.PORT, "0.0.0.0");
  new Logger("Bootstrap").log(`API listening on port ${env.PORT}`);
}

bootstrap().catch((error: unknown) => {
  new Logger("Bootstrap").error(error instanceof Error ? error.message : "Startup failed");
  process.exit(1);
});
