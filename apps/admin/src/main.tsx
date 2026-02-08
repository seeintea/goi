import { StyleProvider } from "@ant-design/cssinjs"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

import "./styles.css"

import { ConfigProvider } from "antd"
// Import the generated route tree
import { routeTree } from "./routeTree.gen"

// Create a new router instance

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById("root")
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <StyleProvider layer>
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                collapsedWidth: 63,
              },
            },
          }}
        >
          <RouterProvider router={router} />
        </ConfigProvider>
      </StyleProvider>
    </StrictMode>,
  )
}
