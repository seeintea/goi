import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { BookMemberListQuery, CreateBookMember, UpdateBookMember } from "../controllers/book-member"
import {
  createBookMember,
  deleteBookMember,
  findBookMember,
  listBookMembers,
  updateBookMember,
} from "../controllers/book-member"

export const bookMemberKeys = {
  all: ["book-member"] as const,
  list: (query?: BookMemberListQuery) => [...bookMemberKeys.all, "list", query ?? null] as const,
  find: (memberId: string) => [...bookMemberKeys.all, "find", memberId] as const,
}

export function useBookMemberList(query?: BookMemberListQuery) {
  return useQuery({
    queryKey: bookMemberKeys.list(query),
    queryFn: async () => {
      const resp = await listBookMembers(query)
      return resp.data
    },
  })
}

export function useBookMember(memberId: string) {
  return useQuery({
    queryKey: bookMemberKeys.find(memberId),
    queryFn: async () => {
      const resp = await findBookMember(memberId)
      return resp.data
    },
    enabled: Boolean(memberId),
  })
}

export function useCreateBookMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateBookMember) => {
      const resp = await createBookMember(body)
      return resp.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookMemberKeys.all })
    },
  })
}

export function useUpdateBookMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateBookMember) => {
      const resp = await updateBookMember(body)
      return resp.data
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: bookMemberKeys.list() })
      queryClient.invalidateQueries({ queryKey: bookMemberKeys.find(member.memberId) })
    },
  })
}

export function useDeleteBookMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (memberId: string) => {
      const resp = await deleteBookMember(memberId)
      return resp.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookMemberKeys.all })
    },
  })
}
