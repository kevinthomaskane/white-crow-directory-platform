import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';

// Load .env.local first, then fall back to .env
dotenv.config({ path: '.env.local' });
dotenv.config(); // This will load .env if .env.local doesn't have the variable
import { verifyWorkerKey } from './middleware/auth.js';
import {
  GooglePlacesSearchJobPayloadSchema,
  type GooglePlacesSearchJobPayload,
  type WorkerAPIResponse,
} from '@white-crow/shared';

const app = express();
app.use(express.json());
app.use(verifyWorkerKey);

const PORT = process.env.PORT || 3001;

app.post('/jobs', (req: Request, res: Response) => {
  // Validate the payload with Zod
  const result = GooglePlacesSearchJobPayloadSchema.safeParse(req.body);

  if (!result.success) {
    const invalidPayloadResponse: WorkerAPIResponse = {
      data: null,
      error: 'Invalid job payload.',
    };
    return res.status(400).json(invalidPayloadResponse);
  }

  const validatedPayload: GooglePlacesSearchJobPayload = result.data;

  const successResponse: WorkerAPIResponse = {
    data: {
      jobId: '123',
    },
    error: null,
  };
  res.status(202).json(successResponse);
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
