/**
 * Vercel serverless entry for the ForgeAPI NestJS demo.
 *
 * Plain JavaScript (no TS compile step needed for the function itself) that
 * reuses the compiled `dist/` output. The Nest application is bootstrapped
 * once per lambda cold start with `app.init()` (no `listen()`); the underlying
 * Express instance then handles each request. In-memory stores are seeded on
 * every cold start, so demo data is always fresh.
 */
import "reflect-metadata";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { DemoModule } from "../dist/demo/demo.module.js";
import { AuthGuard } from "../dist/common/guards/auth.guard.js";
import { InMemoryTokenVerifier } from "../dist/common/auth/token-verifier.js";
import { LoggingInterceptor } from "../dist/common/interceptors/logging.interceptor.js";
import { SchemaValidationPipe } from "../dist/common/pipes/validation.pipe.js";
import {
  CreateItemDto,
  validateCreateItemDto,
} from "../dist/items/dto/create-item.dto.js";
import {
  CreateUserDto,
  validateCreateUserDto,
} from "../dist/users/dto/create-user.dto.js";
import { ItemsService } from "../dist/items/items.service.js";
import { UsersService } from "../dist/users/users.service.js";

/** Demo bearer tokens accepted by this instance (same as the demo server). */
const DEMO_TOKENS = {
  admin: "forge-admin-token",
  user: "forge-user-token",
};

/** Seed the in-memory stores so the demo is explorable immediately. */
async function seedDemoData(app) {
  const items = app.get(ItemsService);
  const users = app.get(UsersService);

  const demoItems = [
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

  const demoUsers = [
    { name: "Ayesha Khan", email: "ayesha@forgeapi.demo", roles: ["admin"] },
    { name: "Bilal Ahmed", email: "bilal@forgeapi.demo" },
    { name: "Sara Malik", email: "sara@forgeapi.demo" },
  ];
  for (const user of demoUsers) {
    users.create(user);
  }
}

let expressApp = null;

async function getExpressApp() {
  if (expressApp) return expressApp;

  const app = await NestFactory.create(DemoModule, { logger: ["log", "error", "warn"] });

  app.useGlobalInterceptors(new LoggingInterceptor());

  const tokenVerifier = new InMemoryTokenVerifier({
    [DEMO_TOKENS.admin]: { id: "demo-admin", roles: ["admin"] },
    [DEMO_TOKENS.user]: { id: "demo-user", roles: ["user"] },
  });
  app.useGlobalGuards(new AuthGuard(app.get(Reflector), tokenVerifier));

  const validationPipe = new SchemaValidationPipe();
  validationPipe.register(CreateItemDto, validateCreateItemDto);
  validationPipe.register(CreateUserDto, validateCreateUserDto);
  app.useGlobalPipes(validationPipe);

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
  await app.init();

  expressApp = app.getHttpAdapter().getInstance();
  return expressApp;
}

export default async function handler(req, res) {
  const express = await getExpressApp();
  express(req, res);
}
