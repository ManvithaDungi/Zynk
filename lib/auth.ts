import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

export interface User {
  userId: string
  email: string
  username: string
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as User
    return decoded
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get("token")?.value
  return token || null
}

export function getUserFromRequest(request: NextRequest): User | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}
