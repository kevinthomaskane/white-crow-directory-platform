'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';

export async function retryJob(jobId: string): Promise<ActionsResponse<null>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in to retry a job.' };
  }

  // Fetch the job to verify it can be retried
  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('id, status, attempt_count, max_attempts')
    .eq('id', jobId)
    .single();

  if (fetchError || !job) {
    return { ok: false, error: 'Job not found.' };
  }

  if (job.status !== 'failed') {
    return { ok: false, error: 'Only failed jobs can be retried.' };
  }

  if (job.attempt_count >= job.max_attempts) {
    return { ok: false, error: 'Job has exceeded maximum retry attempts.' };
  }

  // Reset the job status to pending
  const { error: updateError } = await supabase
    .from('jobs')
    .update({
      status: 'pending',
      error: null,
      meta: null,
      progress: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (updateError) {
    console.error('Failed to retry job:', updateError);
    return { ok: false, error: updateError.message || 'Failed to retry job.' };
  }

  return { ok: true, data: null };
}
