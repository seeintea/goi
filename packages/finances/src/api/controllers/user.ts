import type { PageQuery, PageResult } from "@/types/api"
import { api } from "../client"

export type User = {
  userId: string
  username: string
  email: string
  phone: string
  isDisabled: boolean
  isDeleted: boolean
  createTime: string
  updateTime: string
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

export const createUser = (body: CreateUser) => api.post<User>("/api/sys/user/create", body)

export const findUser = (userId: string) => api.get<User>("/api/sys/user/find", { userId })

export const listUsers = (query?: UserListQuery) => api.get<PageResult<User>>("/api/sys/user/list", query)

export const updateUser = (body: UpdateUser) => api.post<User>("/api/sys/user/update", body)

export const deleteUser = (userId: string) => api.post<boolean>("/api/sys/user/delete", { userId })
