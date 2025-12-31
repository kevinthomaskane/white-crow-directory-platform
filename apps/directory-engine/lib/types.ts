import { Database, JobType, JobStatus } from '@white-crow/shared';

type Vertical = Database['public']['Tables']['verticals']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type State = Database['public']['Tables']['states']['Row'];
type City = Database['public']['Tables']['cities']['Row'];
type JobRow = Database['public']['Tables']['jobs']['Row'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];

export type EditVertical = Pick<
  Vertical,
  | 'id'
  | 'name'
  | 'slug'
  | 'term_category'
  | 'term_categories'
  | 'term_business'
  | 'term_businesses'
  | 'term_cta'
  | 'logo_url'
  | 'default_hero_url'
>;

export type VerticalTerminology = Pick<
  Vertical,
  | 'term_category'
  | 'term_categories'
  | 'term_business'
  | 'term_businesses'
  | 'term_cta'
>;

export type VerticalMinimal = Pick<Vertical, 'id' | 'name' | 'slug'>;

export type StateMinimal = Pick<State, 'id' | 'name' | 'code'>;

export type CategoryMinimal = Pick<
  Category,
  'id' | 'name' | 'slug' | 'vertical_id'
>;

export type CityMinimal = Pick<City, 'id' | 'name' | 'state_id' | 'population'>;

export type JobInsertMinimal = JobInsert & {
  job_type: JobType;
  status: JobStatus;
};

export type JobMinimal = Pick<
  JobRow,
  | 'id'
  | 'job_type'
  | 'status'
  | 'progress'
  | 'error'
  | 'meta'
  | 'payload'
  | 'created_at'
  | 'updated_at'
  | 'attempt_count'
  | 'max_attempts'
>;

export type ActionsResponse<T> =
  | {
      ok: false;
      error: string;
    }
  | {
      ok: true;
      data: T;
    };

export type VerticalAssetType = 'hero' | 'logo' | 'favicon';
