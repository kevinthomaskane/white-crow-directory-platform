export type RouteType =
  | 'home'
  | 'directory-base'
  | 'directory-category'
  | 'directory-category-state'
  | 'directory-category-city'
  | 'directory-business'
  | 'directory-state'
  | 'directory-city'
  | 'content-category'
  | 'content-article';

export type ParsedRoute =
  | { type: 'home' }
  | { type: 'directory-base'; basePath: string }
  | { type: 'directory-category'; basePath: string; category: string }
  | { type: 'directory-category-state'; basePath: string; category: string; state: string }
  | { type: 'directory-category-city'; basePath: string; category: string; city: string; state: string }
  | { type: 'directory-business'; basePath: string; category: string; city: string; state: string; businessId: string }
  | { type: 'directory-state'; basePath: string; state: string }
  | { type: 'directory-city'; basePath: string; city: string; state: string }
  | { type: 'content-category'; category: string }
  | { type: 'content-article'; category: string; articleSlug: string };

export interface SiteConfig {
  id: string;
  name: string;
  basePath: string;
  verticalId: string;
  stateId: string;
  stateCode: string;
}

export interface RouteContext {
  categories: Set<string>;
  stateCodes: Set<string>;
  getCitySlugs: (stateCode: string) => Promise<Set<string>>;
}
