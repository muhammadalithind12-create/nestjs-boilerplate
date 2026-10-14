import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";

/** Consistent JSON error envelope returned for every unhandled exception. */
export interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

interface MinimalRequest {
  url?: string;
  method?: string;
}

interface MinimalResponse {
  status(code: number): MinimalResponse;
  json(body: ErrorResponseBody): unknown;
}

/**
 * Shape of the DTO validation errors thrown by the boilerplate's
 * `validate*Dto` helpers (e.g. `CreateItemValidationError`). They carry the
 * offending `field` and a human-readable message, so the API maps them to
 * `400 Bad Request` instead of hiding them behind a 500.
 */
interface DtoValidationError extends Error {
  field?: string;
}

function isDtoValidationError(value: unknown): value is DtoValidationError {
  return (
    value instanceof Error &&
    typeof value.name === "string" &&
    value.name.endsWith("ValidationError") &&
    "field" in value
  );
}

/**
 * Global exception filter that converts any thrown error into a uniform JSON
 * envelope, hiding internal details for non-HTTP exceptions while preserving
 * the rich messages of {@link HttpException}s (including validation arrays).
 *
 * Register globally in `main.ts` via `app.useGlobalFilters(new AllExceptionsFilter())`.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<MinimalResponse>();
    const request = ctx.getRequest<MinimalRequest>();

    const { statusCode, message, error } = this.normalize(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method ?? "?"} ${request.url ?? "?"} -> ${statusCode}: ${
          Array.isArray(message) ? message.join("; ") : message
        }`,
      );
    }

    const body: ErrorResponseBody = {
      statusCode,
      error,
      message,
      path: request.url ?? "",
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(body);
  }

  /** Map an arbitrary thrown value to a status code, message, and error name. */
  normalize(exception: unknown): {
    statusCode: number;
    message: string | string[];
    error: string;
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === "string") {
        return { statusCode, message: payload, error: exception.name };
      }

      const record = payload as Record<string, unknown>;
      const message = (record.message ?? exception.message) as
        | string
        | string[];
      const error = (record.error as string) ?? exception.name;
      return { statusCode, message, error };
    }

    if (isDtoValidationError(exception)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
        error: "ValidationError",
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      error: "InternalServerError",
    };
  }
}
