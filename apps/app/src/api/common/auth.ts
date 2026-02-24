import type { 
  Login, 
  LoginResponse, 
  NavMenuTree, 
  Register 
} from "@goi/contracts"
import type { RequestFn } from "../core/types"

export const createAuthApi = (request: RequestFn) => ({
  
  login: (data: Login) => {
    return request<LoginResponse>("/api/sys/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  register: (data: Register) => {
    return request<LoginResponse>("/api/sys/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  logout: () => {
    return request<boolean>("/api/sys/auth/logout", {
      method: "POST",
    })
  },

  getMe: () => {
    return request<Omit<LoginResponse, "accessToken">>("/api/sys/auth/me")
  },

  getNav: () => {
    return request<NavMenuTree[]>("/api/sys/auth/nav")
  },

  getPermissions: () => {
    return request<string[]>("/api/sys/auth/permissions")
  }
})

export type AuthApi = ReturnType<typeof createAuthApi>
