import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  type Book,
  type BookListQuery,
  type CreateBook,
  createBook,
  deleteBook,
  findBook,
  listBooks,
  type UpdateBook,
  updateBook,
} from "../service/book"

export const bookKeys = {
  all: ["book"] as const,
  lists: () => [...bookKeys.all, "list"] as const,
  list: (query?: BookListQuery) => [...bookKeys.all, "list", query ?? null] as const,
  find: (bookId: string) => [...bookKeys.all, "find", bookId] as const,
}

export function useBookList(query?: BookListQuery) {
  return useQuery({
    queryKey: bookKeys.list(query),
    queryFn: async () => {
      const resp = await listBooks(query)
      return resp.data
    },
  })
}

export function useBook(bookId: string) {
  return useQuery<Book>({
    queryKey: bookKeys.find(bookId),
    queryFn: async () => {
      const resp = await findBook(bookId)
      return resp.data
    },
    enabled: Boolean(bookId),
  })
}

export function useCreateBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateBook) => {
      const resp = await createBook(body)
      return resp.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
    },
  })
}

export function useUpdateBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateBook) => {
      const resp = await updateBook(body)
      return resp.data
    },
    onSuccess: (book) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bookKeys.find(book.bookId) })
    },
  })
}

export function useDeleteBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bookId: string) => {
      const resp = await deleteBook(bookId)
      return resp.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
    },
  })
}
