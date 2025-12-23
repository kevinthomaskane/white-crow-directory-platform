import { createClient } from '@/lib/supabase/server';
import { JobsList } from '@/components/admin/jobs-list';
import ErrorDisplay from '@/components/admin/error-display';

export default async function JobsPage() {
  const supabase = await createClient();

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(
      'id, job_type, status, progress, error, meta, payload, created_at, updated_at, attempt_count, max_attempts'
    )
    .order('updated_at', { ascending: false });

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
      <JobsList jobs={jobs} />
    </div>
  );
}
