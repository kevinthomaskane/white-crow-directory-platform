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
      <div className="flex-shrink-0 rounded-full bg-amber-400 p-1 dark:bg-white">
        <Check
          strokeWidth={4}
          className="h-3.5 w-3.5 text-white dark:text-amber-400"
        />
      </div>
    );
  }

  if (isClaimed) {
    return (
      <div className="flex-shrink-0 rounded-full bg-green-400 p-1 dark:bg-white">
        <Check
          strokeWidth={4}
          className="h-3.5 w-3.5 text-white dark:text-green-400"
        />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 rounded-full bg-gray-300 p-1">
      <Check strokeWidth={4} className="h-3.5 w-3.5 text-white" />
    </div>
  );
}
