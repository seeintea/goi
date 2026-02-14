export type UserSession = {
  userId: string
  username: string
  accessToken: string
  roleId: string
  roleName: string
  bookId: string
}

export async function getAppSession(): Promise<any> {
  const { useSession } = await import("@tanstack/react-start/server")
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
