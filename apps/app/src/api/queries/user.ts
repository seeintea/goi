import type { CreateAppUser, ResetAppUserPassword, UpdateAppUser } from "@goi/contracts"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createUserApi, type UserListQuery } from "../common/user"
import { clientRequest } from "../core/client"
import { deleteUserFn, findUserFn, listUsersFn, updateUserFn } from "../server/user"

const api = createUserApi(clientRequest)

export const userKeys = {
  all: ["user"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (query?: UserListQuery) => [...userKeys.all, "list", query ?? null] as const,
  find: (userId: string) => [...userKeys.all, "find", userId] as const,
}

export function useUserList(query?: UserListQuery) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => listUsersFn({ data: query }),
    placeholderData: keepPreviousData,
  })
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.find(userId),
    queryFn: () => findUserFn({ data: userId }),
    enabled: Boolean(userId),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAppUser) => api.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateAppUser) => updateUserFn({ data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.find(data.userId) })
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetAppUserPassword) => api.resetPassword(data),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => deleteUserFn({ data: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
