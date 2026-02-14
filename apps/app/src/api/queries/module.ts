import type { CreateAppModule as CreateModule, PageQuery, UpdateAppModule as UpdateModule } from "@goi/contracts"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createModule,
  deleteModule,
  findModule,
  listAllModules,
  listModules,
  listRootModules,
  updateModule,
} from "../service/module"

export type ModuleListQuery = PageQuery & {
  parentId?: string
  name?: string
  routePath?: string
  permissionCode?: string
}

export const moduleKeys = {
  all: ["module"] as const,
  lists: () => [...moduleKeys.all, "list"] as const,
  list: (query?: ModuleListQuery) => [...moduleKeys.all, "list", query ?? null] as const,
  allLists: () => [...moduleKeys.all, "all"] as const,
  allList: (query?: Omit<ModuleListQuery, "page" | "pageSize">) => [...moduleKeys.all, "all", query ?? null] as const,
  roots: () => [...moduleKeys.all, "roots"] as const,
  find: (moduleId: string) => [...moduleKeys.all, "find", moduleId] as const,
}

export function useModuleList(query?: ModuleListQuery) {
  return useQuery({
    queryKey: moduleKeys.list(query),
    queryFn: async () => {
      const resp = await listModules({ data: query ?? { page: 1, pageSize: 10 } })
      return resp
    },
  })
}

export function useModuleAll(query?: Omit<ModuleListQuery, "page" | "pageSize">) {
  return useQuery({
    queryKey: moduleKeys.allList(query),
    queryFn: async () => {
      const resp = await listAllModules({ data: query ?? {} })
      return resp
    },
  })
}

export function useRootModules() {
  return useQuery({
    queryKey: moduleKeys.roots(),
    queryFn: async () => {
      const resp = await listRootModules()
      return resp
    },
  })
}

export function useModule(moduleId: string) {
  return useQuery({
    queryKey: moduleKeys.find(moduleId),
    queryFn: async () => {
      const resp = await findModule({ data: moduleId })
      return resp
    },
    enabled: Boolean(moduleId),
  })
}

export function useCreateModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateModule) => {
      const resp = await createModule({ data: body })
      return resp
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: moduleKeys.allLists() })
      queryClient.invalidateQueries({ queryKey: moduleKeys.roots() })
    },
  })
}

export function useUpdateModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateModule) => {
      const resp = await updateModule({ data: body })
      return resp
    },
    onSuccess: (module) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: moduleKeys.allLists() })
      queryClient.invalidateQueries({ queryKey: moduleKeys.roots() })
      queryClient.invalidateQueries({ queryKey: moduleKeys.find(module.moduleId) })
    },
  })
}

export function useDeleteModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (moduleId: string) => {
      const resp = await deleteModule({ data: moduleId })
      return resp
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: moduleKeys.allLists() })
      queryClient.invalidateQueries({ queryKey: moduleKeys.roots() })
    },
  })
}
