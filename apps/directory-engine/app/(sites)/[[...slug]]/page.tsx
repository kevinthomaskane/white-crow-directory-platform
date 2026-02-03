import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { parseRoute } from '@/lib/routing';
import {
  getSiteConfig,
  getRouteContext,
  getSiteStats,
  getBusinessDetails,
} from '@/lib/data/site';
import { buildDirectoryUrl } from '@/lib/utils';

// Page components
import {
  HomePage,
  DirectoryBasePage,
  DirectoryCategoryPage,
  DirectoryCategoryCityPage,
  DirectoryBusinessPage,
  DirectoryCityPage,
  ContentCategoryPage,
  ContentArticlePage,
} from '@/components/sites/pages';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;

  const site = await getSiteConfig();
  if (!site) return {};

  const ctx = await getRouteContext(site);
  const route = parseRoute(site, slug, ctx);

  if (!route) return {};

  const baseUrl = `https://${site.domain}`;
  const basePath = site.vertical?.slug ?? '';
  const singleCity = ctx.cityList.length === 1;
  const singleCategory = ctx.categoryList.length === 1;
  const termBusinesses = site.vertical?.term_businesses ?? 'Businesses';

  switch (route.type) {
    case 'home':
      return {
        title: `Find ${termBusinesses.toLowerCase()} you can trust`,
        description: `Find the best ${termBusinesses.toLowerCase()} in your area.`,
        alternates: { canonical: baseUrl },
      };

    case 'directory-base': {
      const url = buildDirectoryUrl({ basePath, singleCity, singleCategory });
      return {
        title: `Browse ${termBusinesses}`,
        description: `Browse our directory of ${termBusinesses.toLowerCase()}. Find reviews, ratings, and contact information.`,
        alternates: { canonical: `${baseUrl}${url}` },
      };
    }

    case 'directory-category': {
      const category = ctx.categoryList.find((c) => c.slug === route.category);
      if (!category) return {};
      const url = buildDirectoryUrl({
        basePath,
        categorySlug: category.slug,
        singleCity,
        singleCategory,
      });
      return {
        title: category.name,
        description: `Find ${category.name.toLowerCase()} ${termBusinesses.toLowerCase()}. Browse reviews, ratings, and contact information.`,
        alternates: { canonical: `${baseUrl}${url}` },
      };
    }

    case 'directory-city': {
      const city = ctx.cityList.find((c) => c.slug === route.city);
      if (!city) return {};
      const url = buildDirectoryUrl({
        basePath,
        citySlug: city.slug,
        singleCity,
        singleCategory,
      });
      return {
        title: `${termBusinesses} in ${city.name}`,
        description: `Find ${termBusinesses.toLowerCase()} in ${city.name}. Browse reviews, ratings, and contact information.`,
        alternates: { canonical: `${baseUrl}${url}` },
      };
    }

    case 'directory-category-city': {
      const category = ctx.categoryList.find((c) => c.slug === route.category);
      const city = ctx.cityList.find((c) => c.slug === route.city);
      if (!category || !city) return {};
      const url = buildDirectoryUrl({
        basePath,
        categorySlug: category.slug,
        citySlug: city.slug,
        singleCity,
        singleCategory,
      });
      return {
        title: `${category.name} in ${city.name}`,
        description: `Find ${category.name.toLowerCase()} ${termBusinesses.toLowerCase()} in ${city.name}. Browse reviews, ratings, and contact information.`,
        alternates: { canonical: `${baseUrl}${url}` },
      };
    }

    case 'directory-business': {
      const business = await getBusinessDetails(
        site.id,
        ctx.categoryList,
        route.businessId
      );
      if (!business) return {};
      const locationParts = [business.city, business.state]
        .filter(Boolean)
        .join(', ');
      const url = buildDirectoryUrl({
        basePath,
        categorySlug: route.category,
        citySlug: route.city,
        businessId: route.businessId,
        singleCity,
        singleCategory,
      });
      return {
        title: business.name,
        description: business.formatted_address
          ? `${business.name}${locationParts ? ` in ${locationParts}` : ''}. View reviews, ratings, hours, and contact information.`
          : `View ${business.name} reviews, ratings, hours, and contact information.`,
        alternates: { canonical: `${baseUrl}${url}` },
      };
    }

    case 'content-category':
      return {
        title: route.category,
        description: `Browse ${route.category} content and articles.`,
        alternates: { canonical: `${baseUrl}/${route.category}` },
      };

    case 'content-article':
      return {
        title: route.articleSlug.replace(/-/g, ' '),
        alternates: {
          canonical: `${baseUrl}/${route.category}/${route.articleSlug}`,
        },
      };

    default:
      return {};
  }
}

export default async function CatchAllPage({
  params,
  searchParams,
}: PageProps) {
  const { slug = [] } = await params;

  const site = await getSiteConfig();
  if (!site) return notFound();

  const ctx = await getRouteContext(site);
  const route = parseRoute(site, slug, ctx);

  if (!route) return notFound();

  switch (route.type) {
    case 'home': {
      const stats = await getSiteStats(site, ctx);
      return <HomePage site={site} ctx={ctx} stats={stats} />;
    }

    case 'directory-base':
      return <DirectoryBasePage ctx={ctx} site={site} />;

    case 'directory-category':
      const category = ctx.categoryList.find((c) => c.slug === route.category);
      if (!category) return notFound();
      const { page } = await searchParams;
      let initialPage = 1;
      if (page && typeof page === 'string') {
        initialPage = parseInt(page);
      }
      return (
        <DirectoryCategoryPage
          page={initialPage}
          ctx={ctx}
          site={site}
          category={category}
        />
      );

    case 'directory-category-city': {
      const catCityCategory = ctx.categoryList.find(
        (c) => c.slug === route.category
      );
      const catCityCity = ctx.cityList.find((c) => c.slug === route.city);
      if (!catCityCategory || !catCityCity) return notFound();
      const { page: catCityPage } = await searchParams;
      let initialCatCityPage = 1;
      if (catCityPage && typeof catCityPage === 'string') {
        initialCatCityPage = parseInt(catCityPage);
      }
      return (
        <DirectoryCategoryCityPage
          site={site}
          ctx={ctx}
          category={catCityCategory}
          city={catCityCity}
          page={initialCatCityPage}
        />
      );
    }

    case 'directory-business':
      return (
        <DirectoryBusinessPage
          site={site}
          ctx={ctx}
          category={route.category}
          city={route.city}
          businessId={route.businessId}
        />
      );

    case 'directory-city': {
      const cityData = ctx.cityList.find((c) => c.slug === route.city);
      if (!cityData) return notFound();
      const { page: cityPage } = await searchParams;
      let initialCityPage = 1;
      if (cityPage && typeof cityPage === 'string') {
        initialCityPage = parseInt(cityPage);
      }
      return (
        <DirectoryCityPage
          site={site}
          ctx={ctx}
          city={cityData}
          page={initialCityPage}
        />
      );
    }

    case 'content-category':
      return <ContentCategoryPage site={site} category={route.category} />;

    case 'content-article':
      return (
        <ContentArticlePage
          site={site}
          category={route.category}
          articleSlug={route.articleSlug}
        />
      );

    default:
      return notFound();
  }
}
