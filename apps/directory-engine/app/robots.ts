import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { ADMIN_DOMAIN } from '@/lib/constants';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const site = headersList.get('x-site') || '';

  // Disallow all crawling on admin domain
  if (site === ADMIN_DOMAIN) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // Public sites: allow crawling except /profile routes
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/profile/',
    },
    sitemap: `https://${site}/sitemap.xml`,
  };
}
