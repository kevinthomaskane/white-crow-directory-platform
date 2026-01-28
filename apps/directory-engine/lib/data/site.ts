import { cache } from 'react';
import { headers } from 'next/headers';
import { createServiceRoleClient } from '@white-crow/shared';
import { slugify } from '@/lib/utils';
import type {
  SiteConfig,
  RouteContext,
  CategoryData,
  CityData,
  PopularCityData,
  SiteStats,
  BusinessCardData,
  MapBusinessData,
  MapBounds,
  BusinessDetailData,
  BusinessReviewData,
} from '@/lib/types';

export const getSiteConfig = cache(async (): Promise<SiteConfig | null> => {
  const headersList = await headers();
  const domain = headersList.get('x-site');

  if (!domain) return null;

  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data: site } = await supabase
    .from('sites')
    .select(
      `
      id,
      name,
      vertical_id,
      state_id,
      hero_path,
      logo_path,
      favicon_path,
      vertical:verticals(slug, term_category, term_categories, term_business, term_businesses, term_cta),
      state:states(code)
    `
    )
    .eq('domain', domain.toLowerCase())
    .single();

  if (!site) return null;

  const siteConfig: SiteConfig = {
    id: site.id,
    name: site.name,
    vertical_id: site.vertical_id,
    state_id: site.state_id,
    hero_path: site.hero_path,
    logo_path: site.logo_path,
    favicon_path: site.favicon_path,
    vertical: site.vertical,
    state: site.state,
  };

  return siteConfig;
});

export const getRouteContext = cache(
  async (site: SiteConfig): Promise<RouteContext> => {
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const [siteCategories, siteCities] = await Promise.all([
      supabase
        .from('site_categories')
        .select('category:categories(slug, name)')
        .eq('site_id', site.id),
      supabase
        .from('site_cities')
        .select('city:cities(name)')
        .eq('site_id', site.id),
    ]);

    const categoryList: CategoryData[] = (siteCategories.data || [])
      .map((sc) => {
        const cat = sc.category as { slug: string; name: string } | null;
        return cat ? { slug: cat.slug, name: cat.name } : null;
      })
      .filter((c): c is CategoryData => c !== null);

    const cityList: CityData[] = (siteCities.data || [])
      .map((sc) => {
        const city = sc.city as { name: string } | null;
        return city ? { slug: slugify(city.name), name: city.name } : null;
      })
      .filter((c): c is CityData => c !== null);

    return {
      categoryList,
      cityList,
      categories: new Set(categoryList.map((c) => c.slug)),
      cities: new Set(cityList.map((c) => c.slug)),
    };
  }
);

export interface SiteFormOptions {
  categories: { id: string; name: string }[];
  cities: { id: string; name: string }[];
}

