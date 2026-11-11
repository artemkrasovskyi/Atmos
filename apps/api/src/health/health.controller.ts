import { Controller, Get } from "@nestjs/common";
import { healthResponseSchema, type HealthResponse } from "@atmos/contracts";

// Process liveness only: does not probe PostgreSQL or Redis.
@Controller("health")
export class HealthController {
  @Get()
  check(): HealthResponse {
    return healthResponseSchema.parse({ status: "ok" });
  }
}
