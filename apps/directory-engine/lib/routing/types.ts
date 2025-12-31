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
