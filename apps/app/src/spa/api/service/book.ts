import type { PageQuery, PageResult } from "@/types/api"
import { api } from "../client"

export type Book = {
  bookId: string
  name: string
  currency: string
  timezone: string
  ownerUserId: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export type CreateBook = {
  name: string
  currency?: string
  timezone?: string
  ownerUserId: string
}

export type UpdateBook = {
  bookId: string
  name?: string
  currency?: string
  timezone?: string
  ownerUserId?: string
  isDeleted?: boolean
}

export type BookListQuery = PageQuery & {
  ownerUserId?: string
  name?: string
}

export const createBook = (body: CreateBook) => api.post<Book>("/api/ff/book/create", body)

export const findBook = (bookId: string) => api.get<Book>("/api/ff/book/find", { bookId })

export const listBooks = (query?: BookListQuery) => api.get<PageResult<Book>>("/api/ff/book/list", query)

export const updateBook = (body: UpdateBook) => api.post<Book>("/api/ff/book/update", body)

export const deleteBook = (bookId: string) => api.post<boolean>("/api/ff/book/delete", { bookId })
