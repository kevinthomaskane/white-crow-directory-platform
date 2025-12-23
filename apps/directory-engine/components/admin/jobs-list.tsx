'use client';

import { useEffect, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { JobMinimal } from '@/lib/types';
import type {
  JobStatus,
  GooglePlacesSearchJobMeta,
  GooglePlacesSearchJobPayload,
} from '@white-crow/shared';
import { retryJob } from '@/actions/retry-job';

type StatusFilter = 'pending_processing' | 'completed' | 'failed';

type JobsListProps = {
  jobs: JobMinimal[];
};

export function JobsList({ jobs: initialJobs }: JobsListProps) {
  const [jobs, setJobs] = useState<JobMinimal[]>(initialJobs);
  const [activeFilter, setActiveFilter] =
    useState<StatusFilter>('pending_processing');

  // Subscribe to realtime updates
  useEffect(() => {
    const supabase = createClient();

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .order('updated_at', { ascending: false });

      setJobs(data ?? []);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const status = job.status as JobStatus;
    switch (activeFilter) {
      case 'pending_processing':
        return status === 'pending' || status === 'processing';
      case 'completed':
        return status === 'completed';
      case 'failed':
        return status === 'failed';
    }
  });

  return (
    <>
      {/* Status Filter Navigation */}
      <nav className="flex gap-2">
        <Button
          variant={
            activeFilter === 'pending_processing' ? 'default' : 'outline'
          }
          onClick={() => setActiveFilter('pending_processing')}
        >
          Pending/Processing
        </Button>
        <Button
          variant={activeFilter === 'completed' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('completed')}
        >
          Completed
        </Button>
        <Button
          variant={activeFilter === 'failed' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('failed')}
        >
          Failed
        </Button>
      </nav>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <p className="text-muted-foreground">No jobs found.</p>
        ) : (
          filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </>
  );
}

function JobCard({ job }: { job: JobMinimal }) {
  const [isPending, startTransition] = useTransition();
  const statusVariant = getStatusVariant(job.status);
  const canRetry =
    job.status === 'failed' && job.attempt_count < job.max_attempts;

  const handleRetry = () => {
    startTransition(async () => {
      const result = await retryJob(job.id);
      if (!result.ok) {
        console.error('Failed to retry job:', result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            {formatJobType(job.job_type)}
          </CardTitle>
          <Badge variant={statusVariant}>{job.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{job.progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>

        {/* Job Type Specific Info */}
        {job.job_type === 'google_places_search' && (
          <GooglePlacesSearchJobInfo
            meta={job.meta as GooglePlacesSearchJobMeta | null}
            payload={job.payload as GooglePlacesSearchJobPayload}
          />
        )}

        {/* Error Display */}
        {job.error && (
          <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            {job.error}
          </div>
        )}

        {/* Failed Job Info: Attempts & Retry */}
        {job.status === 'failed' && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Attempts: {job.attempt_count}/{job.max_attempts}
            </span>
            {canRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isPending}
              >
                {isPending ? 'Retrying...' : 'Retry'}
              </Button>
            )}
          </div>
        )}

        {/* Timestamps */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Created: {formatDate(job.created_at)}</span>
          <span>Updated: {formatDate(job.updated_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function GooglePlacesSearchJobInfo({
  meta,
  payload,
}: {
  meta: GooglePlacesSearchJobMeta | null;
  payload: GooglePlacesSearchJobPayload;
}) {
  return (
    <div className="space-y-2 text-sm">
      <div>
        <span className="text-muted-foreground">Query: </span>
        <span className="font-medium">{payload.queryText}</span>
      </div>
      {meta && (
        <div className="flex gap-4">
          <div>
            <span className="text-muted-foreground">Places Found: </span>
            <span className="font-medium">{meta.total_places}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Processed: </span>
            <span className="font-medium">
              {meta.processed_places}/{meta.total_places}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'processing':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
}

function formatJobType(jobType: string): string {
  return jobType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}
