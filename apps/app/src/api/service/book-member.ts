import type { PageQuery, PageResult } from "@/types/api"
import { api } from "../client"

export type BookMember = {
  memberId: string
  bookId: string
  userId: string
  roleCode: string
  scopeType: string
  scope: unknown
  isDeleted: boolean
  createTime: string
  updateTime: string
}

export type CreateBookMember = {
  bookId: string
  userId: string
  roleCode: string
  scopeType?: string
  scope?: unknown
}

export type UpdateBookMember = {
  memberId: string
  roleCode?: string
  scopeType?: string
  scope?: unknown
  isDeleted?: boolean
}

export type BookMemberListQuery = PageQuery & {
  bookId?: string
  userId?: string
}

export const createBookMember = (body: CreateBookMember) => api.post<BookMember>("/api/ff/book-member/create", body)

export const findBookMember = (memberId: string) => api.get<BookMember>("/api/ff/book-member/find", { memberId })

export const listBookMembers = (query?: BookMemberListQuery) =>
  api.get<PageResult<BookMember>>("/api/ff/book-member/list", query)

export const updateBookMember = (body: UpdateBookMember) => api.post<BookMember>("/api/ff/book-member/update", body)

export const deleteBookMember = (memberId: string) => api.post<boolean>("/api/ff/book-member/delete", { memberId })
