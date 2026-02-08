import { SetMetadata } from "@nestjs/common"
import { PERMISSION_DECORATOR } from "./constants"

export const Permission = (...permissions: string[]) => SetMetadata(PERMISSION_DECORATOR, permissions)
