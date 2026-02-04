import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CreateUser, UpdateUser, UserListQuery } from "../service/user"
import { createUser, deleteUser, findUser, listUsers, updateUser } from "../service/user"

export const userKeys = {
  all: ["user"] as const,
  list: (query?: UserListQuery) => [...userKeys.all, "list", query ?? null] as const,
  find: (userId: string) => [...userKeys.all, "find", userId] as const,
}

export function useUserList(query?: UserListQuery) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: async () => {
      const resp = await listUsers(query)
      return resp.data
    },
  })
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.find(userId),
    queryFn: async () => {
      const resp = await findUser(userId)
      return resp.data
    },
    enabled: Boolean(userId),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateUser) => {
      const resp = await createUser(body)
      return resp.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateUser) => {
      const resp = await updateUser(body)
      return resp.data
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      queryClient.invalidateQueries({ queryKey: userKeys.find(user.userId) })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const resp = await deleteUser(userId)
      return resp.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
