import { SetMetadata } from "@nestjs/common"
import { PUBLIC_DECORATOR } from "@/constants/auth.constants"

export const Public = () => SetMetadata(PUBLIC_DECORATOR, true)
