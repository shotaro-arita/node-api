import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env'
import { Role } from '../types/user'

export type JwtPayload = {
  sub: string
  role: Role
}

export function signAccessToken(payload: JwtPayload): string {
  const secret: Secret = env.JWT_SECRET

  const expiresIn: NonNullable<SignOptions['expiresIn']> = env.JWT_EXPIRES_IN as any

  const options: SignOptions = { expiresIn }
  return jwt.sign(payload, secret, options)
}

export function verifyAccessToken(token: string): JwtPayload {
  const secret: Secret = env.JWT_SECRET
  const decoded = jwt.verify(token, secret)

  if (typeof decoded !== 'object' || decoded === null) throw new Error('Invalid token')

  const sub = (decoded as any).sub
  const role = (decoded as any).role
  return { sub, role }
}
