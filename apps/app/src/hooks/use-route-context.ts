import { Route } from "@/routes/__root"

export function useRouteContext() {
  return Route.useRouteContext()
}

export function useMenuTree() {
  const { menuTree } = useRouteContext()
  return menuTree
}
