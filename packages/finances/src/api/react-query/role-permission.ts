import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CreateRolePermission, RolePermissionListQuery } from "../controllers/role-permission"
import {
  createRolePermission,
  deleteRolePermission,
  findRolePermission,
  listRolePermissions,
} from "../controllers/role-permission"

export const rolePermissionKeys = {
  all: ["role-permission"] as const,
  list: (query?: RolePermissionListQuery) => [...rolePermissionKeys.all, "list", query ?? null] as const,
  find: (roleId: string, permissionId: string) => [...rolePermissionKeys.all, "find", roleId, permissionId] as const,
}

export function useRolePermissionList(query?: RolePermissionListQuery) {
  return useQuery({
    queryKey: rolePermissionKeys.list(query),
    queryFn: async () => {
      const resp = await listRolePermissions(query)
      return resp.data
    },
  })
}

export function useRolePermission(roleId: string, permissionId: string) {
  return useQuery({
    queryKey: rolePermissionKeys.find(roleId, permissionId),
    queryFn: async () => {
      const resp = await findRolePermission(roleId, permissionId)
      return resp.data
    },
    enabled: Boolean(roleId) && Boolean(permissionId),
  })
}

export function useCreateRolePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateRolePermission) => {
      const resp = await createRolePermission(body)
      return resp.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolePermissionKeys.all })
    },
  })
}

export function useDeleteRolePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateRolePermission) => {
      const resp = await deleteRolePermission(body)
      return resp.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolePermissionKeys.all })
    },
  })
}
