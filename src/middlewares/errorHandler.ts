import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors'

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' })
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    })
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, details: err.details ?? undefined })
  }
  const message = err instanceof Error ? err.message : 'Unknown error'
  return res.status(500).json({ error: 'Internal Server Error', message })
}
