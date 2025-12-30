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

export type VerticalMinimal = {
  id: Vertical['id'];
  name: Vertical['name'];
  slug: Vertical['slug'];
};

export type StateMinimal = {
  id: State['id'];
  name: State['name'];
  code: State['code'];
};

export type CategoryMinimal = {
  id: Category['id'];
  name: Category['name'];
  slug: Category['slug'];
  vertical_id: Category['vertical_id'];
};

export type CityMinimal = {
  id: City['id'];
  name: City['name'];
  state_id: City['state_id'];
  population: City['population'] | null;
};

export type JobInsertMinimal = JobInsert & {
  job_type: JobType;
  status: JobStatus;
};

export type JobMinimal = {
  id: JobRow['id'];
  job_type: JobRow['job_type'];
  status: JobRow['status'];
  progress: JobRow['progress'];
  error: JobRow['error'];
  meta: JobRow['meta'];
  payload: JobRow['payload'];
  created_at: JobRow['created_at'];
  updated_at: JobRow['updated_at'];
  attempt_count: JobRow['attempt_count'];
  max_attempts: JobRow['max_attempts'];
};

export type ActionsResponse<T> =
  | {
      ok: false;
      error: string;
    }
  | {
      ok: true;
      data: T;
    };
