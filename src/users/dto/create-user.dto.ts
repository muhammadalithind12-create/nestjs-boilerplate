import { ApiProperty } from "@nestjs/swagger";
import type { UserRole } from "../user.entity.js";

/** Roles accepted by {@link validateCreateUserDto}. */
const VALID_ROLES: readonly UserRole[] = ["admin", "user"];

/** Basic, pragmatic email shape check (not a full RFC 5322 validator). */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Payload required to create a {@link User}. */
export class CreateUserDto {
  /** Display name. Required, non-empty. */
  @ApiProperty({ example: "Ayesha Khan", description: "Display name" })
  name!: string;

  /** Email address. Required, validated and normalized to lowercase. */
  @ApiProperty({ example: "ayesha@example.com", description: "Email address, normalized to lowercase" })
  email!: string;

  /** Optional roles. Defaults to `["user"]` when omitted. */
  @ApiProperty({ required: false, enum: ["admin", "user"], default: ["user"], description: 'Roles granted to the user' })
  roles?: UserRole[];
}

/** Error thrown when a {@link CreateUserDto} payload fails validation. */
export class CreateUserValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "CreateUserValidationError";
  }
}

function validateRoles(value: unknown): UserRole[] {
  if (value === undefined) {
    return ["user"];
  }
  if (!Array.isArray(value) || value.length === 0) {
    throw new CreateUserValidationError(
      "roles must be a non-empty array when provided",
      "roles",
    );
  }
  for (const role of value) {
    if (!VALID_ROLES.includes(role as UserRole)) {
      throw new CreateUserValidationError(
        `roles must each be one of: ${VALID_ROLES.join(", ")}`,
        "roles",
      );
    }
  }
  return [...new Set(value as UserRole[])];
}

/**
 * Validate and normalize an unknown payload into a {@link CreateUserDto}.
 *
 * @throws {CreateUserValidationError} when the payload is invalid.
 */
export function validateCreateUserDto(payload: unknown): CreateUserDto {
  if (typeof payload !== "object" || payload === null) {
    throw new CreateUserValidationError("Body must be an object", "body");
  }

  const record = payload as Record<string, unknown>;
  const { name, email, roles } = record;

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new CreateUserValidationError(
      "name is required and must be a non-empty string",
      "name",
    );
  }

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    throw new CreateUserValidationError(
      "email is required and must be a valid email address",
      "email",
    );
  }

  const dto = new CreateUserDto();
  dto.name = name.trim();
  dto.email = email.trim().toLowerCase();
  dto.roles = validateRoles(roles);
  return dto;
}
