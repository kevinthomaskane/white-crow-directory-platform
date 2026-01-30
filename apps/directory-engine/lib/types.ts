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
  | 'term_category'
  | 'term_categories'
  | 'term_business'
  | 'term_businesses'
  | 'term_cta'
>;

export type SiteConfig = Pick<
  Site,
  | 'id'
  | 'name'
  | 'vertical_id'
  | 'state_id'
  | 'hero_path'
  | 'logo_path'
  | 'favicon_path'
> & {
  vertical: (SiteTerminology & Pick<Vertical, 'slug'>) | null;
  state: Pick<State, 'code'> | null;
};

export type CategoryData = { slug: string; name: string };
export type CityData = { slug: string; name: string; population: number | null };

export interface RouteContext {
  categoryList: CategoryData[];
  cityList: CityData[];
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

/**
 * Business hours as an array of weekday descriptions
 * e.g., ["Monday: 9:00 AM – 5:00 PM", "Tuesday: 9:00 AM – 5:00 PM", ...]
 */
export type BusinessHours = string[];

export type SiteAssetType = 'hero' | 'logo' | 'favicon';

// Business types
type Business = Database['public']['Tables']['businesses']['Row'];

type SiteBusiness = Database['public']['Tables']['site_businesses']['Row'];
type BusinessReviewSource =
  Database['public']['Tables']['business_review_sources']['Row'];

export type BusinessCardData = Pick<
  Business,
  | 'id'
  | 'name'
  | 'city'
  | 'main_photo_name'
  | 'phone'
  | 'website'
  | 'formatted_address'
> &
  Pick<SiteBusiness, 'is_claimed' | 'plan'> & {
    category: CategoryData | null;
    reviewSource: Pick<
      BusinessReviewSource,
      'rating' | 'provider' | 'review_count'
    > | null;
  };

// Map types
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export type MapBusinessData = Pick<
  Business,
  'id' | 'name' | 'city' | 'phone' | 'formatted_address'
> & {
  latitude: number;
  longitude: number;
  rating: number | null;
  review_count: number | null;
  categorySlug: string | null;
};

// Business detail types
type BusinessReview = Database['public']['Tables']['business_reviews']['Row'];

export type BusinessDetailData = Pick<
  Business,
  | 'id'
  | 'name'
  | 'city'
  | 'state'
  | 'postal_code'
  | 'street_address'
  | 'formatted_address'
  | 'phone'
  | 'website'
  | 'main_photo_name'
  | 'hours'
  | 'latitude'
  | 'longitude'
> &
  Pick<SiteBusiness, 'is_claimed' | 'description'> & {
    site_business_id: string;
    categories: CategoryData[];
    reviewSources: Pick<
      BusinessReviewSource,
      'rating' | 'provider' | 'review_count' | 'url'
    >[];
  };

export type BusinessReviewData = Pick<
  BusinessReview,
  | 'id'
  | 'author_name'
  | 'author_image_url'
  | 'rating'
  | 'text'
  | 'time'
  | 'source'
>;
