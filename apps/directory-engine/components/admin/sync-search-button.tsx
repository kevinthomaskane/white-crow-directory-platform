'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerSyncJob } from '@/actions/trigger-sync-job';

interface SyncSearchButtonProps {
  siteId: string;
}

export function SyncSearchButton({ siteId }: SyncSearchButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await triggerSyncJob(siteId);

      if (result.ok) {
        setMessage({
          type: 'success',
          text: 'Sync job queued. Check the Jobs page for progress.',
        });
        setTimeout(() => {
          router.push('/admin/jobs');
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to queue sync job.',
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
      <Button onClick={handleSync} disabled={isLoading}>
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Syncing...' : 'Sync to Search'}
      </Button>
    </div>
  );
}
