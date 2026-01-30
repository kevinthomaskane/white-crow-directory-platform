import { cn } from '@/lib/utils';

interface BusinessListingsSkeletonProps {
  title?: string;
  count?: number;
  className?: string;
}

export function BusinessListingsSkeleton({
  title,
  count = 6,
  className,
}: BusinessListingsSkeletonProps) {
  return (
    <div className={cn(className)}>
      {title && (
        <h2 className="text-3xl font-bold tracking-tight mb-8">{title}</h2>
      )}
      <div className="flex flex-col gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex w-full gap-4 rounded-lg border border-border bg-card p-4 sm:gap-6"
          >
            <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-muted animate-pulse sm:h-32 sm:w-32" />
            <div className="flex flex-1 flex-col">
              <div className="h-6 w-1/3 rounded bg-muted animate-pulse" />
              <div className="mt-2 h-4 w-1/4 rounded bg-muted animate-pulse" />
              <div className="mt-2 h-4 w-1/2 rounded bg-muted animate-pulse" />
              <div className="mt-3 h-4 w-3/4 rounded bg-muted animate-pulse hidden sm:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
