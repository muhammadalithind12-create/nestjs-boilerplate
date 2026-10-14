import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter.js";
import { HealthModule } from "./health/health.module.js";
import { ItemsModule } from "./items/items.module.js";
import { UsersModule } from "./users/users.module.js";

/**
 * Root application module wiring together every feature module and the
 * cross-cutting concerns that ship with the boilerplate.
 *
 * The global exception filter is registered as an `APP_FILTER` provider so it
 * is instantiated through the DI container. The {@link AuthGuard},
 * {@link SchemaValidationPipe} and `LoggingInterceptor` are intentionally
 * left for `main.ts` to register (they require a configured token verifier /
 * DTO registry, or — in the interceptor's case — an injectable clock function
 * that the DI container cannot resolve), keeping this module side-effect
 * free and bootable.
 */
@Module({
  imports: [HealthModule, ItemsModule, UsersModule],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
