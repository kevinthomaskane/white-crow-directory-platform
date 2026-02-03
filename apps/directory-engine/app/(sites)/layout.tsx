import type { Metadata } from 'next';
import { SiteHeader, type NavItem } from '@/components/sites/site-header';
import { SiteFooter } from '@/components/sites/site-footer';
import { getSiteConfig, getRouteContext } from '@/lib/data/site';
import { AuthProvider } from '@/contexts/auth-context';
import { organizationSchema, websiteSchema } from '@/lib/schemas';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();

  if (!siteConfig) {
    return {};
  }

  const siteUrl = `https://${siteConfig.domain}`;
  const termBusinesses =
    siteConfig.vertical?.term_businesses?.toLowerCase() ?? 'businesses';
  const description = `Find the best ${termBusinesses} in your area. Browse our directory of trusted ${termBusinesses} with reviews and ratings.`;
  const faviconUrl = siteConfig.favicon_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${siteConfig.favicon_path}`
    : null;

  return {
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    ...(faviconUrl && {
      icons: {
        icon: faviconUrl,
      },
    }),
    description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: siteConfig.name,
      description,
      url: siteUrl,
      ...(siteConfig.logo_path && {
        images: [{ url: siteConfig.logo_path }],
      }),
    },
    twitter: {
      card: 'summary',
      title: siteConfig.name,
      description,
    },
  };
}

interface NavContext {
  basePath: string;
  terminology: {
    term_cta: string | null;
    term_business: string | null;
    term_category: string | null;
  };
  hasMultipleCategories: boolean;
  hasMultipleCities: boolean;
}

function buildNavItems(ctx: NavContext): NavItem[] {
  const ctaLabel = ctx.terminology.term_cta || 'Browse Directory';
  const categoryLabel = ctx.terminology.term_category || 'Categories';

  const subItems: { label: string; href: string }[] = [];

  if (ctx.hasMultipleCities) {
    subItems.push({
      label: 'By Location',
      href: `/${ctx.basePath}#by-location`,
    });
  }

  if (ctx.hasMultipleCategories) {
    subItems.push({
      label: `By ${categoryLabel}`,
      href: `/${ctx.basePath}#by-category`,
    });
  }

  const mainNavItem: NavItem = {
    label: ctaLabel,
    href: `/${ctx.basePath}`,
  };

  if (subItems.length > 0) {
    subItems.push({
      label: 'View All',
      href: `/${ctx.basePath}`,
    });
    mainNavItem.hasSubNav = true;
    mainNavItem.subItems = subItems;
  }

  const businessLabel = ctx.terminology.term_business || 'Business';

  return [
    mainNavItem,
    { label: `Submit ${businessLabel}`, href: '/submit-business' },
    { label: 'Contact Us', href: '/contact' },
  ];
}

export default async function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = await getSiteConfig();

  if (!siteConfig) {
    notFound();
  }

  let navItems: NavItem[] = [];
  let routeContext = null;
  let basePath = '';

  if (siteConfig) {
    routeContext = await getRouteContext(siteConfig);
    basePath = siteConfig.vertical?.slug ?? '';

    navItems = buildNavItems({
      basePath,
      terminology: {
        term_cta: siteConfig.vertical?.term_cta ?? null,
        term_category: siteConfig.vertical?.term_category ?? null,
        term_business: siteConfig.vertical?.term_business ?? null,
      },
      hasMultipleCategories: routeContext.categoryList.length > 1,
      hasMultipleCities: routeContext.cityList.length > 1,
    });
  }

  const siteUrl = siteConfig ? `https://${siteConfig.domain}` : '';
  const siteLogo = siteConfig?.logo_path
    ? `${siteUrl}${siteConfig.logo_path}`
    : '';
  const siteDescription = siteConfig?.vertical
    ? `Find the best ${siteConfig.vertical.term_businesses?.toLowerCase() ?? 'businesses'} in your area.`
    : '';

  return (
    <AuthProvider>
      {siteConfig && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                organizationSchema({
                  name: siteConfig.name,
                  url: siteUrl,
                  logo: siteLogo,
                  description: siteDescription,
                })
              ),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                websiteSchema({
                  name: siteConfig.name,
                  url: siteUrl,
                  description: siteDescription,
                })
              ),
            }}
          />
        </>
      )}
      <div className="min-h-screen bg-background">
        <SiteHeader
          logo={{
            src: siteConfig.logo_path || undefined,
            alt: siteConfig.name || 'Logo',
          }}
          navItems={navItems}
        />
        <main>{children}</main>
        {siteConfig && routeContext && (
          <SiteFooter
            siteConfig={siteConfig}
            routeContext={routeContext}
            basePath={basePath}
          />
        )}
      </div>
    </AuthProvider>
  );
}
