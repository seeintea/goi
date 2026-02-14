import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UserState {
  token: string
  userId: string
  username: string
  roleId: string
  roleName: string
  familyId: string
  roles: string[]
  permissions: string[]
}

interface UserActions {
  setToken: (token: string) => void
  setUserId: (userId: string) => void
  setUsername: (username: string) => void
  setRoleId: (roleId: string) => void
  setRoleName: (roleName: string) => void
  setFamilyId: (familyId: string) => void
  setRoles: (roles: string[]) => void
  setPermissions: (permissions: string[]) => void
  setUser: (payload: Partial<UserState>) => void
  reset: () => void
}

export const useUser = create(
  persist<UserState & UserActions>(
    (set) => ({
      token: "",
      userId: "",
      username: "",
      roleId: "",
      roleName: "",
      familyId: "",
      roles: [],
      permissions: [],
      setToken: (token) => set({ token }),
      setUserId: (userId) => set({ userId }),
      setUsername: (username) => set({ username }),
      setRoleId: (roleId) => set({ roleId }),
      setRoleName: (roleName) => set({ roleName }),
      setFamilyId: (familyId) => set({ familyId }),
      setRoles: (roles) => set({ roles }),
      setPermissions: (permissions) => set({ permissions }),
      setUser: (payload) => set((state) => ({ ...state, ...payload })),
      reset: () =>
        set({
          token: "",
          userId: "",
          username: "",
          roleId: "",
          roleName: "",
          familyId: "",
          roles: [],
          permissions: [],
        }),
    }),
    { name: "finances-session" },
  ),
)
