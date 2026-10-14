import "reflect-metadata";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { DemoModule } from "./demo.module.js";
import { AuthGuard } from "../common/guards/auth.guard.js";
import { InMemoryTokenVerifier } from "../common/auth/token-verifier.js";
import { LoggingInterceptor } from "../common/interceptors/logging.interceptor.js";
import { SchemaValidationPipe } from "../common/pipes/validation.pipe.js";
import {
  CreateItemDto,
  validateCreateItemDto,
} from "../items/dto/create-item.dto.js";
import {
  CreateUserDto,
  validateCreateUserDto,
} from "../users/dto/create-user.dto.js";
import { ItemsService } from "../items/items.service.js";
import { UsersService } from "../users/users.service.js";

/**
 * Demo bearer <redacted> accepted by this instance.
 * Backed by the boilerplate's {@link InMemoryTokenVerifier} — swap for a JWT
 * verifier in a real deployment.
 */
export const DEMO_TOKENS = {
  admin: "forge-admin-token",
  user: "forge-user-token",
} as const;

/** Seed the in-memory stores so the demo is explorable immediately. */
async function seedDemoData(app: {
  get<T>(type: new (...args: never[]) => T): T;
}): Promise<void> {
  const items = app.get(ItemsService);
  const users = app.get(UsersService);

  const demoItems: Array<{ name: string; description: string }> = [
    { name: "Wireless Mouse", description: "Ergonomic 2.4GHz wireless mouse with silent clicks" },
    { name: "Mechanical Keyboard", description: "Hot-swappable RGB mechanical keyboard, brown switches" },
    { name: "USB-C Hub", description: "7-in-1 USB-C hub with 4K HDMI and 100W pass-through charging" },
    { name: "Monitor Arm", description: "Single gas-spring monitor arm, VESA 75/100 compatible" },
    { name: "Desk Lamp", description: "LED desk lamp with auto-dimming ambient light sensor" },
    { name: "4K Webcam", description: "4K webcam with noise-cancelling dual microphones" },
    { name: "Laptop Stand", description: "Foldable aluminum laptop stand, fits 10 to 17 inch laptops" },
    { name: "Noise-Cancelling Headphones", description: "Over-ear Bluetooth headphones with 40-hour battery life" },
  ];
  for (const item of demoItems) {
    items.create(item);
  }

  const demoUsers: Array<{ name: string; email: string; roles?: Array<"admin" | "user"> }> = [
    { name: "Ayesha Khan", email: "ayesha@forgeapi.demo", roles: ["admin"] },
    { name: "Bilal Ahmed", email: "bilal@forgeapi.demo" },
    { name: "Sara Malik", email: "sara@forgeapi.demo" },
  ];
  for (const user of demoUsers) {
    users.create(user);
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${demoItems.length} items and ${demoUsers.length} users`);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(DemoModule, { logger: ["log", "error", "warn"] });

  // Request logging (manual registration — the interceptor takes an
  // injectable clock the DI container cannot resolve).
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Bearer-token auth (global) — the demo verifier maps the tokens in
  // DEMO_TOKENS to users. Health + root routes opt out via @Public().
  const tokenVerifier = new InMemoryTokenVerifier({
    [DEMO_TOKENS.admin]: { id: "demo-admin", roles: ["admin"] },
    [DEMO_TOKENS.user]: { id: "demo-user", roles: ["user"] },
  });
  app.useGlobalGuards(new AuthGuard(app.get(Reflector), tokenVerifier));

  // DTO validation pipe with the boilerplate's validators registered.
  const validationPipe = new SchemaValidationPipe();
  validationPipe.register(CreateItemDto, validateCreateItemDto);
  validationPipe.register(CreateUserDto, validateCreateUserDto);
  app.useGlobalPipes(validationPipe);

  // OpenAPI / Swagger UI at /docs.
  const swaggerConfig = new DocumentBuilder()
    .setTitle("ForgeAPI Demo")
    .setDescription(
      "Production-grade NestJS REST API demo — bearer-token auth, role-based access control, " +
        "DTO validation, pagination, global error handling and health probes. " +
        "Use the Authorize button with one of the demo tokens below.",
    )
    .setVersion("1.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "opaque", description: "Demo tokens: forge-admin-token (admin) or forge-user-token (user)" },
      "bearer",
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  await seedDemoData(app);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`ForgeAPI demo listening on port ${port} — docs at /docs`);
}

void bootstrap();
