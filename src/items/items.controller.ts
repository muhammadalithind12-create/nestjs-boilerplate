import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { validateCreateItemDto } from "./dto/create-item.dto.js";
import type { Item } from "./item.entity.js";
import { ItemsService } from "./items.service.js";

/**
 * REST controller exposing CRUD endpoints for items.
 *
 * Routes:
 * - `GET    /items`      -> list all items
 * - `POST   /items`      -> create an item (with DTO validation)
 * - `GET    /items/:id`  -> fetch a single item by id
 *
 * The {@link ItemsService} dependency is injected via an explicit token so
 * dependency injection works regardless of whether `emitDecoratorMetadata`
 * is honoured by the transpiler in use.
 */
@ApiTags("items")
@ApiBearerAuth("bearer")
@Controller("items")
export class ItemsController {
  constructor(
    @Inject(ItemsService) private readonly itemsService: ItemsService,
  ) {}

  @Get()
  findAll(): Item[] {
    return this.itemsService.findAll();
  }

  @Post()
  create(@Body() body: unknown): Item {
    const dto = validateCreateItemDto(body);
    return this.itemsService.create(dto);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number): Item {
    return this.itemsService.findOne(id);
  }
}
