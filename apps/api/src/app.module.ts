import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./config/env.js";
import { HealthController } from "./health/health.controller.js";
import { OpenMeteoModule } from "./open-meteo/open-meteo.module.js";
import { WeatherModule } from "./weather/weather.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      validate: validateEnv,
    }),
    OpenMeteoModule,
    WeatherModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
