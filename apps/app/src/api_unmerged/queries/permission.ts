import type {
  CreateAppPermission as CreatePermission,
  PageQuery,
  UpdateAppPermission as UpdatePermission,
} from "@goi/contracts"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createPermission,
  deletePermission,
  findPermission,
  listPermissions,
  updatePermission,
} from "../service/permission"

export type PermissionListQuery = PageQuery & {
  code?: string
  moduleId?: string
}

export const permissionKeys = {
  all: ["permission"] as const,
  lists: () => [...permissionKeys.all, "list"] as const,
  list: (query?: PermissionListQuery) => [...permissionKeys.all, "list", query ?? null] as const,
  find: (permissionId: string) => [...permissionKeys.all, "find", permissionId] as const,
}

export function usePermissionList(query?: PermissionListQuery) {
  return useQuery({
    queryKey: permissionKeys.list(query),
    queryFn: async () => {
      const resp = await listPermissions({ data: query ?? { page: 1, pageSize: 10 } })
      return resp
    },
  })
}

export function usePermission(permissionId: string) {
  return useQuery({
    queryKey: permissionKeys.find(permissionId),
    queryFn: async () => {
      const resp = await findPermission({ data: permissionId })
      return resp
    },
    enabled: Boolean(permissionId),
  })
}

export function useCreatePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreatePermission) => {
      const resp = await createPermission({ data: body })
      return resp
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() })
    },
  })
}

export function useUpdatePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdatePermission) => {
      const resp = await updatePermission({ data: body })
      return resp
    },
    onSuccess: (permission) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: permissionKeys.find(permission.permissionId) })
    },
  })
}

export function useDeletePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (permissionId: string) => {
      const resp = await deletePermission({ data: permissionId })
      return resp
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() })
    },
  })
}
