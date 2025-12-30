import { notFound } from 'next/navigation';
import { parseRoute, getSiteConfig, getRouteContext } from '@/lib/routing';

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
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug = [] } = await params;

  const site = await getSiteConfig();
  if (!site) return notFound();

  const ctx = await getRouteContext(site);
  const route = parseRoute(site, slug, ctx);

  if (!route) return notFound();

  switch (route.type) {
    case 'home':
      return <HomePage site={site} ctx={ctx} />;

    case 'directory-base':
      return <DirectoryBasePage site={site} />;

    case 'directory-category':
      return <DirectoryCategoryPage site={site} category={route.category} />;

    case 'directory-category-city':
      return (
        <DirectoryCategoryCityPage
          site={site}
          category={route.category}
          city={route.city}
        />
      );

    case 'directory-business':
      return (
        <DirectoryBusinessPage
          site={site}
          category={route.category}
          city={route.city}
          businessId={route.businessId}
        />
      );

    case 'directory-city':
      return <DirectoryCityPage site={site} city={route.city} />;

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
