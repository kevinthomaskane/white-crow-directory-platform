'use server';

import {
  GooglePlacesSearchJobPayloadSchema,
  type GooglePlacesSearchJobPayload,
} from '@white-crow/shared';
import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse, JobInsertMinimal } from '@/lib/types';

export async function submitGooglePlacesSearchJobs(
  payloads: GooglePlacesSearchJobPayload[]
): Promise<
  ActionsResponse<{
    runId: string;
    jobCount: number;
  }>
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in to submit a job.' };
  }

  if (!Array.isArray(payloads) || payloads.length === 0) {
    return { ok: false, error: 'No jobs provided.' };
  }

  // Validate each payload independently
  for (const payload of payloads) {
    const result = GooglePlacesSearchJobPayloadSchema.safeParse(payload);
    if (!result.success) {
      return {
        ok: false,
        error: `Invalid job payload for ${payload.queryText}`,
      };
    }
  }

  const runId = crypto.randomUUID();

  // insert jobs into jobs table
  const jobs: JobInsertMinimal[] = payloads.map((payload) => ({
    job_type: 'google_places_search',
    payload,
    run_id: runId,
    status: 'pending',
  }));

  const { error } = await supabase.from('jobs').insert(jobs);

  if (error) {
    console.error('Failed to insert jobs:', error);
    return {
      ok: false,
      error: error.message || 'Failed to submit jobs.',
    };
  }

  return {
    ok: true,
    data: {
      runId,
      jobCount: jobs.length,
    },
  };
}
