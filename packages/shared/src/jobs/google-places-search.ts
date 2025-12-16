import { z } from 'zod';
/**
 * Individual query with its associated metadata
 */
export const PlacesSearchQuerySchema = z.object({
  query: z.string().min(1),
  category: z.uuid(),
});
export type PlacesSearchQuery = z.infer<typeof PlacesSearchQuerySchema>;

/**
 * Payload for Google Places Search job
 */
export const GooglePlacesSearchJobPayloadSchema = z.object({
  jobType: z.literal('google-places-search'),
  vertical: z.uuid(),
  queries: z.array(PlacesSearchQuerySchema).min(1),
});
export type GooglePlacesSearchJobPayload = z.infer<
  typeof GooglePlacesSearchJobPayloadSchema
>;
