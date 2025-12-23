import { z } from 'zod';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type JobType = 'google_places_search' | 'associate_site_businesses';

export const GooglePlacesSearchJobPayloadSchema = z.object({
  verticalId: z.uuid(),
  queryText: z.string().min(1),
  categoryId: z.uuid(),
});

export type GooglePlacesSearchJobPayload = z.infer<
  typeof GooglePlacesSearchJobPayloadSchema
>;

export type GooglePlacesSearchJobMeta = {
  total_places: number;
  processed_places: number;
  place_ids: string[];
  processed_place_ids: string[];
};

export const AssociateSiteBusinessesJobPayloadSchema = z.object({
  siteId: z.uuid(),
});

export type AssociateSiteBusinessesJobPayload = z.infer<
  typeof AssociateSiteBusinessesJobPayloadSchema
>;

export type AssociateSiteBusinessesJobMeta = {
  total_businesses: number;
  associated_businesses: number;
};
