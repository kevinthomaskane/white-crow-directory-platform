'use client';

import dynamic from 'next/dynamic';
import type { MapBusinessData, RouteContext } from '@/lib/types';

const BusinessMap = dynamic(
  () => import('@/components/sites/business-map').then((mod) => mod.BusinessMap),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />,
  }
);

interface BusinessMapWrapperProps {
  initialBusinesses: MapBusinessData[];
  center: { latitude: number; longitude: number };
  mapboxToken: string;
  basePath: string;
  ctx: RouteContext;
}

export function BusinessMapWrapper(props: BusinessMapWrapperProps) {
  return <BusinessMap {...props} />;
}

function MapLoadingSkeleton() {
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border bg-muted animate-pulse flex items-center justify-center">
      <div className="text-muted-foreground text-sm">Loading map...</div>
    </div>
  );
}
