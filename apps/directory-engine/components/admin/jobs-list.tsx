'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

export type StatusFilter = 'pending_processing' | 'completed' | 'failed';

const STATUS_MAP: Record<StatusFilter, JobStatus[]> = {
  pending_processing: ['pending', 'processing'],
  completed: ['completed'],
  failed: ['failed'],
};

type JobsListProps = {
  jobs: JobMinimal[];
  activeFilter: StatusFilter;
};

export function JobsList({ jobs: initialJobs, activeFilter }: JobsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<JobMinimal[]>(initialJobs);

  // Sync with server-rendered data when filter changes
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  // Subscribe to realtime updates
  useEffect(() => {
    const supabase = createClient();
    const statuses = STATUS_MAP[activeFilter];

    const channel = supabase
      .channel('jobs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newJob = payload.new as JobMinimal;
            if (statuses.includes(newJob.status as JobStatus)) {
              setJobs((prev) => [newJob, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedJob = payload.new as JobMinimal;
            const wasInList = jobs.some((j) => j.id === updatedJob.id);
            const shouldBeInList = statuses.includes(
              updatedJob.status as JobStatus
            );

            if (wasInList && shouldBeInList) {
              // Update existing job
              setJobs((prev) =>
                prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
              );
            } else if (wasInList && !shouldBeInList) {
              // Remove job (status changed to different filter)
              setJobs((prev) => prev.filter((j) => j.id !== updatedJob.id));
            } else if (!wasInList && shouldBeInList) {
              // Add job (status changed to match current filter)
              setJobs((prev) => [updatedJob, ...prev]);
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedJob = payload.old as { id: string };
            setJobs((prev) => prev.filter((j) => j.id !== deletedJob.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeFilter, jobs]);

  function handleFilterChange(filter: StatusFilter) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', filter);
    router.push(`?${params.toString()}`);
  }

  return (
    <>
      {/* Status Filter Navigation */}
      <nav className="flex gap-2">
        <Button
          variant={
            activeFilter === 'pending_processing' ? 'default' : 'outline'
          }
          onClick={() => handleFilterChange('pending_processing')}
        >
          Pending/Processing
        </Button>
        <Button
          variant={activeFilter === 'completed' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('completed')}
        >
          Completed
        </Button>
        <Button
          variant={activeFilter === 'failed' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('failed')}
        >
          Failed
        </Button>
      </nav>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <p className="text-muted-foreground">No jobs found.</p>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </>
  );
}

function JobCard({ job }: { job: JobMinimal }) {
  const statusVariant = getStatusVariant(job.status);

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
