import { theme } from "antd"
import { useEffect } from "react"

export const ThemeSync = () => {
  const { token } = theme.useToken()

  useEffect(() => {
    const root = document.documentElement

    // Map Ant Design tokens to CSS variables used by Tailwind
    // This ensures that Tailwind classes match the Ant Design theme configuration
    const tokenMap: Record<string, string> = {
      colorPrimary: "--color-primary",
      colorBgContainer: "--color-bg-container",
      colorBorderSecondary: "--color-border-secondary",
      colorText: "--color-text",
      // Use colorBgLayout for the main content background
      colorBgLayout: "--content-bg",
      // Use controlItemBgHover (derived token) for hover states
      controlItemBgHover: "--color-bg-text-hover",
    }

    Object.entries(tokenMap).forEach(([tokenKey, cssVar]) => {
      // Use type assertion to access derived tokens that might not be in the strict SeedToken type
      // biome-ignore lint/suspicious/noExplicitAny: <allow any>
      const value = (token as any)[tokenKey]
      if (value) {
        root.style.setProperty(cssVar, value.toString())
      }
    })
  }, [token])

  return null
}
