import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../common/decorators/roles.decorator.js";

/**
 * Root controller for the ForgeAPI demo instance.
 *
 * Exposes a public landing payload so visitors (and uptime monitors) get a
 * friendly JSON overview instead of a 404.
 */
@ApiTags("root")
@Controller()
export class RootController {
  @Public()
  @Get()
  welcome() {
    return {
      name: "ForgeAPI",
      description:
        "Production-grade NestJS REST API demo — auth guards, RBAC, validation, pagination, health checks.",
      version: "1.0.0",
      docs: "/docs",
      health: "/health",
      liveness: "/health/live",
      endpoints: {
        items: "GET /items · POST /items · GET /items/:id (bearer <redacted> required)",
        users: "GET /users · POST /users · GET /users/:id · DELETE /users/:id (bearer <redacted> required, delete needs admin)",
      },
      demoTokens: {
        admin: "forge-admin-token",
        user: "forge-user-token",
      },
    };
  }
}
