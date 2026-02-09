import type { AdminLogin, AdminLoginResponse } from "@goi/contracts"
import { api } from "../../client"

export const login = (params: AdminLogin) => api.post<AdminLoginResponse>("/api/admin/auth/login", params)

export const logout = () => api.post<boolean>("/api/admin/auth/logout")
