import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from "@ant-design/icons"
import { useNavigate } from "@tanstack/react-router"
import { Avatar, Button, Dropdown } from "antd"
import * as AuthApi from "@/api/service/admin/auth"
import { useSidebar, useUser } from "@/stores"

export function Header() {
  const navigate = useNavigate()
  const resetUser = useUser((state) => state.reset)
  const { isOpen, toggle } = useSidebar()

  const handleLogout = async () => {
    try {
      await AuthApi.logout()
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
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <header className="h-14 px-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <Button
          type="text"
          icon={isOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={toggle}
        />
      </div>

      <Dropdown menu={{ items }}>
        <div className="cursor-pointer flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded-md transition-colors">
          <Avatar
            icon={<UserOutlined />}
            size="small"
          />
          <span className="text-sm font-medium">Admin</span>
        </div>
      </Dropdown>
    </header>
  )
}
