import bcrypt from 'bcrypt'
import { env } from '../config/env'
import { AppError } from '../lib/errors'
import { signAccessToken } from '../lib/jwt'
import { UserRepo } from '../repositories/userRepo'
import { Role, User } from '../types/user'

function newId(): string {
  return String(Date.now()) + '-' + Math.random().toString(16).slice(2)
}

export class AuthService {
  constructor(private userRepo: UserRepo) {}

  async register(input: { email: string; name: string; password: string }) {
    const existing = await this.userRepo.findByEmail(input.email)
    if (existing) throw new AppError(409, 'Email already registered')

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS)

    const all = await this.userRepo.list()
    const role: Role = all.length === 0 ? 'admin' : 'user'

    const user: User = {
      id: newId(),
      email: input.email,
      name: input.name,
      role,
      passwordHash,
      createdAt: new Date(),
    }
    await this.userRepo.create(user)

    const token = signAccessToken({ sub: user.id, role: user.role })
    return { token, user: this.publicUser(user) }
  }

  async login(input: { email: string; password: string }) {
    const user = await this.userRepo.findByEmail(input.email)
    if (!user) throw new AppError(401, 'Invalid credentials')

    const ok = await bcrypt.compare(input.password, user.passwordHash)
    if (!ok) throw new AppError(401, 'Invalid credentials')

    const token = signAccessToken({ sub: user.id, role: user.role })
    return { token, user: this.publicUser(user) }
  }

  publicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    }
  }
}
