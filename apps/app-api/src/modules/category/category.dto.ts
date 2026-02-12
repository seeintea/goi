import {
  Category,
  CreateCategory,
  categoryListQuerySchema,
  categoryPageResponseSchema,
  categoryResponseSchema,
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
export class DeleteCategoryDto extends createZodDto(z.object({ id: z.uuid() })) {}
export class CategoryListQueryDto extends createZodDto(categoryListQuerySchema) {}
export class CategoryPageResponseDto extends createZodDto(categoryPageResponseSchema) {}
