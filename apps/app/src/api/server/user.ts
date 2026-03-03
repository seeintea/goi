import type { AppUser, CreateAppUser, PageResult, UpdateAppUser } from "@goi/contracts"
import { createServerFn } from "@tanstack/react-start"
import { createUserApi, type UserListQuery } from "../common/user"
import { serverRequest } from "../core/server"

const api = createUserApi(serverRequest)

const listUsersFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  return api.list(ctx.data as UserListQuery | undefined)
})
export const listUsersFn = listUsersFnBase as unknown as (ctx: {
  data: UserListQuery | undefined
}) => Promise<PageResult<AppUser>>

const createUserFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  return api.create(ctx.data as CreateAppUser)
})
export const createUserFn = createUserFnBase as unknown as (ctx: { data: CreateAppUser }) => Promise<AppUser>

const findUserFnBase = createServerFn({ method: "GET" }).handler(async (ctx: { data: unknown }) => {
  return api.find(ctx.data as string)
})
export const findUserFn = findUserFnBase as unknown as (ctx: { data: string }) => Promise<AppUser>

const updateUserFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  return api.update(ctx.data as UpdateAppUser)
})
export const updateUserFn = updateUserFnBase as unknown as (ctx: { data: UpdateAppUser }) => Promise<AppUser>

const deleteUserFnBase = createServerFn({ method: "POST" }).handler(async (ctx: { data: unknown }) => {
  return api.delete(ctx.data as string)
})
export const deleteUserFn = deleteUserFnBase as unknown as (ctx: { data: string }) => Promise<boolean>
