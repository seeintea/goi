import type { LoginResponse } from "@goi/contracts"
import { useSession } from "@tanstack/react-start/server"

export type UserSession = LoginResponse

export async function getAppSession(): Promise<ReturnType<typeof useSession<UserSession>>> {
  return useSession<UserSession>({
    name: "goi_session",
    password: import.meta.env.VITE_SESSION_SECRET || "change-this-to-a-secure-random-string-in-production",
    cookie: {
      secure: import.meta.env.PROD,
      sameSite: "lax",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  })
}
