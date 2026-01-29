import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app/app'
import { InMemoryUserRepo } from '../src/repositories/userRepo'

function buildApp() {
  return createApp({ userRepo: new InMemoryUserRepo() })
}

describe('auth', () => {
  it('registers the first user as admin', async () => {
    const app = buildApp()
    const res = await request(app).post('/auth/register').send({
      email: 'admin@example.com',
      name: 'Admin',
      password: 'password123',
    })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeTypeOf('string')
    expect(res.body.user).toMatchObject({
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin',
    })
  })

  it('registers the second user as user', async () => {
    const app = buildApp()

    await request(app).post('/auth/register').send({
      email: 'admin@example.com',
      name: 'Admin',
      password: 'password123',
    })

    const res = await request(app).post('/auth/register').send({
      email: 'user@example.com',
      name: 'User',
      password: 'password123',
    })

    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({
      email: 'user@example.com',
      name: 'User',
      role: 'user',
    })
  })

  it('logs in with valid credentials', async () => {
    const app = buildApp()

    await request(app).post('/auth/register').send({
      email: 'user@example.com',
      name: 'User',
      password: 'password123',
    })

    const res = await request(app).post('/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeTypeOf('string')
    expect(res.body.user).toMatchObject({
      email: 'user@example.com',
      name: 'User',
      role: 'admin',
    })
  })

  it('rejects login with invalid credentials', async () => {
    const app = buildApp()

    await request(app).post('/auth/register').send({
      email: 'user@example.com',
      name: 'User',
      password: 'password123',
    })

    const res = await request(app).post('/auth/login').send({
      email: 'user@example.com',
      password: 'wrong-password',
    })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials')
  })
})
