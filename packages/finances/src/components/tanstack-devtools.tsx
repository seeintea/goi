import { TanStackDevtools as ReactTanStackDevtools } from "@tanstack/react-devtools"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools"

export function TanStackDevtools() {
  return (
    <ReactTanStackDevtools
      config={{
        position: "bottom-right",
      }}
      plugins={[
        {
          name: "Tanstack Router",
          render: <TanStackRouterDevtoolsPanel />,
        },
        TanStackQueryDevtools,
      ]}
    />
  )
}
