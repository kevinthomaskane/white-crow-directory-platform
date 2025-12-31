import { SiteHeader, type NavItem } from '@/components/sites/site-header';
import { getSiteConfig, getRouteContext } from '@/lib/routing/data';

export const dynamic = 'force-dynamic';

interface NavContext {
  basePath: string;
  terminology: { term_cta: string | null; term_categories: string | null };
  hasMultipleCategories: boolean;
  hasMultipleCities: boolean;
}

function buildNavItems(ctx: NavContext): NavItem[] {
  const ctaLabel = ctx.terminology.term_cta || 'Browse Directory';
  const categoriesLabel = ctx.terminology.term_categories || 'Categories';

  const subItems: { label: string; href: string }[] = [];

  if (ctx.hasMultipleCities) {
    subItems.push({
      label: 'By Location',
      href: `/${ctx.basePath}#by-location`,
    });
  }

  if (ctx.hasMultipleCategories) {
    subItems.push({
      label: `By ${categoriesLabel}`,
      href: `/${ctx.basePath}#by-category`,
    });
  }

  const mainNavItem: NavItem = {
    label: ctaLabel,
    href: `/${ctx.basePath}`,
  };

  if (subItems.length > 0) {
    mainNavItem.hasSubNav = true;
    mainNavItem.subItems = subItems;
  }

  return [
    mainNavItem,
    { label: 'Contact Us', href: '/contact', featured: true },
  ];
}

export default async function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = await getSiteConfig();

  let navItems: NavItem[] = [];

  if (siteConfig) {
    const routeContext = await getRouteContext(siteConfig);

    navItems = buildNavItems({
      basePath: siteConfig.basePath,
      terminology: siteConfig.terminology,
      hasMultipleCategories: routeContext.categoryList.length > 1,
      hasMultipleCities: routeContext.cityList.length > 1,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        logo={{ text: siteConfig?.name || 'Directory Site' }}
        navItems={navItems}
      />
      <main className="mx-auto">{children}</main>
    </div>
  );
}
