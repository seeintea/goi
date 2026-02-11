import { useMatches } from "@tanstack/react-router"
import { Breadcrumb as AntdBreadcrumb } from "antd"

export function Breadcrumb() {
  const matches = useMatches()

  const items = matches
    .filter((match) => match.staticData && (match.staticData as any).name)
    .map((match) => {
      const { name } = match.staticData as { name: string }
      return {
        title: name,
      }
    })

  if (items.length === 0) return null

  return <AntdBreadcrumb items={items} />
}
