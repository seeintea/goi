import { TanStackDevtools as Devtools, type TanStackDevtoolsReactInit } from "@tanstack/react-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

export function TanStackDevtools(props: Omit<TanStackDevtoolsReactInit, "plugins"> = {}) {
  return (
    <Devtools
      {...props}
      plugins={[
        {
          name: "TanStack Router",
          render: <TanStackRouterDevtoolsPanel />,
        },
        {
          name: "TanStack Query",
          render: <ReactQueryDevtoolsPanel />,
        },
      ]}
    />
  )
}
