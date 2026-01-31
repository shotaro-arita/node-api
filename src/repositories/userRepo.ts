import { User } from '../types/user'
import { prisma } from '../lib/prisma'

export interface UserRepo {
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  list(): Promise<User[]>
  create(user: User): Promise<User>
  updateById(id: string, input: { name?: string; role?: User['role'] }): Promise<User | null>
  deleteById(id: string): Promise<boolean>
}

export class PrismaUserRepo implements UserRepo {
  async findByEmail(email: string) {
    const u = await prisma.user.findUnique({ where: { email } })
    return u
      ? {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role as any,
          passwordHash: u.passwordHash,
          createdAt: u.createdAt,
        }
      : null
  }

  async findById(id: string) {
    const u = await prisma.user.findUnique({ where: { id } })
    return u
      ? {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role as any,
          passwordHash: u.passwordHash,
          createdAt: u.createdAt,
        }
      : null
  }

  async list() {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as any,
      passwordHash: u.passwordHash,
      createdAt: u.createdAt,
    }))
  }

  async create(user: User) {
    const u = await prisma.user.create({
      data: {
        id: user.id, // ここは任意：cuidに任せたいなら渡さず、User型も変える
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
      },
    })
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as any,
      passwordHash: u.passwordHash,
      createdAt: u.createdAt,
    }
  }

  async updateById(id: string, input: { name?: string; role?: User['role'] }) {
    try {
      const u = await prisma.user.update({
        where: { id },
        data: {
          name: input.name,
          role: input.role,
        },
      })
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as any,
        passwordHash: u.passwordHash,
        createdAt: u.createdAt,
      }
    } catch {
      return null
    }
  }

  async deleteById(id: string) {
    try {
      await prisma.user.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  }
}

// インメモリ実装
export class InMemoryUserRepo implements UserRepo {
  private users: User[] = []

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null
  }

  async findById(id: string) {
    return this.users.find((u) => u.id === id) ?? null
  }

  async list() {
    return [...this.users]
  }

  async create(user: User) {
    this.users.push(user)
    return user
  }

  async updateById(id: string, input: { name?: string; role?: User['role'] }) {
    const idx = this.users.findIndex((u) => u.id === id)
    if (idx === -1) return null
    const current = this.users[idx]
    const updated = {
      ...current,
      name: input.name ?? current.name,
      role: input.role ?? current.role,
    }
    this.users[idx] = updated
    return updated
  }

  async deleteById(id: string) {
    const before = this.users.length
    this.users = this.users.filter((u) => u.id !== id)
    return this.users.length !== before
  }
}
