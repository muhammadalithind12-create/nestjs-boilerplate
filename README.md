<div align="center">

<h1>ForgeAPI</h1>

<p><strong>A production-grade NestJS REST API — live demo of bearer-token auth with RBAC, DTO validation, pagination, health probes, and Swagger docs.</strong></p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![NestJS](https://img.shields.io/badge/NestJS-10-e0234e.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-94%20passing-brightgreen.svg)](#-testing)

</div>

ForgeAPI is a runnable demo API built on a clean NestJS 10 boilerplate. It showcases the cross-cutting concerns every real backend needs — **authentication with role-based access control**, **request validation**, a **uniform error envelope**, **request logging**, **health checks**, and **pagination** — across two feature modules, with zero infrastructure (in-memory stores). Interactive API docs are served at `/docs`.

## ✨ Features

- 🔐 **Auth guard + RBAC** — `AuthGuard` authenticates `Authorization: Bearer <token>` headers and authorizes against `@Roles("admin")`; `@Public()` opts routes out, `@CurrentUser()` injects the principal. Pluggable `TokenVerifier` (demo uses an in-memory map — swap for JWT in production).
- ✅ **Validation** — `SchemaValidationPipe` + per-DTO validators return `400` with the offending `field`; no heavy `class-validator` dependency.
- 🧯 **Exception filter** — `AllExceptionsFilter` returns a consistent JSON error envelope (`statusCode`, `error`, `message`, `path`, `timestamp`) and hides internals for unexpected errors.
- 📈 **Logging interceptor** — logs method, path, and duration per request (injectable clock for deterministic tests).
- ❤️ **Health probes** — `GET /health` (readiness, `503` when a check is down) and `GET /health/live` (liveness), with an extensible check registry.
- 📄 **Pagination** — `GET /users?page=1&limit=10` returns a `PaginatedResult` envelope with clamped, validated paging.
- 📚 **Swagger UI** — full OpenAPI docs with bearer-auth support at `/docs`.

## 📚 API

Interactive docs: **`GET /docs`** (Swagger UI). All endpoints except `/`, `/health`, and `/docs` require a bearer <redacted>

### Demo tokens

| Token              | User        | Roles   |
| ------------------ | ----------- | ------- |
| `forge-admin-token` | demo-admin  | `admin` |
| `forge-user-token`  | demo-user   | `user`  |

Example: `curl -H "Authorization: Bearer forge-admin-token" https://<host>/users`

### Endpoints

| Method | Path            | Auth            | Description                              |
| ------ | --------------- | --------------- | ---------------------------------------- |
| GET    | `/`             | Public          | Welcome payload with links               |
| GET    | `/docs`         | Public          | Swagger UI                               |
| GET    | `/health`       | Public          | Readiness report (`503` if a check fails)|
| GET    | `/health/live`  | Public          | Liveness probe                           |
| GET    | `/items`        | Bearer          | List items                               |
| POST   | `/items`        | Bearer          | Create item (`name` required)            |
| GET    | `/items/:id`    | Bearer          | Get one item (`404` if missing)          |
| GET    | `/users`        | Bearer          | Paginated users (`?page=&limit=`)        |
| POST   | `/users`        | Bearer          | Create user (unique email, `409` on dup) |
| GET    | `/users/:id`    | Bearer          | Get one user                             |
| DELETE | `/users/:id`    | Bearer + `admin`| Delete user (`403` without admin role)   |

Error responses always use the envelope: `{ "statusCode", "error", "message", "path", "timestamp" }`.

## 🚀 Running locally

```bash
npm install
npm run build
npm run start:demo
# → ForgeAPI demo listening on port 3000 — docs at /docs
```

Set `PORT` to override the listen port. The demo seeds 8 items and 3 users on startup.

## ☁️ Deploying to Render

Render → New → Web Service → connect this repo (free plan):

| Setting        | Value                          |
| -------------- | ------------------------------ |
| Build Command  | `npm install && npm run build` |
| Start Command  | `npm run start:demo`           |

No environment variables or databases required — the demo is fully self-contained. (Render injects `PORT` automatically; the app reads it.)

## 🧭 Project structure

```
src/
├── demo/               # Runnable demo app (bootstrap, seed data, root controller)
│   ├── main.ts         # NestFactory bootstrap: guards, pipes, Swagger, seeding
│   ├── demo.module.ts  # Wraps AppModule + demo-only root controller
│   └── root.controller.ts
├── health/             # Readiness + liveness probes
├── items/              # Item CRUD feature module
├── users/              # User CRUD with roles + pagination
├── common/
│   ├── auth/           # TokenVerifier contract + in-memory implementation
│   ├── guards/         # AuthGuard (bearer + RBAC)
│   ├── pipes/          # SchemaValidationPipe
│   ├── filters/        # AllExceptionsFilter (uniform error envelope)
│   ├── interceptors/   # LoggingInterceptor
│   ├── decorators/     # @Roles, @Public, @CurrentUser
│   └── dto/            # Pagination helpers
├── app.module.ts
└── index.ts            # Library re-exports (use the building blocks directly)
```

### Demo fixes applied on top of the boilerplate

While wiring the demo I fixed two real boot issues (both verified against the 94-test suite, which stays green):

1. `HealthModule` now registers `HealthService` via `useFactory` — its injectable clock/uptime constructor params (typed `Function`) can't be resolved by the Nest DI container under a real `tsc` build.
2. `LoggingInterceptor` moved from `APP_INTERCEPTOR` to manual `app.useGlobalInterceptors(...)` registration in `main.ts` (matching its own docstring) for the same reason.
3. `AllExceptionsFilter` now maps the boilerplate's own DTO `*ValidationError`s to `400` (previously they surfaced as `500`).

## 🧪 Testing

```bash
npm test          # vitest — 94 tests
npm run typecheck # tsc --noEmit
```

## 🙏 Attribution

Built on **[nestjs-boilerplate](https://github.com/Viprasol-Tech/nestjs-boilerplate)** by [Viprasol Tech Private Limited](https://viprasol.com) (MIT — see [LICENSE](LICENSE)). The library modules (`common/`, `health/`, `items/`, `users/`) are their work; the runnable demo server (`src/demo/`), Swagger wiring, seed data, boot fixes, and this README were built on top for this portfolio project.

## License

MIT — see [LICENSE](LICENSE).
