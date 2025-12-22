import 'dotenv/config';
import { handleGooglePlacesSearchJob } from './processors/google-places-search-job';
import { markJobFailed } from './lib/update-job-status';
import { supabase } from './lib/supabase/client';
import { GooglePlacesSearchJob } from './lib/types';

const WORKER_ID = process.env.WORKER_ID;

if (!WORKER_ID) {
  throw new Error('WORKER_ID env var is required');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log(`Worker ${WORKER_ID} starting...`);

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
    default:
      console.error(`Unknown job type: ${job.job_type}`);
      try {
        await markJobFailed(job.id, `Unknown job type: ${job.job_type}`);
      } catch (markFailedErr) {
        console.error(`[Job ${job.id}] Failed to mark job as failed:`, markFailedErr);
      }
  }
}
