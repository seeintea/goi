import { StyleProvider } from "@ant-design/cssinjs"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import zhCN from "antd/locale/zh_CN"
import dayjs from "dayjs"
import { type ReactNode, StrictMode, useEffect } from "react"
import ReactDOM from "react-dom/client"
import "dayjs/locale/zh-cn"

import "./styles.css"

import { ConfigProvider } from "antd"
import { ThemeSync } from "@/components/theme-sync"
import { themes } from "@/config/theme"
import { useSetting } from "@/stores"
// Import the generated route tree
import { routeTree } from "./routeTree.gen"

dayjs.locale("zh-cn")

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

  interface StaticDataRouteOption {
    name: string
    permission: string
    icon?: ReactNode
    order?: number
    menuType?: "group" | "item" | "hidden" | "flatten"
  }
}

const App = () => {
  const mode = useSetting((state) => state.themeMode)

  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [mode])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={themes[mode]}
    >
      <ThemeSync />
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

// Render the app
const rootElement = document.getElementById("root")
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <StyleProvider layer>
        <App />
      </StyleProvider>
    </StrictMode>,
  )
}
