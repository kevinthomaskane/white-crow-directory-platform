import {
  Database,
  GooglePlacesSearchJobPayload,
  AssociateSiteBusinessesJobPayload,
  SyncBusinessesToSearchJobPayload,
  RefreshSiteBusinessesJobPayload,
} from '@white-crow/shared';

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

export type AssociateSiteBusinessesJob = {
  job_type: 'associate_site_businesses';
  id: Job['id'];
  attempt_count: Job['attempt_count'];
  run_id: Job['run_id'];
  payload: AssociateSiteBusinessesJobPayload;
};

export type SyncBusinessesToSearchJob = {
  job_type: 'sync_businesses_to_search';
  id: Job['id'];
  attempt_count: Job['attempt_count'];
  run_id: Job['run_id'];
  payload: SyncBusinessesToSearchJobPayload;
};

export type RefreshSiteBusinessesJob = {
  job_type: 'refresh_site_businesses';
  id: Job['id'];
  attempt_count: Job['attempt_count'];
  run_id: Job['run_id'];
  payload: RefreshSiteBusinessesJobPayload;
};
