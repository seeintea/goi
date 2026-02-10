import { useMatches } from "@tanstack/react-router"
import { useEffect } from "react"

export function useHead() {
  const matches = useMatches()

  useEffect(() => {
    const lastMatch = matches.at(-1)
    if (lastMatch) {
      document.title = `${lastMatch?.staticData?.name ?? ""} - 运营后台`
    }
  }, [matches])
}
