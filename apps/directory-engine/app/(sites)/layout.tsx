import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const site = headersList.get('x-site') || '';

  // TODO: Fetch site config from database based on site identifier
  // const siteConfig = await getSiteConfig(site)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {/* TODO: Use siteConfig.name */}
            Directory Site
          </h1>
          <p className="text-sm text-muted-foreground">Serving: {site}</p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
