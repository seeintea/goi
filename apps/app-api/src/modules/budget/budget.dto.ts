import {
  Budget,
  budgetListQuerySchema,
  budgetPageResponseSchema,
  budgetResponseSchema,
  CreateBudget,
  createBudgetSchema,
  UpdateBudget,
  updateBudgetSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedBudgetResponseSchema = budgetResponseSchema as z.ZodType<Budget>
const typedCreateBudgetSchema = createBudgetSchema as z.ZodType<CreateBudget>
const typedUpdateBudgetSchema = updateBudgetSchema as z.ZodType<UpdateBudget>

export class BudgetResponseDto extends createZodDto(typedBudgetResponseSchema) {}
export class CreateBudgetDto extends createZodDto(typedCreateBudgetSchema) {}
export class UpdateBudgetDto extends createZodDto(typedUpdateBudgetSchema) {}
export class BudgetListQueryDto extends createZodDto(budgetListQuerySchema) {}
export class BudgetPageResponseDto extends createZodDto(budgetPageResponseSchema) {}
