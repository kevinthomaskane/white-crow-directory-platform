import { notFound } from 'next/navigation';
import { parseRoute, getSiteConfig, getRouteContext } from '@/lib/routing';

// Page components
import {
  HomePage,
  DirectoryBasePage,
  DirectoryCategoryPage,
  DirectoryCategoryStatePage,
  DirectoryCategoryCityPage,
  DirectoryBusinessPage,
  DirectoryStatePage,
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
  const route = await parseRoute(site, slug, ctx);

  if (!route) return notFound();

  switch (route.type) {
    case 'home':
      return <HomePage site={site} />;

    case 'directory-base':
      return <DirectoryBasePage site={site} />;

    case 'directory-category':
      return <DirectoryCategoryPage site={site} category={route.category} />;

    case 'directory-category-state':
      return (
        <DirectoryCategoryStatePage
          site={site}
          category={route.category}
          state={route.state}
        />
      );

    case 'directory-category-city':
      return (
        <DirectoryCategoryCityPage
          site={site}
          category={route.category}
          city={route.city}
          state={route.state}
        />
      );

    case 'directory-business':
      return (
        <DirectoryBusinessPage
          site={site}
          category={route.category}
          city={route.city}
          state={route.state}
          businessId={route.businessId}
        />
      );

    case 'directory-state':
      return <DirectoryStatePage site={site} state={route.state} />;

    case 'directory-city':
      return <DirectoryCityPage site={site} city={route.city} state={route.state} />;

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
