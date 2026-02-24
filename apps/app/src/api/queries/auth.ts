import type { Login, Register } from "@goi/contracts"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useUser } from "@/stores/useUser"
import { createAuthApi } from "../common/auth"
import { clientRequest } from "../core/client"
import { loginFn, logoutFn } from "../server/auth"

const api = createAuthApi(clientRequest)

export function useLogin() {
  return useMutation({
    // Use Server Function to handle Session Cookie
    mutationFn: (data: Login) => loginFn({ data }),
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
