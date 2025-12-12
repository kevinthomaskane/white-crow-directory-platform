import { Request, Response, NextFunction } from 'express';

export function verifyWorkerKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const headerKey = req.headers['x-worker-key'];

  if (!headerKey || headerKey !== process.env.WORKER_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}
