import { Database, JobType, JobStatus } from '@white-crow/shared';

type Vertical = Database['public']['Tables']['verticals']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type State = Database['public']['Tables']['states']['Row'];
type City = Database['public']['Tables']['cities']['Row'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];

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

export type ActionsResponse<T> =
  | {
      ok: false;
      error: string;
    }
  | {
      ok: true;
      data: T;
    };
