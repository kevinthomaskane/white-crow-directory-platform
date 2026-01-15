'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';
import type { RefreshSiteBusinessesJobPayload, JobType } from '@white-crow/shared';

type TriggerRefreshResult = {
  jobId: string;
};

export async function triggerRefreshSiteBusinesses(
  siteId: string
): Promise<ActionsResponse<TriggerRefreshResult>> {
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
      error: 'You must be logged in to refresh site businesses.',
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

  const payload: RefreshSiteBusinessesJobPayload = {
    siteId,
  };

  const jobType: JobType = 'refresh_site_businesses';

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
    console.error('Error creating refresh job:', jobError);
    return {
      ok: false,
      error: jobError.message || 'Failed to create refresh job.',
    };
  }

  return {
    ok: true,
    data: { jobId: job.id },
  };
}
