'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn, buildDirectoryUrl } from '@/lib/utils';
import type { CategoryData } from '@/lib/types';

interface CategoriesSectionProps {
  categories: CategoryData[];
  basePath: string;
  singleCategory?: boolean;
  title?: string;
  description?: string;
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export function CategoriesSection({
  categories,
  basePath,
  singleCategory = false,
  title = 'Browse Categories',
  description,
  limit = 12,
  showViewAll = true,
  className,
}: CategoriesSectionProps) {
  const [showAll, setShowAll] = useState(false);

  if (categories.length === 0) {
    return null;
  }

  const hasMore = categories.length > limit;
  const displayedCategories = showAll ? categories : categories.slice(0, limit);

  return (
    <section id="by-category" className={cn('w-full py-16', className)}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            {description && (
              <p className="mt-2 text-lg text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {showViewAll && hasMore && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              {showAll ? 'Show less' : 'View all'}
              {showAll ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {displayedCategories.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              href={buildDirectoryUrl({
                basePath,
                categorySlug: category.slug,
                singleCategory,
              })}
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
