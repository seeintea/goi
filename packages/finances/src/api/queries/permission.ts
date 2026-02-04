import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CreatePermission, PermissionListQuery, UpdatePermission } from "../service/permission"
import {
  createPermission,
  deletePermission,
  findPermission,
  listPermissions,
  updatePermission,
} from "../service/permission"

export const permissionKeys = {
  all: ["permission"] as const,
  list: (query?: PermissionListQuery) => [...permissionKeys.all, "list", query ?? null] as const,
  find: (permissionId: string) => [...permissionKeys.all, "find", permissionId] as const,
}

export function usePermissionList(query?: PermissionListQuery) {
  return useQuery({
    queryKey: permissionKeys.list(query),
    queryFn: async () => {
      const resp = await listPermissions(query)
      return resp.data
    },
  })
}

export function usePermission(permissionId: string) {
  return useQuery({
    queryKey: permissionKeys.find(permissionId),
    queryFn: async () => {
      const resp = await findPermission(permissionId)
      return resp.data
    },
    enabled: Boolean(permissionId),
  })
}

export function useCreatePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreatePermission) => {
      const resp = await createPermission(body)
      return resp.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all })
    },
  })
}

export function useUpdatePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdatePermission) => {
      const resp = await updatePermission(body)
      return resp.data
    },
    onSuccess: (permission) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.list() })
      queryClient.invalidateQueries({ queryKey: permissionKeys.find(permission.permissionId) })
    },
  })
}

export function useDeletePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (permissionId: string) => {
      const resp = await deletePermission(permissionId)
      return resp.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all })
    },
  })
}
