'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerRefreshSiteBusinesses } from '@/actions/trigger-refresh-site-businesses';

interface RefreshBusinessesButtonProps {
  siteId: string;
  businessCount: number;
}

export function RefreshBusinessesButton({
  siteId,
  businessCount,
}: RefreshBusinessesButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleRefresh = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await triggerRefreshSiteBusinesses(siteId);

      if (result.ok) {
        setMessage({
          type: 'success',
          text: `Refresh job queued for ${businessCount} businesses. Check the Jobs page for progress.`,
        });
        setTimeout(() => {
          router.push('/admin/jobs');
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to queue refresh job.',
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {message && (
        <p
          className={`text-sm ${
            message.type === 'success' ? 'text-green-600' : 'text-destructive'
          }`}
        >
          {message.text}
        </p>
      )}
      <Button
        onClick={handleRefresh}
        disabled={isLoading || businessCount === 0}
        variant="outline"
      >
        <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Refreshing...' : 'Refresh Business Data'}
      </Button>
    </div>
  );
}
