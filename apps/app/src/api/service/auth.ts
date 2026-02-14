import type { AppUser } from "@goi/contracts"
import { api } from "@/api/client"

export type LoginParams = {
  username: string
  password: string
}

export type RegisterParams = {
  username: string
  password: string
  email?: string
  phone?: string
}

export type LoginResponse = {
  userId: string
  username: string
  accessToken: string
  roleId: string
  roleName: string
  bookId: string
}

export const login = (params: LoginParams) => api.post<LoginResponse>("/api/sys/auth/login", params)

export const register = (params: RegisterParams) => api.post<AppUser>("/api/sys/auth/register", params)

export const logout = () => api.post<boolean>("/api/sys/auth/logout")
