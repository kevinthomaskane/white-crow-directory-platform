import Image from 'next/image';
import { SearchForm } from '@/components/sites/search-form';
import type { SiteConfig, RouteContext } from '@/lib/types';

interface HeroStats {
  businessCount?: number;
  categoryCount?: number;
  cityCount?: number;
}

interface HeroProps {
  site: SiteConfig;
  ctx: RouteContext;
  stats?: HeroStats;
}

export function Hero({ site, ctx, stats }: HeroProps) {
  const hasMultipleCategories = ctx.categoryList.length > 1;
  const hasMultipleCities = ctx.cityList.length > 1;

  const termBusiness = site.vertical?.term_business || 'Business';
  const termBusinesses = site.vertical?.term_businesses || 'Businesses';
  const termCategory = site.vertical?.term_category || 'Category';
  const termCategories = site.vertical?.term_categories || 'Categories';

  const statItems: { value: number; label: string }[] = [];

  if (stats?.businessCount) {
    statItems.push({
      value: stats.businessCount,
      label: stats.businessCount === 1 ? termBusiness : termBusinesses,
    });
  }

  if (stats?.categoryCount && hasMultipleCategories) {
    statItems.push({
      value: stats.categoryCount,
      label: stats.categoryCount === 1 ? termCategory : termCategories,
    });
  }

  if (stats?.cityCount && hasMultipleCities) {
    statItems.push({
      value: stats.cityCount,
      label: stats.cityCount === 1 ? 'City' : 'Cities',
    });
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {site.hero_path && (
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${site.hero_path}`}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center md:py-36">
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
          {site.name}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80 md:text-xl">
          Find trusted {termBusinesses.toLowerCase()} in your area
        </p>

        {/* Search Form */}
        <div className="mx-auto mt-8 max-w-2xl">
          <SearchForm
            basePath={site.vertical?.slug ?? ''}
            categories={ctx.categoryList}
            cities={ctx.cityList}
            className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-xl"
          />
        </div>

        {/* Stats */}
        {statItems.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {statItems.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white md:text-4xl">
                  {stat.value.toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
