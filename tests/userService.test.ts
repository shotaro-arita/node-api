import { describe, expect, it } from 'vitest'
import { UserService } from '../src/services/userService'
import { InMemoryUserRepo } from '../src/repositories/userRepo'
import { AppError } from '../src/lib/errors'
import { User } from '../src/types/user'

function buildService() {
  const repo = new InMemoryUserRepo()
  const service = new UserService(repo)
  return { repo, service }
}

function makeUser(overrides?: Partial<User>): User {
  return {
    id: overrides?.id ?? `user_${Date.now()}`,
    email: overrides?.email ?? 'user@example.com',
    name: overrides?.name ?? 'User',
    role: overrides?.role ?? 'user',
    passwordHash: overrides?.passwordHash ?? 'hash',
    createdAt: overrides?.createdAt ?? new Date(),
  }
}

describe('UserService', () => {
  it('returns current user via me()', async () => {
    const { repo, service } = buildService()
    const user = makeUser({ id: 'u1', email: 'me@example.com' })
    await repo.create(user)

    const result = await service.me('u1')

    expect(result).toMatchObject({ id: 'u1', email: 'me@example.com' })
    expect((result as any).passwordHash).toBeUndefined()
  })

  it('throws 404 for me() when missing', async () => {
    const { service } = buildService()
    await expect(service.me('missing')).rejects.toBeInstanceOf(AppError)
  })

  it('lists users without passwordHash', async () => {
    const { repo, service } = buildService()
    await repo.create(makeUser({ id: 'u1', email: 'a@example.com' }))
    await repo.create(makeUser({ id: 'u2', email: 'b@example.com' }))

    const users = await service.list()

    expect(users.length).toBe(2)
    expect((users[0] as any).passwordHash).toBeUndefined()
  })

  it('gets user by id', async () => {
    const { repo, service } = buildService()
    await repo.create(makeUser({ id: 'u1', email: 'a@example.com' }))

    const user = await service.getById('u1')

    expect(user.email).toBe('a@example.com')
  })

  it('deletes existing user', async () => {
    const { repo, service } = buildService()
    await repo.create(makeUser({ id: 'u1' }))

    const result = await service.deleteById('u1')

    expect(result.deleted).toBe(true)
    expect(await repo.findById('u1')).toBeNull()
  })

  it('throws 404 when deleting missing user', async () => {
    const { service } = buildService()
    await expect(service.deleteById('missing')).rejects.toBeInstanceOf(AppError)
  })
})
