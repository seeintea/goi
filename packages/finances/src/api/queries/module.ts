import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CreateModule, ModuleListQuery, UpdateModule } from "../service/module"
import {
  createModule,
  deleteModule,
  findModule,
  listAllModules,
  listModules,
  listRootModules,
  updateModule,
} from "../service/module"

export const moduleKeys = {
  all: ["module"] as const,
  list: (query?: ModuleListQuery) => [...moduleKeys.all, "list", query ?? null] as const,
  allList: (query?: Omit<ModuleListQuery, "page" | "pageSize">) => [...moduleKeys.all, "all", query ?? null] as const,
  roots: () => [...moduleKeys.all, "roots"] as const,
  find: (moduleId: string) => [...moduleKeys.all, "find", moduleId] as const,
}

export function useModuleList(query?: ModuleListQuery) {
  return useQuery({
    queryKey: moduleKeys.list(query),
    queryFn: async () => {
      const resp = await listModules(query)
      return resp.data
    },
  })
}

export function useModuleAll(query?: Omit<ModuleListQuery, "page" | "pageSize">) {
  return useQuery({
    queryKey: moduleKeys.allList(query),
    queryFn: async () => {
      const resp = await listAllModules(query)
      return resp.data
    },
  })
}

export function useRootModules() {
  return useQuery({
    queryKey: moduleKeys.roots(),
    queryFn: async () => {
      const resp = await listRootModules()
      return resp.data
    },
  })
}

export function useModule(moduleId: string) {
  return useQuery({
    queryKey: moduleKeys.find(moduleId),
    queryFn: async () => {
      const resp = await findModule(moduleId)
      return resp.data
    },
    enabled: Boolean(moduleId),
  })
}

export function useCreateModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateModule) => {
      const resp = await createModule(body)
      return resp.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all })
    },
  })
}

export function useUpdateModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateModule) => {
      const resp = await updateModule(body)
      return resp.data
    },
    onSuccess: (module) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.list() })
      queryClient.invalidateQueries({ queryKey: moduleKeys.find(module.moduleId) })
    },
  })
}

export function useDeleteModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (moduleId: string) => {
      const resp = await deleteModule(moduleId)
      return resp.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all })
    },
  })
}
