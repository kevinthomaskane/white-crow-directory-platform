import type { SiteConfig, RouteContext } from '@/lib/types';
import { Hero } from '@/components/sites/hero';
import { HowItWorksSection } from '@/components/sites/sections/how-it-works-section';
import { BusinessOwnersSection } from '@/components/sites/sections/business-owners-section';
import { PremiumBenefitsSection } from '@/components/sites/sections/premium-benefits-section';

interface HomePageProps {
  site: SiteConfig;
  ctx: RouteContext;
  stats?: {
    businessCount?: number;
    categoryCount?: number;
    cityCount?: number;
  };
}

export function HomePage({ site, ctx, stats }: HomePageProps) {
  return (
    <>
      <Hero site={site} ctx={ctx} stats={stats} />

      <HowItWorksSection site={site} ctx={ctx} />

      <BusinessOwnersSection site={site} />

      <PremiumBenefitsSection />
    </>
  );
}
