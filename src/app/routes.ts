import { Router } from 'express'
import { asyncHandler } from '../middlewares/asyncHandler'
import { requireAuth, requireRole } from '../middlewares/auth'
import { AuthController } from '../controllers/authController'
import { UserController } from '../controllers/userController'

export function buildRoutes(deps: { auth: AuthController; users: UserController }) {
  const router = Router()

  router.get('/health', (_req, res) => res.json({ ok: true }))

  router.post('/auth/register', asyncHandler(deps.auth.register))
  router.post('/auth/login', asyncHandler(deps.auth.login))

  router.get('/users/me', requireAuth, asyncHandler(deps.users.me))

  // admin only
  router.get('/users', requireAuth, requireRole('admin'), asyncHandler(deps.users.list))
  router.get('/users/:id', requireAuth, requireRole('admin'), asyncHandler(deps.users.getById))
  router.patch('/users/:id', requireAuth, requireRole('admin'), asyncHandler(deps.users.updateById))
  router.delete('/users/:id', requireAuth, requireRole('admin'), asyncHandler(deps.users.deleteById))

  return router
}
