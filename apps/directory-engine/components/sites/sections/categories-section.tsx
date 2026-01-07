import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryData } from '@/lib/types';

interface CategoriesSectionProps {
  categories: CategoryData[];
  basePath: string;
  title?: string;
  description?: string;
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export function CategoriesSection({
  categories,
  basePath,
  title = 'Browse Categories',
  description,
  limit = 12,
  showViewAll = true,
  className,
}: CategoriesSectionProps) {
  if (categories.length === 0) {
    return null;
  }

  const displayedCategories = categories.slice(0, limit);
  const hasMore = categories.length > limit;

  return (
    <section className={cn('w-full', className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="mt-1 text-muted-foreground">{description}</p>
            )}
          </div>
          {showViewAll && hasMore && (
            <Link
              href={`/${basePath}`}
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {displayedCategories.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              href={`/${basePath}/${category.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CategoryCardProps {
  category: CategoryData;
  href: string;
}

function CategoryCard({ category, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex items-center justify-center rounded-lg border border-border bg-card p-4 text-center transition-all hover:border-primary/50 hover:bg-accent hover:shadow-sm"
    >
      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
        {category.name}
      </span>
    </Link>
  );
}
