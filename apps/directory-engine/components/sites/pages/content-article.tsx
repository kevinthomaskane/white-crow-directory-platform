import type { SiteConfig } from '@/lib/types';

interface ContentArticlePageProps {
  site: SiteConfig;
  category: string;
  articleSlug: string;
}

export function ContentArticlePage({
  site,
  category,
  articleSlug,
}: ContentArticlePageProps) {
  return (
    <article className="space-y-8">
      <header>
        <p className="text-sm text-muted-foreground capitalize">
          {category.replace(/-/g, ' ')}
        </p>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {/* TODO: Fetch article title */}
          {articleSlug.replace(/-/g, ' ')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {/* TODO: Fetch article meta */}
          Published on January 1, 2024
        </p>
      </header>

      <div className="prose max-w-none">
        {/* TODO: Fetch and display article content */}
        <div className="space-y-4">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
        </div>
      </div>

      <footer className="border-t border-border pt-6">
        <h2 className="text-xl font-semibold mb-4">Related Articles</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <RelatedArticleCard />
          <RelatedArticleCard />
        </div>
      </footer>
    </article>
  );
}

function RelatedArticleCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="mt-2 h-3 w-full rounded bg-muted" />
    </div>
  );
}
