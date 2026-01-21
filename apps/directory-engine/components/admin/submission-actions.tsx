'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  approveBusinessSubmission,
  rejectBusinessSubmission,
} from '@/actions/business-submissions';

interface SubmissionActionsProps {
  submissionId: string;
}

export function SubmissionActions({ submissionId }: SubmissionActionsProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);

    try {
      const result = await approveBusinessSubmission(submissionId);

      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error || 'Failed to approve submission.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    setError(null);

    try {
      const result = await rejectBusinessSubmission(submissionId);

      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error || 'Failed to reject submission.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsRejecting(false);
    }
  };

  const isLoading = isApproving || isRejecting;

  return (
    <div className="flex items-center gap-2">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        size="icon"
        variant="ghost"
        onClick={handleApprove}
        disabled={isLoading}
        title="Approve"
        className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700"
      >
        {isApproving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleReject}
        disabled={isLoading}
        title="Reject"
        className="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700"
      >
        {isRejecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
