import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator.js";
import type { PaginatedResult } from "../common/dto/pagination.dto.js";
import { parsePaginationQuery } from "../common/dto/pagination.dto.js";
import { validateCreateUserDto } from "./dto/create-user.dto.js";
import type { User } from "./user.entity.js";
import { UsersService } from "./users.service.js";

/**
 * REST controller exposing user management endpoints, demonstrating role
 * based authorization and pagination.
 *
 * Routes:
 * - `GET    /users`      -> paginated list (query: `page`, `limit`)
 * - `POST   /users`      -> create a user (validated, unique email)
 * - `GET    /users/:id`  -> fetch a single user
 * - `DELETE /users/:id`  -> delete a user (requires the `admin` role)
 */
@ApiTags("users")
@ApiBearerAuth("bearer")
@Controller("users")
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  @Get()
  findAll(@Query() query: unknown): PaginatedResult<User> {
    const pagination = parsePaginationQuery(query);
    return this.usersService.findAll(pagination);
  }

  @Post()
  create(@Body() body: unknown): User {
    const dto = validateCreateUserDto(body);
    return this.usersService.create(dto);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number): User {
    return this.usersService.findOne(id);
  }

  @Roles("admin")
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number): User {
    return this.usersService.remove(id);
  }
}
