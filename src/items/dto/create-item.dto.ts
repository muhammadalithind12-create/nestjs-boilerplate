import { ApiProperty } from "@nestjs/swagger";

/**
 * Data Transfer Object describing the payload required to create an item.
 *
 * The companion {@link validateCreateItemDto} helper performs runtime
 * validation so the boilerplate works without pulling in extra validation
 * libraries, while remaining trivial to swap for `class-validator`.
 */
export class CreateItemDto {
  /** Human readable name of the item. Required, non-empty. */
  @ApiProperty({ example: "Wireless Mouse", description: "Human readable name of the item" })
  name!: string;

  /** Optional free-form description. */
  @ApiProperty({ required: false, example: "Ergonomic 2.4GHz wireless mouse", description: "Optional free-form description" })
  description?: string;
}

/** Error thrown when a {@link CreateItemDto} payload fails validation. */
export class CreateItemValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "CreateItemValidationError";
  }
}

/**
 * Validate and normalize an unknown payload into a {@link CreateItemDto}.
 *
 * @throws {CreateItemValidationError} when the payload is invalid.
 */
export function validateCreateItemDto(payload: unknown): CreateItemDto {
  if (typeof payload !== "object" || payload === null) {
    throw new CreateItemValidationError("Body must be an object", "body");
  }

  const record = payload as Record<string, unknown>;
  const { name, description } = record;

  if (typeof name !== "string" || name.trim().length === 0) {
    throw new CreateItemValidationError(
      "name is required and must be a non-empty string",
      "name",
    );
  }

  if (description !== undefined && typeof description !== "string") {
    throw new CreateItemValidationError(
      "description must be a string when provided",
      "description",
    );
  }

  const dto = new CreateItemDto();
  dto.name = name.trim();
  if (description !== undefined) {
    dto.description = description;
  }
  return dto;
}
