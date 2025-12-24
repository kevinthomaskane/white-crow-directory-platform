'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';
import type { SyncBusinessesToSearchJobPayload, JobType } from '@white-crow/shared';

type TriggerSyncJobResult = {
  jobId: string;
};

export async function triggerSyncJob(
  siteId: string
): Promise<ActionsResponse<TriggerSyncJobResult>> {
  if (!siteId) {
    return {
      ok: false,
      error: 'Site ID is required.',
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: 'You must be logged in to trigger a sync job.',
    };
  }

  // Verify site exists
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('id')
    .eq('id', siteId)
    .single();

  if (siteError || !site) {
    return {
      ok: false,
      error: 'Site not found.',
    };
  }

  const payload: SyncBusinessesToSearchJobPayload = {
    siteId,
    fullResync: true,
  };

  const jobType: JobType = 'sync_businesses_to_search';

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      job_type: jobType,
      payload,
      status: 'pending',
    })
    .select('id')
    .single();

  if (jobError) {
    console.error('Error creating sync job:', jobError);
    return {
      ok: false,
      error: jobError.message || 'Failed to create sync job.',
    };
  }

  return {
    ok: true,
    data: { jobId: job.id },
  };
}
