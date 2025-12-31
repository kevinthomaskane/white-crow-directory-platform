import { Database, JobType, JobStatus } from '@white-crow/shared';

type Site = Database['public']['Tables']['sites']['Row'];
type Vertical = Database['public']['Tables']['verticals']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type State = Database['public']['Tables']['states']['Row'];
type City = Database['public']['Tables']['cities']['Row'];
type JobRow = Database['public']['Tables']['jobs']['Row'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];

// Site types
export type SiteTerminology = Pick<
  Vertical,
  'term_category' | 'term_categories' | 'term_business' | 'term_businesses' | 'term_cta'
>;

export type SiteConfig = Pick<
  Site,
  'id' | 'name' | 'vertical_id' | 'state_id' | 'hero_path' | 'logo_path' | 'favicon_path'
> & {
  vertical: (SiteTerminology & Pick<Vertical, 'slug'>) | null;
  state: Pick<State, 'code'> | null;
};

export type CategoryData = { slug: string; name: string };
export type CityData = { slug: string; name: string };

export interface RouteContext {
  categoryList: CategoryData[];
  cityList: CityData[];
  categories: Set<string>;
  cities: Set<string>;
}

export interface SiteStats {
  businessCount: number;
  categoryCount: number;
  cityCount: number;
}

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

export type SiteAssetType = 'hero' | 'logo' | 'favicon';
