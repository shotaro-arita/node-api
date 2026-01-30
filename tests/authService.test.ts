import { describe, expect, it } from 'vitest'
import { AuthService } from '../src/services/authService'
import { InMemoryUserRepo } from '../src/repositories/userRepo'
import { AppError } from '../src/lib/errors'

function buildService() {
  const repo = new InMemoryUserRepo()
  const service = new AuthService(repo)
  return { repo, service }
}

describe('AuthService', () => {
  it('registers the first user as admin', async () => {
    const { service } = buildService()
    const result = await service.register({
      email: 'admin@example.com',
      name: 'Admin',
      password: 'password123',
    })

    expect(result.token).toBeTypeOf('string')
    expect(result.user).toMatchObject({
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin',
    })
  })

  it('registers the second user as user', async () => {
    const { service } = buildService()

    await service.register({
      email: 'admin@example.com',
      name: 'Admin',
      password: 'password123',
    })

    const result = await service.register({
      email: 'user@example.com',
      name: 'User',
      password: 'password123',
    })

    expect(result.user.role).toBe('user')
  })

  it('rejects duplicate emails', async () => {
    const { service } = buildService()

    await service.register({
      email: 'user@example.com',
      name: 'User',
      password: 'password123',
    })

    await expect(
      service.register({
        email: 'user@example.com',
        name: 'User2',
        password: 'password123',
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('logs in with valid credentials', async () => {
    const { service } = buildService()

    await service.register({
      email: 'user@example.com',
      name: 'User',
      password: 'password123',
    })

    const result = await service.login({
      email: 'user@example.com',
      password: 'password123',
    })

    expect(result.token).toBeTypeOf('string')
    expect(result.user.email).toBe('user@example.com')
  })

  it('rejects invalid credentials', async () => {
    const { service } = buildService()

    await service.register({
      email: 'user@example.com',
      name: 'User',
      password: 'password123',
    })

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'wrong-password',
      })
    ).rejects.toBeInstanceOf(AppError)
  })
})
