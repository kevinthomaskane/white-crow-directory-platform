import { SiteHeader, type NavItem } from '@/components/sites/site-header';
import { getSiteConfig } from '@/lib/routing/data';

export const dynamic = 'force-dynamic';

function buildNavItems(
  basePath: string,
  terminology: { term_cta: string | null; term_categories: string | null }
): NavItem[] {
  const ctaLabel = terminology.term_cta || 'Browse Directory';
  const categoriesLabel = terminology.term_categories || 'Categories';

  return [
    {
      label: ctaLabel,
      href: `/${basePath}`,
      hasSubNav: true,
      subItems: [
        {
          label: 'By Location',
          href: `/${basePath}#by-location`,
        },
        {
          label: `By ${categoriesLabel}`,
          href: `/${basePath}#by-category`,
        },
      ],
    },
    { label: 'Contact Us', href: '/contact', featured: true },
  ];
}

export default async function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = await getSiteConfig();

  const navItems = siteConfig
    ? buildNavItems(siteConfig.basePath, siteConfig.terminology)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        logo={{ text: siteConfig?.name || 'Directory Site' }}
        navItems={navItems}
      />
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
