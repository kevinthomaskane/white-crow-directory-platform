'use server';

import {
  GooglePlacesSearchJobPayloadSchema,
  type GooglePlacesSearchJobPayload,
  type WorkerAPIResponse,
} from '@white-crow/shared';

export async function submitGooglePlacesSearchJob(
  payload: GooglePlacesSearchJobPayload
) {
  // Validate the payload with Zod
  const validatedPayload =
    GooglePlacesSearchJobPayloadSchema.safeParse(payload);
  if (!validatedPayload.success) {
    throw new Error('Invalid job payload.');
  }

  const workerAPIUrl = process.env.WORKER_API_URL;
  const workerAPIKey = process.env.WORKER_API_KEY;

  if (!workerAPIKey) {
    throw new Error('Worker API key is not configured on the server.');
  }

  if (!workerAPIUrl) {
    throw new Error('Worker API URL is not configured on the server.');
  }

  let res: Response;
  try {
    res = await fetch(`${workerAPIUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-worker-key': workerAPIKey,
      },
      body: JSON.stringify(validatedPayload.data),
    });
  } catch (error) {
    throw new Error('Worker API is unreachable.');
  }

  const { jobId, error }: WorkerAPIResponse = await res.json();
  if (error) {
    throw new Error(error);
  }
  return jobId;
}
