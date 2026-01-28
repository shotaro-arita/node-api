import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors'
import { verifyAccessToken } from '../lib/jwt'
import { Role } from '../types/user'

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; role: Role }
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) throw new AppError(401, 'Missing Bearer token')

  const token = header.slice('Bearer '.length)
  try {
    const payload = verifyAccessToken(token)
    req.auth = { userId: payload.sub, role: payload.role }
    next()
  } catch {
    throw new AppError(401, 'Invalid or expired token')
  }
}

export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) throw new AppError(401, 'Unauthenticated')
    if (req.auth.role !== role) throw new AppError(403, 'Forbidden')
    next()
  }
}
