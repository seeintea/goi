import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CreateUser, UpdateUser, UserListQuery } from "../service/user"
import { createUser, deleteUser, findUser, listUsers, updateUser } from "../service/user"

export const userKeys = {
  all: ["user"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (query?: UserListQuery) => [...userKeys.all, "list", query ?? null] as const,
  find: (userId: string) => [...userKeys.all, "find", userId] as const,
}

export function useUserList(query?: UserListQuery) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: async () => {
      const resp = await listUsers({ data: query })
      return resp
    },
  })
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.find(userId),
    queryFn: async () => {
      const resp = await findUser({ data: userId })
      return resp
    },
    enabled: Boolean(userId),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateUser) => {
      const resp = await createUser({ data: body })
      return resp
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateUser) => {
      const resp = await updateUser({ data: body })
      return resp
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.find(user.userId) })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const resp = await deleteUser({ data: userId })
      return resp
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
