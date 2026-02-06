import { SetMetadata } from "@nestjs/common"
import { PERMISSION_DECORATOR } from "./auth.constants"

export const Permission = (...permissions: string[]) => SetMetadata(PERMISSION_DECORATOR, permissions)
