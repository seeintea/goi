import { HeadContent, Scripts } from "@tanstack/react-router"
import { TanStackDevtools } from "./tanstack-devtools"

export function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools config={{ position: "bottom-right" }} />
        <Scripts />
      </body>
    </html>
  )
}
