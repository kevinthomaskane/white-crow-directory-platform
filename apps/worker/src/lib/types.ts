import { Database, GooglePlacesSearchJobPayload } from '@white-crow/shared';

type Job = Database['public']['Tables']['jobs']['Row'];

export type BusinessReviewInsert =
  Database['public']['Tables']['business_reviews']['Insert'];

export type GooglePlacesSearchJob = {
  job_type: 'google_places_search';
  id: Job['id'];
  attempt_count: Job['attempt_count'];
  run_id: Job['run_id'];
  payload: GooglePlacesSearchJobPayload;
};
