import { Check } from 'lucide-react';

export function ClaimBadge({
  isClaimed,
  hasPlan,
}: {
  isClaimed: boolean | null;
  hasPlan: boolean;
}) {
  if (hasPlan) {
    return (
      <div className="flex-shrink-0 rounded-full bg-premium p-1">
        <Check
          strokeWidth={4}
          className="h-3.5 w-3.5 text-premium-foreground"
        />
      </div>
    );
  }

  if (isClaimed) {
    return (
      <div className="flex-shrink-0 rounded-full bg-claimed p-1">
        <Check
          strokeWidth={4}
          className="h-3.5 w-3.5 text-claimed-foreground"
        />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 rounded-full bg-unclaimed p-1">
      <Check strokeWidth={4} className="h-3.5 w-3.5 text-unclaimed-foreground" />
    </div>
  );
}
