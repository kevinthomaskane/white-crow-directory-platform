import { Database, GooglePlacesSearchJobPayload } from '@white-crow/shared';

type Job = Database['public']['Tables']['jobs']['Row'];

export type BusinessReviewInsert =
  Database['public']['Tables']['business_reviews']['Insert'];

export type GooglePlacesSearchJobMeta = {
  total_places: number;
  processed_places: number;
  place_ids: string[];
  processed_place_ids: string[];
};

export type GooglePlacesSearchJob = {
  job_type: 'google_places_search';
  id: Job['id'];
  attempt_count: Job['attempt_count'];
  run_id: Job['run_id'];
  payload: GooglePlacesSearchJobPayload;
};
