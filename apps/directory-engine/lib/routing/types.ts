import type { VerticalTerminology } from '@/lib/types';

export type RouteType =
  | 'home'
  | 'directory-base'
  | 'directory-category'
  | 'directory-category-city'
  | 'directory-business'
  | 'directory-city'
  | 'content-category'
  | 'content-article';

export type ParsedRoute =
  | { type: 'home' }
  | { type: 'directory-base'; basePath: string }
  | { type: 'directory-category'; basePath: string; category: string }
  | {
      type: 'directory-category-city';
      basePath: string;
      category: string;
      city: string;
    }
  | {
      type: 'directory-business';
      basePath: string;
      category: string;
      city: string;
      businessId: string;
    }
  | { type: 'directory-city'; basePath: string; city: string }
  | { type: 'content-category'; category: string }
  | { type: 'content-article'; category: string; articleSlug: string };

export interface SiteConfig {
  id: string;
  name: string;
  basePath: string;
  verticalId: string;
  stateId: string;
  stateCode: string;
  terminology: VerticalTerminology;
  defaultHeroUrl: string | null;
}

export type CategoryData = { slug: string; name: string };
export type CityData = { slug: string; name: string };

export interface RouteContext {
  /** Full category data for UI display */
  categoryList: CategoryData[];
  /** Full city data for UI display */
  cityList: CityData[];
  /** Category slugs for fast route matching */
  categories: Set<string>;
  /** City slugs for fast route matching */
  cities: Set<string>;
}
