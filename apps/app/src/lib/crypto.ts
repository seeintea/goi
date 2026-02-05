export async function sha1Hex(input: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    throw new Error("当前环境不支持 WebCrypto")
  }
  const data = new TextEncoder().encode(input)
  const digest = await subtle.digest("SHA-1", data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}
