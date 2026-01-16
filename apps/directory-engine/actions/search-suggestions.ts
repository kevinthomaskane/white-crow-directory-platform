'use server';

import {
  createTypesenseClient,
  BUSINESSES_COLLECTION,
  type BusinessDocument,
} from '@white-crow/shared';
import { getSiteConfig, getRouteContext } from '@/lib/data/site';

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
    // Get site categories to filter results
    const routeContext = await getRouteContext(site);
    const siteCategoryNameToSlug = new Map(
      routeContext.categoryList.map((c) => [c.name, c.slug])
    );

    const result = await typesense
      .collections<BusinessDocument>(BUSINESSES_COLLECTION)
      .documents()
      .search({
        q: query,
        query_by: 'name',
        filter_by: `site_ids:=${site.id}`,
        per_page: 5,
      });

    return (result.hits || []).map((hit) => {
      // Find the first category that belongs to this site
      const matchingCategoryName = hit.document.category_names?.find(
        (name: string) => siteCategoryNameToSlug.has(name)
      );
      const categorySlug = matchingCategoryName
        ? siteCategoryNameToSlug.get(matchingCategoryName)
        : undefined;

      return {
        id: hit.document.business_id,
        name: hit.document.name,
        city: hit.document.city,
        categorySlug,
      };
    });
  } catch (err) {
    console.error('Business suggestions error:', err);
    return [];
  }
}
