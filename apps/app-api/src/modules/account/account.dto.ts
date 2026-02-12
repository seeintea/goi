import {
  Account,
  accountListQuerySchema,
  accountPageResponseSchema,
  accountResponseSchema,
  CreateAccount,
  createAccountSchema,
  UpdateAccount,
  updateAccountSchema,
} from "@goi/contracts"
import { createZodDto } from "nestjs-zod"
import { z } from "zod"

const typedAccountResponseSchema = accountResponseSchema as z.ZodType<Account>
const typedCreateAccountSchema = createAccountSchema as z.ZodType<CreateAccount>
const typedUpdateAccountSchema = updateAccountSchema as z.ZodType<UpdateAccount>

export class AccountResponseDto extends createZodDto(typedAccountResponseSchema) {}
export class CreateAccountDto extends createZodDto(typedCreateAccountSchema) {}
export class UpdateAccountDto extends createZodDto(typedUpdateAccountSchema) {}
export class AccountListQueryDto extends createZodDto(accountListQuerySchema) {}
export class AccountPageResponseDto extends createZodDto(accountPageResponseSchema) {}

const deleteAccountSchema = z.object({
  id: z.uuid(),
})

export class DeleteAccountDto extends createZodDto(deleteAccountSchema) {}
