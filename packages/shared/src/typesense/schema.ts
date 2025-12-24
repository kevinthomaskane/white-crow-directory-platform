import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

export const BUSINESSES_COLLECTION = 'businesses';

export const businessesSchema: CollectionCreateSchema = {
  name: BUSINESSES_COLLECTION,
  fields: [
    { name: 'business_id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'description', type: 'string', optional: true },
    { name: 'formatted_address', type: 'string', optional: true },
    { name: 'city', type: 'string', optional: true, facet: true },
    { name: 'state', type: 'string', optional: true, facet: true },
    { name: 'phone', type: 'string', optional: true },
    { name: 'website', type: 'string', optional: true },
    { name: 'site_ids', type: 'string[]', facet: true },
    { name: 'category_ids', type: 'string[]', facet: true },
    { name: 'category_names', type: 'string[]', facet: true },
    { name: 'rating', type: 'float', optional: true, facet: true },
    { name: 'review_count', type: 'int32', optional: true },
    { name: 'location', type: 'geopoint', optional: true },
  ],
};

export type BusinessDocument = {
  business_id: string;
  name: string;
  description?: string;
  formatted_address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  site_ids: string[];
  category_ids: string[];
  category_names: string[];
  rating?: number;
  review_count: number;
  location?: [number, number]; // [lat, lng]
};
