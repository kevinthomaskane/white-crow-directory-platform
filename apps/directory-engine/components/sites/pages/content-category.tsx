import type { SiteConfig } from '@/lib/types';

interface ContentCategoryPageProps {
  site: SiteConfig;
  category: string;
}

export function ContentCategoryPage({ site, category }: ContentCategoryPageProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {category.replace(/-/g, ' ')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Learn more about {category.replace(/-/g, ' ')} and browse related articles.
        </p>
      </div>

      <section className="prose max-w-none">
        {/* TODO: Fetch and display category content */}
        <div className="space-y-4">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Related Articles</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* TODO: Fetch and display articles */}
          <ArticleCard />
          <ArticleCard />
          <ArticleCard />
        </div>
      </section>
    </div>
  );
}

function ArticleCard() {
  return (
    <article className="rounded-lg border border-border bg-card p-6">
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="mt-3 h-3 w-full rounded bg-muted" />
      <div className="mt-2 h-3 w-2/3 rounded bg-muted" />
      <div className="mt-4 h-3 w-1/4 rounded bg-muted" />
    </article>
  );
}
