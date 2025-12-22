import { createClient } from '@/lib/supabase/server';
import { JobsList, type StatusFilter } from '@/components/admin/jobs-list';
import ErrorDisplay from '@/components/admin/error-display';
import type { JobStatus } from '@white-crow/shared';

const STATUS_MAP: Record<StatusFilter, JobStatus[]> = {
  pending_processing: ['pending', 'processing'],
  completed: ['completed'],
  failed: ['failed'],
};

const VALID_FILTERS: StatusFilter[] = [
  'pending_processing',
  'completed',
  'failed',
];

type JobsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const { status } = await searchParams;

  const activeFilter: StatusFilter = VALID_FILTERS.includes(
    status as StatusFilter
  )
    ? (status as StatusFilter)
    : 'pending_processing';

  const supabase = await createClient();

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(
      'id, job_type, status, progress, error, meta, payload, created_at, updated_at'
    )
    .in('status', STATUS_MAP[activeFilter])
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="mt-2 text-muted-foreground">
            Manage jobs for your directory sites.
          </p>
        </div>
        <ErrorDisplay message={error.message} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
        <p className="mt-2 text-muted-foreground">
          Manage jobs for your directory sites.
        </p>
      </div>
      <JobsList jobs={jobs} activeFilter={activeFilter} />
    </div>
  );
}
