'use server';

import {
  createTypesenseClient,
  BUSINESSES_COLLECTION,
  type BusinessDocument,
} from '@white-crow/shared';
import { getSiteConfig } from '@/lib/data/site';

export type SearchResult = {
  business_id: string;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  formatted_address?: string;
  category_names: string[];
  rating?: number;
  review_count?: number;
};

export type SearchResponse = {
  results: SearchResult[];
  found: number;
  page: number;
  totalPages: number;
};

type SearchBusinessesParams = {
  query: string;
  categoryId?: string;
  city?: string;
  page?: number;
  perPage?: number;
};

export async function searchBusinesses(
  params: SearchBusinessesParams
): Promise<SearchResponse> {
  const { query, categoryId, city, page = 1, perPage = 20 } = params;

  const site = await getSiteConfig();
  if (!site) {
    return { results: [], found: 0, page: 1, totalPages: 0 };
  }

  const typesense = createTypesenseClient({
    apiKey: process.env.TYPESENSE_API_KEY!,
    host: process.env.TYPESENSE_HOST!,
    port: 8108,
    protocol: process.env.NODE_ENV === 'production' ? 'https' : 'http',
  });

  // Build filter string
  const filters: string[] = [`site_ids:=${site.id}`];

  if (categoryId) {
    filters.push(`category_ids:=${categoryId}`);
  }

  if (city) {
    filters.push(`city:=${city}`);
  }

  const filterBy = filters.join(' && ');

  try {
    const searchResult = await typesense
      .collections<BusinessDocument>(BUSINESSES_COLLECTION)
      .documents()
      .search({
        q: query || '*',
        query_by: 'name,description,city,category_names',
        filter_by: filterBy,
        per_page: perPage,
        page,
        sort_by: query
          ? '_text_match:desc,review_count:desc'
          : 'review_count:desc',
      });

    const results: SearchResult[] = (searchResult.hits || []).map((hit) => {
      const doc = hit.document;
      return {
        business_id: doc.business_id,
        name: doc.name,
        description: doc.description,
        city: doc.city,
        state: doc.state,
        formatted_address: doc.formatted_address,
        category_names: doc.category_names,
        rating: doc.rating,
        review_count: doc.review_count,
      };
    });

    return {
      results,
      found: searchResult.found,
      page,
      totalPages: Math.ceil(searchResult.found / perPage),
    };
  } catch (err) {
    console.error('Search error:', err);
    return { results: [], found: 0, page: 1, totalPages: 0 };
  }
}
