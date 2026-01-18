import { SiteHeader, type NavItem } from '@/components/sites/site-header';
import { SiteFooter } from '@/components/sites/site-footer';
import { getSiteConfig, getRouteContext } from '@/lib/data/site';
import { AuthProvider } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@white-crow/shared';

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
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const siteConfig = await getSiteConfig();

  // Validate: does this user have a profile for this site?
  let user = null;
  if (authUser && siteConfig) {
    const serviceClient = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('id', authUser.id)
      .eq('site_id', siteConfig.id)
      .single();

    user = profile ? authUser : null;
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
        term_categories: siteConfig.vertical?.term_categories ?? null,
      },
      hasMultipleCategories: routeContext.categoryList.length > 1,
      hasMultipleCities: routeContext.cityList.length > 1,
    });
  }

  return (
    <AuthProvider initialUser={user} siteId={siteConfig?.id ?? ''}>
      <div className="min-h-screen bg-background">
        <SiteHeader
          logo={{ text: siteConfig?.name || 'Directory Site' }}
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
