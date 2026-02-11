import { create } from "zustand"
import { persist } from "zustand/middleware"

type ThemeMode = "light" | "dark"

interface SettingState {
  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Theme
  themeMode: ThemeMode
  toggleThemeMode: () => void
  setThemeMode: (mode: ThemeMode) => void
}

export const useSetting = create<SettingState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Theme
      themeMode: "light",
      toggleThemeMode: () => set((state) => ({ themeMode: state.themeMode === "light" ? "dark" : "light" })),
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: "admin-setting",
    },
  ),
)
