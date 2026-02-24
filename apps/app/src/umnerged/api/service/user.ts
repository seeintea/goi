import type { AppUser, CreateAppUser, PageQuery, PageResult, UpdateAppUser } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { serverFetch } from "../client"

export type User = AppUser
export type CreateUser = CreateAppUser
export type UpdateUser = UpdateAppUser

export type UserListQuery = PageQuery & {
  userId?: string
  username?: string
}

const createUserFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateAppUser
  if (!data || typeof data !== "object" || !("username" in data) || !("password" in data)) {
    throw new Error("Invalid input")
  }
  return await serverFetch<AppUser>("/api/sys/user/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createUser = createUserFnBase as unknown as (ctx: { data: CreateAppUser }) => Promise<AppUser>

const findUserFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const userId = ctx.data as string
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid input: userId is required")
  }
  const params = new URLSearchParams({ userId })
  return await serverFetch<AppUser>(`/api/sys/user/find?${params}`, {
    method: "GET",
  })
})

export const findUser = findUserFnBase as unknown as (ctx: { data: string }) => Promise<AppUser>

const listUsersFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const query = ctx.data as UserListQuery | undefined
  const params = new URLSearchParams()
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }

  return await serverFetch<PageResult<AppUser>>(`/api/sys/user/list?${params}`, {
    method: "GET",
  })
})

export const listUsers = listUsersFnBase as unknown as (ctx: {
  data: UserListQuery | undefined
}) => Promise<PageResult<AppUser>>

const updateUserFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as UpdateAppUser
  if (!data || typeof data !== "object" || !("userId" in data)) {
    throw new Error("Invalid input: userId is required")
  }
  return await serverFetch<AppUser>("/api/sys/user/update", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const updateUser = updateUserFnBase as unknown as (ctx: { data: UpdateAppUser }) => Promise<AppUser>

const deleteUserFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const userId = ctx.data as string
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid input: userId is required")
  }
  return await serverFetch<boolean>("/api/sys/user/delete", {
    method: "POST",
    body: { userId } as unknown as BodyInit,
  })
})

export const deleteUser = deleteUserFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
