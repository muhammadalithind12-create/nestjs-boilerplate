import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

/**
 * Module bundling the health controller and service. Import into the root
 * module to expose `/health` and `/health/live`.
 *
 * NOTE: {@link HealthService} is registered via a factory instead of a plain
 * class provider. Its constructor takes injectable clock/uptime functions
 * (typed as `Function`), which the Nest DI container cannot resolve — the
 * factory preserves the service's defaults while keeping the module
 * bootable under a real `tsc` build (which emits decorator metadata).
 */
@Module({
  controllers: [HealthController],
  providers: [{ provide: HealthService, useFactory: () => new HealthService() }],
  exports: [HealthService],
})
export class HealthModule {}
