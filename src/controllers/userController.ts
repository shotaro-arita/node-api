import { Request, Response } from 'express'
import { UserService } from '../services/userService'

export class UserController {
  constructor(private userService: UserService) {}

  me = async (req: Request, res: Response) => {
    const userId = req.auth!.userId
    const result = await this.userService.me(userId)
    res.json(result)
  }

  list = async (_req: Request, res: Response) => {
    const result = await this.userService.list()
    res.json({ users: result })
  }

  getById = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const result = await this.userService.getById(id)
    res.json(result)
  }

  deleteById = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const result = await this.userService.deleteById(id)
    res.json(result)
  }
}
