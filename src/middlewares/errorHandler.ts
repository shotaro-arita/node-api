import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors'

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' })
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, details: err.details ?? undefined })
  }
  const message = err instanceof Error ? err.message : 'Unknown error'
  return res.status(500).json({ error: 'Internal Server Error', message })
}
