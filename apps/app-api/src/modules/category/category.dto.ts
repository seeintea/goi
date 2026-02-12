import {
  Category,
  categoryListQuerySchema,
  categoryPageResponseSchema,
  categoryResponseSchema,
  CreateCategory,
  createCategorySchema,
  UpdateCategory,
  updateCategorySchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedCategoryResponseSchema = categoryResponseSchema as z.ZodType<Category>
const typedCreateCategorySchema = createCategorySchema as z.ZodType<CreateCategory>
const typedUpdateCategorySchema = updateCategorySchema as z.ZodType<UpdateCategory>

export class CategoryResponseDto extends createZodDto(typedCategoryResponseSchema) {}
export class CreateCategoryDto extends createZodDto(typedCreateCategorySchema) {}
export class UpdateCategoryDto extends createZodDto(typedUpdateCategorySchema) {}
export class CategoryListQueryDto extends createZodDto(categoryListQuerySchema) {}
export class CategoryPageResponseDto extends createZodDto(categoryPageResponseSchema) {}