export const getSiteFormOptions = cache(
  async (site: SiteConfig): Promise<SiteFormOptions> => {
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const [categoriesResult, citiesResult] = await Promise.all([
      supabase
        .from('site_categories')
        .select('category:categories(id, name)')
        .eq('site_id', site.id),
      supabase
        .from('site_cities')
        .select('city:cities(id, name)')
        .eq('site_id', site.id),
    ]);

    const categories = (categoriesResult.data || [])
      .map((sc) => {
        const cat = sc.category as { id: string; name: string } | null;
        return cat ? { id: cat.id, name: cat.name } : null;
      })
      .filter((c): c is { id: string; name: string } => c !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    const cities = (citiesResult.data || [])
      .map((sc) => {
        const city = sc.city as { id: string; name: string } | null;
        return city ? { id: city.id, name: city.name } : null;
      })
      .filter((c): c is { id: string; name: string } => c !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    return { categories, cities };
  }
);

export const getSiteStats = cache(
  async (site: SiteConfig, ctx: RouteContext): Promise<SiteStats> => {
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const { count } = await supabase
      .from('site_businesses')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', site.id);

    return {
      businessCount: count ?? 0,
      categoryCount: ctx.categoryList.length,
      cityCount: ctx.cityList.length,
    };
  }
);

export const getPopularCities = cache(
  async (siteId: string, limit = 30): Promise<PopularCityData[]> => {
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const { data } = await supabase
      .from('site_cities')
      .select('city:cities(name, population)')
      .eq('site_id', siteId)
      .order('city(population)', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (!data) return [];

    return data
      .map((sc) => {
        const city = sc.city;
        return city
          ? {
              slug: slugify(city.name),
              name: city.name,
              population: city.population,
            }
          : null;
      })
      .filter((c) => c !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
);

export const getTopBusinesses = cache(
  async (siteId: string, limit = 10): Promise<BusinessCardData[]> => {
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // Get site's category slugs first
    const { data: siteCategories } = await supabase
      .from('site_categories')
      .select('category:categories(slug)')
      .eq('site_id', siteId);

    const siteCategorySlugs = new Set(
      (siteCategories || [])
        .map((sc) => sc.category?.slug)
        .filter((s): s is string => s !== null)
    );

    // Fetch all site businesses with their details
    const { data } = await supabase
      .from('site_businesses')
      .select(
        `
        is_claimed,
        business:businesses(
          id,
          name,
          city,
          main_photo_name,
          phone,
          website,
          formatted_address,
          business_review_sources(rating, provider, review_count),
          business_categories(category:categories(slug, name))
        )
      `
      )
      .eq('site_id', siteId);

    if (!data) return [];

    // Transform and filter to only businesses with ratings
    const businesses = data
      .map((sb) => {
        const business = sb.business;
        if (!business) return null;

        const reviewSource = business.business_review_sources?.[0] ?? null;

        // Skip businesses without ratings
        if (!reviewSource?.rating) return null;

        // Find the first category that belongs to this site
        const matchingCategoryJoin = business.business_categories?.find(
          (bc) => bc.category && siteCategorySlugs.has(bc.category.slug)
        );
        const category = matchingCategoryJoin?.category
          ? {
              slug: matchingCategoryJoin.category.slug,
              name: matchingCategoryJoin.category.name,
            }
          : null;

        return {
          id: business.id,
          name: business.name,
          city: business.city,
          main_photo_name: business.main_photo_name,
          phone: business.phone,
          website: business.website,
          formatted_address: business.formatted_address,
          is_claimed: sb.is_claimed,
          category,
          reviewSource,
        };
      })
      .filter((b) => b !== null);

    // Sort by rating descending and limit results
    return businesses
      .sort(
        (a, b) => (b.reviewSource?.rating ?? 0) - (a.reviewSource?.rating ?? 0)
      )
      .slice(0, limit);
  }
);

// Map data functions
export interface InitialMapData {
  center: { latitude: number; longitude: number };
  cityName: string;
  businesses: MapBusinessData[];
}

export const getInitialMapData = cache(
  async (siteId: string, limit = 200): Promise<InitialMapData | null> => {
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // Get the most populous city for this site
    const { data: cityData } = await supabase
      .from('site_cities')
      .select('city:cities(id, name, latitude, longitude, population)')
      .eq('site_id', siteId)
      .order('city(population)', { ascending: false, nullsFirst: false })
      .limit(1)
      .single();

    if (!cityData?.city) return null;

    const city = cityData.city as {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      population: number | null;
    };

    // Get businesses in this city
    const { data: businessData } = await supabase
      .from('site_businesses')
      .select(
        `
        business:businesses!inner(
          id,
          name,
          city,
          latitude,
          longitude,
          phone,
          formatted_address,
          city_id,
          business_review_sources(rating, review_count),
          business_categories(category:categories(slug))
        )
      `
      )
      .eq('site_id', siteId)
      .limit(limit);

    if (!businessData) {
      return {
        center: { latitude: city.latitude, longitude: city.longitude },
        cityName: city.name,
        businesses: [],
      };
    }

    // Filter to businesses in the target city with valid coordinates
    const businesses: MapBusinessData[] = businessData
      .map((sb) => {
        const business = sb.business;
        if (!business || !business.latitude || !business.longitude) return null;
        if (business.city_id !== city.id) return null;

        const reviewSource = business.business_review_sources?.[0];
        const categoryJoin = business.business_categories?.[0];
        const categorySlug = categoryJoin?.category?.slug ?? null;

        return {
          id: business.id,
          name: business.name,
          city: business.city,
          latitude: business.latitude,
          longitude: business.longitude,
          phone: business.phone,
          formatted_address: business.formatted_address,
          rating: reviewSource?.rating ?? null,
          review_count: reviewSource?.review_count ?? null,
          categorySlug,
        };
      })
      .filter((b) => b !== null);

    return {
      center: { latitude: city.latitude, longitude: city.longitude },
      cityName: city.name,
      businesses,
    };
  }
);

export interface PaginatedBusinesses {
  businesses: BusinessCardData[];
  total: number;
  hasMore: boolean;
}

export const getBusinessesByCategory = cache(
  async (
    siteId: string,
    categorySlug: string,
    page = 1,
    limit = 12
  ): Promise<PaginatedBusinesses> => {
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const offset = (page - 1) * limit;

    // Get total count
    const { count } = await supabase
      .from('site_businesses')
      .select(
        `
        business:businesses!inner(
          business_categories!inner(category:categories!inner(slug))
        )
      `,
        { count: 'exact', head: true }
      )
      .eq('site_id', siteId)
      .eq('business.business_categories.category.slug', categorySlug);

    // Fetch businesses with pagination
    const { data } = await supabase
      .from('site_businesses')
      .select(
        `
        is_claimed,
        business:businesses!inner(
          id,
          name,
          city,
          main_photo_name,
          phone,
          website,
          formatted_address,
          business_review_sources(rating, provider, review_count),
          business_categories!inner(category:categories!inner(slug, name))
        )
      `
      )
      .eq('site_id', siteId)
      .eq('business.business_categories.category.slug', categorySlug)
      .range(offset, offset + limit - 1);

    if (!data) {
      return { businesses: [], total: 0, hasMore: false };
    }

    const businesses: BusinessCardData[] = data
      .map((sb) => {
        const business = sb.business;
        if (!business) return null;

        const reviewSource = business.business_review_sources?.[0] ?? null;
        const categoryJoin = business.business_categories?.[0];
        const category = categoryJoin?.category
          ? {
              slug: categoryJoin.category.slug,
              name: categoryJoin.category.name,
            }
          : null;

        return {
          id: business.id,
          name: business.name,
          city: business.city,
          main_photo_name: business.main_photo_name,
          phone: business.phone,
          website: business.website,
          formatted_address: business.formatted_address,
          is_claimed: sb.is_claimed,
          category,
          reviewSource,
        };
      })
      .filter((b) => b !== null);

    const total = count ?? 0;

    return {
      businesses,
      total,
      hasMore: offset + businesses.length < total,
    };
  }
);

export const getBusinessesByCity = cache(
  async (
    siteId: string,
    citySlug: string,
    page = 1,
    limit = 12
  ): Promise<PaginatedBusinesses> => {
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const offset = (page - 1) * limit;

    // Get site's category slugs first
    const { data: siteCategories } = await supabase
      .from('site_categories')
      .select('category:categories(slug)')
      .eq('site_id', siteId);

    const siteCategorySlugs = new Set(
      (siteCategories || [])
        .map((sc) => (sc.category as { slug: string } | null)?.slug)
        .filter((s): s is string => s !== null)
    );

    // Get total count of businesses in this city
    const { count } = await supabase
      .from('site_businesses')
      .select(
        `
        business:businesses!inner(
          city
        )
      `,
        { count: 'exact', head: true }
      )
      .eq('site_id', siteId)
      .ilike('business.city', citySlug.replace(/-/g, ' '));

    // Fetch businesses with pagination
    const { data } = await supabase
      .from('site_businesses')
      .select(
        `
        is_claimed,
        business:businesses!inner(
          id,
          name,
          city,
          main_photo_name,
          phone,
          website,
          formatted_address,
          business_review_sources(rating, provider, review_count),
          business_categories(category:categories(slug, name))
        )
      `
      )
      .eq('site_id', siteId)
      .ilike('business.city', citySlug.replace(/-/g, ' '))
      .range(offset, offset + limit - 1);

    if (!data) {
      return { businesses: [], total: 0, hasMore: false };
    }

    const businesses: BusinessCardData[] = data
      .map((sb) => {
        const business = sb.business;
        if (!business) return null;

        const reviewSource = business.business_review_sources?.[0] ?? null;

        // Find the first category that belongs to this site
        const matchingCategoryJoin = business.business_categories?.find(
          (bc) => bc.category && siteCategorySlugs.has(bc.category.slug)
        );
        const category = matchingCategoryJoin?.category
          ? {
              slug: matchingCategoryJoin.category.slug,
              name: matchingCategoryJoin.category.name,
            }
          : null;

        return {
          id: business.id,
          name: business.name,
          city: business.city,
          main_photo_name: business.main_photo_name,
          phone: business.phone,
          website: business.website,
          formatted_address: business.formatted_address,
          is_claimed: sb.is_claimed,
          category,
          reviewSource,
        };
      })
      .filter((b) => b !== null);

    const total = count ?? 0;

    return {
      businesses,
      total,
      hasMore: offset + businesses.length < total,
    };
  }
);

export const getBusinessesByCategoryAndCity = cache(
  async (
    siteId: string,
    categorySlug: string,
    citySlug: string,
    page = 1,
    limit = 12
  ): Promise<PaginatedBusinesses> => {
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const offset = (page - 1) * limit;

    // Get total count
    const { count } = await supabase
      .from('site_businesses')
      .select(
        `
        business:businesses!inner(
          city,
          business_categories!inner(category:categories!inner(slug))
        )
      `,
        { count: 'exact', head: true }
      )
      .eq('site_id', siteId)
      .eq('business.business_categories.category.slug', categorySlug)
      .ilike('business.city', citySlug.replace(/-/g, ' '));

    // Fetch businesses with pagination
    const { data } = await supabase
      .from('site_businesses')
      .select(
        `
        is_claimed,
        business:businesses!inner(
          id,
          name,
          city,
          main_photo_name,
          phone,
          website,
          formatted_address,
          business_review_sources(rating, provider, review_count),
          business_categories!inner(category:categories!inner(slug, name))
        )
      `
      )
      .eq('site_id', siteId)
      .eq('business.business_categories.category.slug', categorySlug)
      .ilike('business.city', citySlug.replace(/-/g, ' '))
      .range(offset, offset + limit - 1);

    if (!data) {
      return { businesses: [], total: 0, hasMore: false };
    }

    const businesses: BusinessCardData[] = data
      .map((sb) => {
        const business = sb.business;
        if (!business) return null;

        const reviewSource = business.business_review_sources?.[0] ?? null;
        const categoryJoin = business.business_categories?.[0];
        const category = categoryJoin?.category
          ? {
              slug: categoryJoin.category.slug,
              name: categoryJoin.category.name,
            }
          : null;

        return {
          id: business.id,
          name: business.name,
          city: business.city,
          main_photo_name: business.main_photo_name,
          phone: business.phone,
          website: business.website,
          formatted_address: business.formatted_address,
          is_claimed: sb.is_claimed,
          category,
          reviewSource,
        };
      })
      .filter((b) => b !== null);

    const total = count ?? 0;

    return {
      businesses,
      total,
      hasMore: offset + businesses.length < total,
    };
  }
);

export async function getBusinessesInBounds(
  siteId: string,
  bounds: MapBounds,
  limit = 200,
  excludeIds: string[] = []
): Promise<MapBusinessData[]> {
  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  // Build query for businesses within bounds
  const query = supabase
    .from('site_businesses')
    .select(
      `
      business:businesses!inner(
        id,
        name,
        city,
        latitude,
        longitude,
        phone,
        formatted_address,
        business_review_sources(rating, review_count),
        business_categories(category:categories(slug))
      )
    `
    )
    .eq('site_id', siteId)
    .gte('business.latitude', bounds.south)
    .lte('business.latitude', bounds.north)
    .gte('business.longitude', bounds.west)
    .lte('business.longitude', bounds.east)
    .limit(limit);

  const { data } = await query;

  if (!data) return [];

  // Transform and filter
  const businesses: MapBusinessData[] = data
    .map((sb) => {
      const business = sb.business;
      if (!business || !business.latitude || !business.longitude) return null;
      if (excludeIds.includes(business.id)) return null;

      const reviewSource = business.business_review_sources?.[0];
      const categoryJoin = business.business_categories?.[0];
      const categorySlug = categoryJoin?.category?.slug ?? null;

      return {
        id: business.id,
        name: business.name,
        city: business.city,
        latitude: business.latitude,
        longitude: business.longitude,
        phone: business.phone,
        formatted_address: business.formatted_address,
        rating: reviewSource?.rating ?? null,
        review_count: reviewSource?.review_count ?? null,
        categorySlug,
      };
    })
    .filter((b) => b !== null);

  return businesses;
}

export const getBusinessDetails = cache(
  async (
    siteId: string,
    businessId: string
  ): Promise<BusinessDetailData | null> => {
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // Get site's category slugs first
    const { data: siteCategories } = await supabase
      .from('site_categories')
      .select('category:categories(slug)')
      .eq('site_id', siteId);

    const siteCategorySlugs = new Set(
      (siteCategories || [])
        .map((sc) => (sc.category as { slug: string } | null)?.slug)
        .filter((s): s is string => s !== null)
    );

    const { data } = await supabase
      .from('site_businesses')
      .select(
        `
        id,
        is_claimed,
        description,
        main_photo,
        business:businesses!inner(
          id,
          name,
          city,
          state,
          postal_code,
          street_address,
          formatted_address,
          phone,
          website,
          main_photo_name,
          hours,
          latitude,
          longitude,
          business_review_sources(rating, provider, review_count, url),
          business_categories(category:categories(slug, name))
        )
      `
      )
      .eq('site_id', siteId)
      .eq('business.id', businessId)
      .single();

    if (!data?.business) return null;

    const business = data.business;

    // Filter to only categories that belong to this site
    const categories: CategoryData[] = (business.business_categories || [])
      .map((bc) => {
        const cat = bc.category as { slug: string; name: string } | null;
        return cat && siteCategorySlugs.has(cat.slug)
          ? { slug: cat.slug, name: cat.name }
          : null;
      })
      .filter((c): c is CategoryData => c !== null);

    const reviewSources = (business.business_review_sources || []).map(
      (rs) => ({
        rating: rs.rating,
        provider: rs.provider,
        review_count: rs.review_count,
        url: rs.url,
      })
    );

    return {
      id: business.id,
      name: business.name,
      city: business.city,
      state: business.state,
      description: data.description,
      postal_code: business.postal_code,
      street_address: business.street_address,
      formatted_address: business.formatted_address,
      phone: business.phone,
      website: business.website,
      main_photo_name: data.main_photo ?? business.main_photo_name,
      hours: business.hours,
      latitude: business.latitude,
      longitude: business.longitude,
      is_claimed: data.is_claimed,
      site_business_id: data.id,
      categories,
      reviewSources,
    };
  }
);

export const getBusinessReviews = cache(
  async (businessId: string, limit = 10): Promise<BusinessReviewData[]> => {
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const { data } = await supabase
      .from('business_reviews')
      .select('id, author_name, author_image_url, rating, text, time, source')
      .eq('business_id', businessId)
      .order('time', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (!data) return [];

    return data;
  }
);

export const getRelatedBusinesses = cache(
  async (
    siteId: string,
    businessId: string,
    categorySlug: string | null,
    cityName: string | null,
    limit = 6
  ): Promise<BusinessCardData[]> => {
    const supabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // Get site's category slugs first
    const { data: siteCategories } = await supabase
      .from('site_categories')
      .select('category:categories(slug)')
      .eq('site_id', siteId);

    const siteCategorySlugs = new Set(
      (siteCategories || [])
        .map((sc) => (sc.category as { slug: string } | null)?.slug)
        .filter((s): s is string => s !== null)
    );

    let query = supabase
      .from('site_businesses')
      .select(
        `
        is_claimed,
        business:businesses!inner(
          id,
          name,
          city,
          main_photo_name,
          phone,
          website,
          formatted_address,
          business_review_sources(rating, provider, review_count),
          business_categories(category:categories(slug, name))
        )
      `
      )
      .eq('site_id', siteId)
      .neq('business.id', businessId);

    if (categorySlug) {
      query = query.eq(
        'business.business_categories.category.slug',
        categorySlug
      );
    }

    if (cityName) {
      query = query.ilike('business.city', cityName);
    }

    const { data } = await query.limit(limit);

    if (!data) return [];

    const businesses: BusinessCardData[] = data
      .map((sb) => {
        const business = sb.business;
        if (!business) return null;

        const reviewSource = business.business_review_sources?.[0] ?? null;

        // Find the first category that belongs to this site
        const matchingCategoryJoin = business.business_categories?.find(
          (bc) => bc.category && siteCategorySlugs.has(bc.category.slug)
        );
        const category = matchingCategoryJoin?.category
          ? {
              slug: matchingCategoryJoin.category.slug,
              name: matchingCategoryJoin.category.name,
            }
          : null;

        return {
          id: business.id,
          name: business.name,
          city: business.city,
          main_photo_name: business.main_photo_name,
          phone: business.phone,
          website: business.website,
          formatted_address: business.formatted_address,
          is_claimed: sb.is_claimed,
          category,
          reviewSource,
        };
      })
      .filter((b) => b !== null);

    return businesses;
  }
);
