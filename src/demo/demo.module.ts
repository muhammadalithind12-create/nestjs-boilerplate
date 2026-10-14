import { Module } from "@nestjs/common";
import { AppModule } from "../app.module.js";
import { RootController } from "./root.controller.js";

/**
 * Demo application module.
 *
 * Wraps the boilerplate's {@link AppModule} and adds the demo-only root
 * controller. The library code itself stays untouched so this module mirrors
 * exactly what a consumer of the boilerplate would write.
 */
@Module({
  imports: [AppModule],
  controllers: [RootController],
})
export class DemoModule {}
