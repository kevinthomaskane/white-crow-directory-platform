'use server';

import {
  createTypesenseClient,
  BUSINESSES_COLLECTION,
  type BusinessDocument,
} from '@white-crow/shared';
import { getSiteConfig } from '@/lib/routing';

export type BusinessSuggestion = {
  id: string;
  name: string;
  city?: string;
  categorySlug?: string;
};

export async function getBusinessSuggestions(
  query: string
): Promise<BusinessSuggestion[]> {
  if (!query.trim() || query.length < 2) {
    return [];
  }

  const site = await getSiteConfig();
  if (!site) {
    return [];
  }

  const typesense = createTypesenseClient({
    apiKey: process.env.TYPESENSE_API_KEY!,
    host: process.env.TYPESENSE_HOST!,
    port: 8108,
    protocol: process.env.NODE_ENV === 'production' ? 'https' : 'http',
  });

  try {
    const result = await typesense
      .collections<BusinessDocument>(BUSINESSES_COLLECTION)
      .documents()
      .search({
        q: query,
        query_by: 'name',
        filter_by: `site_ids:=${site.id}`,
        per_page: 5,
      });

    console.log(JSON.stringify(result, null, 2));
    return (result.hits || []).map((hit) => ({
      id: hit.document.business_id,
      name: hit.document.name,
      city: hit.document.city,
      categorySlug: hit.document.category_names[0]
        ?.toLowerCase()
        .replace(/\s+/g, '-'),
    }));
  } catch (err) {
    console.error('Business suggestions error:', err);
    return [];
  }
}
