import { createServerFn } from "@tanstack/react-start"
import type { PageQuery, PageResult } from "@/types/api"
import { serverFetch } from "../client"

export type User = {
  userId: string
  username: string
  email: string
  phone: string
  isDisabled: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export type CreateUser = {
  username: string
  password: string
  email?: string
  phone?: string
}

export type UpdateUser = {
  userId: string
  username?: string
  password?: string
  salt?: string
  email?: string
  phone?: string
  isDisabled?: boolean
  isDeleted?: boolean
}

export type UserListQuery = PageQuery & {
  userId?: string
  username?: string
}

const createUserFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as CreateUser
  if (!data || typeof data !== "object" || !("username" in data) || !("password" in data)) {
    throw new Error("Invalid input")
  }
  return await serverFetch<User>("/api/sys/user/create", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const createUser = createUserFnBase as unknown as (ctx: { data: CreateUser }) => Promise<User>

const findUserFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  const userId = ctx.data as string
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid input: userId is required")
  }
  const params = new URLSearchParams({ userId })
  return await serverFetch<User>(`/api/sys/user/find?${params}`, {
    method: "GET",
  })
})

export const findUser = findUserFnBase as unknown as (ctx: { data: string }) => Promise<User>

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

  return await serverFetch<PageResult<User>>(`/api/sys/user/list?${params}`, {
    method: "GET",
  })
})

export const listUsers = listUsersFnBase as unknown as (ctx: {
  data: UserListQuery | undefined
}) => Promise<PageResult<User>>

const updateUserFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  const data = ctx.data as UpdateUser
  if (!data || typeof data !== "object" || !("userId" in data)) {
    throw new Error("Invalid input: userId is required")
  }
  return await serverFetch<User>("/api/sys/user/update", {
    method: "POST",
    body: data as unknown as BodyInit,
  })
})

export const updateUser = updateUserFnBase as unknown as (ctx: { data: UpdateUser }) => Promise<User>

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
