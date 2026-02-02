import { cn } from '@/lib/utils';
import type { SiteConfig } from '@/lib/types';
import { BadgeEmblem } from '@/components/sites/badge-emblem';

interface PremiumBadgeSectionProps {
  site: SiteConfig;
  className?: string;
}

export function PremiumBadgeSection({
  site,
  className,
}: PremiumBadgeSectionProps) {
  const directoryName = site.name.toUpperCase();

  return (
    <section className={cn('w-full py-16 bg-muted/30', className)}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center text-center">
          <BadgeEmblem directoryName={directoryName} />
          <p className="mt-6 text-xl font-semibold text-muted-foreground italic">
            More business awaits...
          </p>
        </div>
      </div>
    </section>
  );
}
