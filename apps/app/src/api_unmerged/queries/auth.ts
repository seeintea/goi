import type { Login } from "@goi/contracts"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useUser } from "@/stores"
import { login, logout } from "../service/auth"

export const authKeys = {
  all: ["auth"] as const,
  login: () => [...authKeys.all, "login"] as const,
  logout: () => [...authKeys.all, "logout"] as const,
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: (params: Login) => login({ data: params }),
    onSuccess: (resp) => {
      if (!resp.error && resp.data) {
        const { reset, setUser } = useUser.getState()
        reset()
        setUser({
          token: resp.data.accessToken,
          userId: resp.data.userId,
          username: resp.data.username,
          familyId: resp.data.familyId ?? "",
          roleId: resp.data.roleId ?? "",
          roleName: resp.data.roleName ?? "",
          roles: resp.data.roleId ? [resp.data.roleId] : [],
        })
        queryClient.invalidateQueries()
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: authKeys.logout(),
    mutationFn: () => logout(),
    onSuccess: () => {
      useUser.getState().reset()
      queryClient.clear()
    },
  })
}
