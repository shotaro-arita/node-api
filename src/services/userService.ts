import { AppError } from '../lib/errors'
import { UserRepo } from '../repositories/userRepo'
import { Role } from '../types/user'

export class UserService {
  constructor(private userRepo: UserRepo) {}

  async me(userId: string) {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new AppError(404, 'User not found')
    return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }
  }

  async list() {
    const users = await this.userRepo.list()
    return users.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt }))
  }

  async getById(id: string) {
    const user = await this.userRepo.findById(id)
    if (!user) throw new AppError(404, 'User not found')
    return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }
  }

  async updateById(id: string, input: { name?: string; role?: Role }) {
    const user = await this.userRepo.updateById(id, input)
    if (!user) throw new AppError(404, 'User not found')
    return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }
  }

  async deleteById(id: string) {
    const ok = await this.userRepo.deleteById(id)
    if (!ok) throw new AppError(404, 'User not found')
    return { deleted: true }
  }
}
