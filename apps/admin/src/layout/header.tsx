import { useNavigate } from "@tanstack/react-router"
import { Avatar, Button, Dropdown } from "antd"
import { LogOut, Moon, PanelLeftOpen, PanelRightOpen, Sun, User } from "lucide-react"
import { logout } from "@/api/service/admin/auth"
import { Breadcrumb } from "@/components/breadcrumb"
import { useSetting, useUser } from "@/stores"

export function Header() {
  const navigate = useNavigate()
  const resetUser = useUser((state) => state.reset)
  const { sidebarOpen, toggleSidebar, themeMode, toggleThemeMode } = useSetting()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error(error)
    } finally {
      resetUser()
      navigate({ to: "/login" })
    }
  }

  const items = [
    {
      key: "logout",
      label: "退出登录",
      icon: <LogOut size={16} />,
      onClick: handleLogout,
    },
  ]

  return (
    <header className="h-(--header-height) px-4 bg-(--color-bg-container) border-b border-(--color-border-secondary) flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          onClick={toggleSidebar}
          className="text-lg px-2!"
        >
          {sidebarOpen ? <PanelRightOpen size={16} /> : <PanelLeftOpen size={16} />}
        </Button>
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="text"
          onClick={toggleThemeMode}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-(--color-bg-text-hover) transition-colors"
          icon={themeMode === "light" ? <Sun size={18} /> : <Moon size={18} />}
        />

        <Dropdown menu={{ items }}>
          <div className="cursor-pointer flex items-center gap-2 hover:bg-(--color-bg-text-hover) px-2 py-1 rounded-md transition-colors">
            <Avatar
              icon={<User size={16} />}
              size="small"
              className="bg-primary"
            />
            <span className="text-sm font-medium text-(--color-text)">Admin</span>
          </div>
        </Dropdown>
      </div>
    </header>
  )
}
