'use client';

import dynamic from 'next/dynamic';

const SingleBusinessMap = dynamic(
  () =>
    import('@/components/sites/single-business-map').then(
      (mod) => mod.SingleBusinessMap
    ),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />,
  }
);

interface SingleBusinessMapWrapperProps {
  latitude: number;
  longitude: number;
  mapboxToken: string;
}

export function SingleBusinessMapWrapper(props: SingleBusinessMapWrapperProps) {
  return <SingleBusinessMap {...props} />;
}

function MapLoadingSkeleton() {
  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden border bg-muted animate-pulse flex items-center justify-center">
      <div className="text-muted-foreground text-sm">Loading map...</div>
    </div>
  );
}
