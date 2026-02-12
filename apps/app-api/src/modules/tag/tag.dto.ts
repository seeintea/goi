import {
  CreateTag,
  createTagSchema,
  Tag,
  tagListQuerySchema,
  tagPageResponseSchema,
  tagResponseSchema,
  UpdateTag,
  updateTagSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedTagResponseSchema = tagResponseSchema as z.ZodType<Tag>
const typedCreateTagSchema = createTagSchema as z.ZodType<CreateTag>
const typedUpdateTagSchema = updateTagSchema as z.ZodType<UpdateTag>

export class TagResponseDto extends createZodDto(typedTagResponseSchema) {}
export class CreateTagDto extends createZodDto(typedCreateTagSchema) {}
export class UpdateTagDto extends createZodDto(typedUpdateTagSchema) {}
export class TagListQueryDto extends createZodDto(tagListQuerySchema) {}
export class TagPageResponseDto extends createZodDto(tagPageResponseSchema) {}
