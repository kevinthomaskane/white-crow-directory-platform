import { z } from 'zod';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type JobType = 'google_places_search';

export const GooglePlacesSearchJobPayloadSchema = z.object({
  vertical: z.uuid(),
  query: z.string().min(1),
  category: z.uuid(),
});

export type GooglePlacesSearchJobPayload = z.infer<
  typeof GooglePlacesSearchJobPayloadSchema
>;
