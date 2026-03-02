import type { Login, Register } from "@goi/contracts"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { useUser } from "@/stores/useUser"
import { createAuthApi } from "../common/auth"
import { clientRequest } from "../core/client"
import { getAuthUserFn, getNavFn, getPermissionsFn, loginFn, logoutFn } from "../server/auth"

const api = createAuthApi(clientRequest)

export const authUserQueryOptions = () =>
  queryOptions({
    queryKey: ["auth", "user"],
    queryFn: () => getAuthUserFn(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

export const navQueryOptions = () =>
  queryOptions({
    queryKey: ["auth", "nav"],
    queryFn: () => getNavFn(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

export const permissionsQueryOptions = () =>
  queryOptions({
    queryKey: ["auth", "permissions"],
    queryFn: () => getPermissionsFn(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    // Use Server Function to handle Session Cookie
    mutationFn: (data: Login) => loginFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] })
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: Register) => api.register(data),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const resetUser = useUser((s) => s.reset)

  return useMutation({
    // Use Server Function to clear Session Cookie
    mutationFn: () => logoutFn(),
    onSuccess: () => {
      resetUser()
      queryClient.clear()
    },
  })
}
