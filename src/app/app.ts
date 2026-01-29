import express from 'express'
import { buildRoutes } from './routes'
import { errorHandler, notFound } from '../middlewares/errorHandler'
import { PrismaUserRepo, UserRepo } from '../repositories/userRepo'
import { AuthService } from '../services/authService'
import { UserService } from '../services/userService'
import { AuthController } from '../controllers/authController'
import { UserController } from '../controllers/userController'

export function createApp(deps?: { userRepo?: UserRepo }) {
  const app = express()
  app.use(express.json())

  const userRepo = deps?.userRepo ?? new PrismaUserRepo()
  const authService = new AuthService(userRepo)
  const userService = new UserService(userRepo)
  const authController = new AuthController(authService)
  const userController = new UserController(userService)

  app.use(
    buildRoutes({
      auth: authController,
      users: userController,
    })
  )

  app.use(notFound)
  app.use(errorHandler)

  return app
}
