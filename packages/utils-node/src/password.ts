import { createHash, randomBytes } from "node:crypto"

export const hashPassword = (password: string, salt: string): string => {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex")
}

export const generateSalt = (length = 16): string => {
  const bytes = Math.ceil(length / 2)
  return randomBytes(bytes).toString("hex").slice(0, length)
}

export const verifyPassword = (inputPassword: string, storedPassword: string, salt: string): boolean => {
  if (inputPassword === storedPassword) return true
  return hashPassword(inputPassword, salt) === storedPassword
}
