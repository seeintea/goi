export interface UserPayload {
  sub: string
  username: string
  email?: string
  roles?: string[]
}
