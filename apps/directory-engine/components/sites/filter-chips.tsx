import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface FilterChip {
  label: string;
  href: string;
  active?: boolean;
}

interface FilterChipsProps {
  chips: FilterChip[];
  label?: string;
  className?: string;
}

export function FilterChips({ chips, label, className }: FilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {label && (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {label}
        </span>
      )}
      <div className="relative flex-1 min-w-0">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 pr-8">
          {chips.map((chip) => (
            <Link
              key={chip.href}
              href={chip.href}
              className={cn(
                'inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                chip.active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              )}
            >
              {chip.label}
            </Link>
          ))}
        </div>
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
