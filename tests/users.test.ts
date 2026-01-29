import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app/app'
import { InMemoryUserRepo } from '../src/repositories/userRepo'

function buildApp() {
  return createApp({ userRepo: new InMemoryUserRepo() })
}

async function registerAndLogin(app: ReturnType<typeof buildApp>, input: { email: string; name: string; password: string }) {
  await request(app).post('/auth/register').send(input)
  const login = await request(app).post('/auth/login').send({
    email: input.email,
    password: input.password,
  })
  return login.body.token as string
}

describe('users', () => {
  it('requires auth for /users/me', async () => {
    const app = buildApp()
    const res = await request(app).get('/users/me')

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Missing Bearer token')
  })

  it('returns profile for /users/me', async () => {
    const app = buildApp()
    const token = await registerAndLogin(app, {
      email: 'admin@example.com',
      name: 'Admin',
      password: 'password123',
    })

    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('admin@example.com')
    expect(res.body.role).toBe('admin')
  })

  it('allows admin to list users', async () => {
    const app = buildApp()
    const adminToken = await registerAndLogin(app, {
      email: 'admin@example.com',
      name: 'Admin',
      password: 'password123',
    })

    await request(app).post('/auth/register').send({
      email: 'user@example.com',
      name: 'User',
      password: 'password123',
    })

    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.users.length).toBe(2)
  })

  it('forbids non-admin from listing users', async () => {
    const app = buildApp()

    await request(app).post('/auth/register').send({
      email: 'admin@example.com',
      name: 'Admin',
      password: 'password123',
    })

    const userToken = await registerAndLogin(app, {
      email: 'user@example.com',
      name: 'User',
      password: 'password123',
    })

    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Forbidden')
  })

  it('allows admin to get and delete a user by id', async () => {
    const app = buildApp()
    const adminToken = await registerAndLogin(app, {
      email: 'admin@example.com',
      name: 'Admin',
      password: 'password123',
    })

    const register = await request(app).post('/auth/register').send({
      email: 'user@example.com',
      name: 'User',
      password: 'password123',
    })

    const userId = register.body.user.id as string

    const getRes = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(getRes.status).toBe(200)
    expect(getRes.body.email).toBe('user@example.com')

    const deleteRes = await request(app)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(deleteRes.status).toBe(200)
    expect(deleteRes.body.deleted).toBe(true)
  })
})
