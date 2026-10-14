import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../common/decorators/roles.decorator.js";
import type { HealthReport } from "./health.service.js";
import { HealthService } from "./health.service.js";

/**
 * Health-check controller exposing standard probes for orchestrators and
 * load balancers. All routes are {@link Public} so they bypass auth.
 *
 * Routes:
 * - `GET /health`         -> full readiness report (503 when any check is down)
 * - `GET /health/live`    -> liveness probe (always 200 while the process runs)
 */
@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    @Inject(HealthService) private readonly health: HealthService,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async readiness(): Promise<HealthReport> {
    const report = await this.health.check();
    if (report.status !== "ok") {
      throw new ServiceUnavailableException(report);
    }
    return report;
  }

  @Public()
  @Get("live")
  @HttpCode(HttpStatus.OK)
  liveness(): { status: "ok" } {
    return this.health.liveness();
  }
}
