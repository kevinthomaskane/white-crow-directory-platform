import 'dotenv/config';
import { handleGooglePlacesSearchJob } from './processors/google-places-search-job';
import { handleAssociateSiteBusinessesJob } from './processors/associate-site-businesses-job';
import { markJobFailed } from './lib/update-job-status';
import { supabase } from './lib/supabase/client';
import { GooglePlacesSearchJob, AssociateSiteBusinessesJob } from './lib/types';

const WORKER_ID = process.env.WORKER_ID;
const STALE_JOB_TIMEOUT_MINUTES = 5;

if (!WORKER_ID) {
  throw new Error('WORKER_ID env var is required');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function recoverStaleJobs() {
  const cutoff = new Date(
    Date.now() - STALE_JOB_TIMEOUT_MINUTES * 60 * 1000
  ).toISOString();

  const { data: staleJobs, error: fetchError } = await supabase
    .from('jobs')
    .select('id')
    .eq('status', 'processing')
    .lt('locked_at', cutoff);

  if (fetchError) {
    console.error('Failed to fetch stale jobs:', fetchError);
    return;
  }

  if (!staleJobs || staleJobs.length === 0) {
    console.log('No stale jobs to recover');
    return;
  }

  const staleJobIds = staleJobs.map((j) => j.id);
  console.log(`Found ${staleJobIds.length} stale job(s), resetting to pending...`);

  const { error: updateError } = await supabase
    .from('jobs')
    .update({
      status: 'pending',
      locked_at: null,
      locked_by: null,
      progress: 0,
      meta: null,
      updated_at: new Date().toISOString(),
    })
    .in('id', staleJobIds);

  if (updateError) {
    console.error('Failed to recover stale jobs:', updateError);
    return;
  }

  console.log(`Recovered ${staleJobIds.length} stale job(s)`);
}

console.log(`Worker ${WORKER_ID} starting...`);
await recoverStaleJobs();

while (true) {
  const { data, error } = await supabase.rpc('claim_next_job', {
    p_worker_id: WORKER_ID,
  });

  if (error) {
    console.error('Failed to claim job:', error);
    await sleep(2000);
    continue;
  }

  const job = data?.[0];

  if (!job) {
    console.log('No jobs available, sleeping for 3 seconds...');
    await sleep(3000);
    continue;
  }

  console.log(`Claimed job: ${job.id} (${job.job_type})`);

  switch (job.job_type) {
    case 'google_places_search':
      try {
        await handleGooglePlacesSearchJob(job as GooglePlacesSearchJob);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[Job ${job.id}] Failed:`, errorMessage);
        try {
          await markJobFailed(job.id, errorMessage);
        } catch (markFailedErr) {
          console.error(`[Job ${job.id}] Failed to mark job as failed:`, markFailedErr);
        }
      }
      break;
    case 'associate_site_businesses':
      try {
        await handleAssociateSiteBusinessesJob(job as AssociateSiteBusinessesJob);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[Job ${job.id}] Failed:`, errorMessage);
        try {
          await markJobFailed(job.id, errorMessage);
        } catch (markFailedErr) {
          console.error(`[Job ${job.id}] Failed to mark job as failed:`, markFailedErr);
        }
      }
      break;
    default:
      console.error(`Unknown job type: ${job.job_type}`);
      try {
        await markJobFailed(job.id, `Unknown job type: ${job.job_type}`);
      } catch (markFailedErr) {
        console.error(`[Job ${job.id}] Failed to mark job as failed:`, markFailedErr);
      }
  }
}
