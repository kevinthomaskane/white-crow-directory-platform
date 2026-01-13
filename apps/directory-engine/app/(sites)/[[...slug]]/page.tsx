import { notFound } from 'next/navigation';
import { parseRoute } from '@/lib/routing';
import { getSiteConfig, getRouteContext, getSiteStats } from '@/lib/data/site';

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
