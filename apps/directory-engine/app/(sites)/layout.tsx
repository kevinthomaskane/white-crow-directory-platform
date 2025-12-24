import { headers } from 'next/headers';
import { SiteHeader, type NavItem } from '@/components/sites/site-header';

export const dynamic = 'force-dynamic';

// Example navigation items - these would come from site config in production
const defaultNavItems: NavItem[] = [
  {
    label: 'Find a Lawyer',
    href: '/find-a-lawyer',
    hasSubNav: true,
    subItems: [
      {
        label: 'By Location',
        href: '/find-a-lawyer#by-location',
      },
      {
        label: 'By Practice Area',
        href: '/find-a-lawyer/practice-areas',
      },
    ],
  },
  { label: 'About', href: '/articles' },
  { label: 'Contact Us', href: '/contact', featured: true },
];

export default async function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const site = headersList.get('x-site') || '';

  // TODO: Fetch site config from database based on site identifier
  // const siteConfig = await getSiteConfig(site)
  // const navItems = siteConfig.navItems || defaultNavItems

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        logo={{ text: site || 'Directory Site' }}
        navItems={defaultNavItems}
      />
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
