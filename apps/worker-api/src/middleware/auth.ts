import { type WorkerAPIResponse } from '@white-crow/shared';
import { Request, Response, NextFunction } from 'express';

export function verifyWorkerKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const headerKey = req.headers['x-worker-key'];

  if (!headerKey || headerKey !== process.env.WORKER_API_KEY) {
    const responsePayload: WorkerAPIResponse = {
      error: 'Invalid or missing worker API key.',
    };
    return res.status(401).json(responsePayload);
  }

  next();
}
