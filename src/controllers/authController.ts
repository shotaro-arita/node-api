import { Request, Response } from 'express'
import { registerSchema, loginSchema } from '../schemas/authSchemas'
import { AuthService } from '../services/authService'

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const input = registerSchema.parse(req.body)
    const result = await this.authService.register(input)
    res.status(201).json(result)
  }

  login = async (req: Request, res: Response) => {
    const input = loginSchema.parse(req.body)
    const result = await this.authService.login(input)
    res.status(200).json(result)
  }
}
