import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UserState {
  token: string
}

interface UserActions {
  setToken: (token: string) => void
  reset: () => void
}

export const useUser = create(
  persist<UserState & UserActions>(
    (set) => ({
      token: "",
      setToken: (token) => set({ token }),
      reset: () =>
        set({
          token: "",
        }),
    }),
    { name: "admin-session" },
  ),
)
