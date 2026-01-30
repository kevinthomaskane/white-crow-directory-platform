import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { getInitialMapData } from '@/lib/data/site';
import { BusinessMapWrapper } from '@/components/sites/business-map-wrapper';
import type { RouteContext } from '@/lib/types';

interface MapSectionProps {
  siteId: string;
  basePath: string;
  ctx: RouteContext;
  title?: string;
  description?: string;
  className?: string;
}

export function MapSection(props: MapSectionProps) {
  return (
    <Suspense fallback={<MapSkeleton title={props.title} />}>
      <MapSectionContent {...props} />
    </Suspense>
  );
}

async function MapSectionContent({
  siteId,
  basePath,
  ctx,
  title = 'Find Nearby',
  description,
  className,
}: MapSectionProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    return (
      <section className={cn('w-full', className)}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="w-full h-[500px] rounded-lg border bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">
              Map is not available. Mapbox token not configured.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // already sorted by population
  const city = ctx.cityList[0];
  const mapData = await getInitialMapData({ siteId, city });

  if (!mapData) {
    return null;
  }

  const sectionDescription = description || 'Explore businesses in your area';

  return (
    <section className={cn('w-full py-16', className)}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            {sectionDescription}
          </p>
        </div>

        <BusinessMapWrapper
          initialBusinesses={mapData.businesses}
          center={mapData.center}
          mapboxToken={mapboxToken}
          basePath={basePath}
          ctx={ctx}
        />

        <p className="mt-3 text-sm text-muted-foreground">
          Pan or zoom the map to discover more businesses.
        </p>
      </div>
    </section>
  );
}

function MapSkeleton({ title = 'Find Nearby' }: { title?: string }) {
  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <div className="mt-2 h-6 w-48 rounded bg-muted animate-pulse" />
        </div>
        <div className="w-full h-[500px] rounded-lg border bg-muted animate-pulse" />
      </div>
    </section>
  );
}
