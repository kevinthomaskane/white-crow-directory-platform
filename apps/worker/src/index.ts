import 'dotenv/config';
// import { sleep } from './utils/sleep.js';
import { handleGooglePlacesSearchJob } from './processors/handleGooglePlacesSearchJob';
import { GooglePlacesSearchJob } from './lib/types';

const WORKER_ID = process.env.WORKER_ID;

if (!WORKER_ID) {
  throw new Error('WORKER_ID env var is required');
}

import job from '../fixtures/google-places-search-job.json' with { type: 'json' };
const parsedJob = {
  ...job,
  payload: JSON.parse(job.payload),
  meta: JSON.parse(job.meta),
};

await handleGooglePlacesSearchJob(parsedJob as GooglePlacesSearchJob);

// while (true) {
//   const { data, error } = await supabase.rpc('claim_next_job', {
//     p_worker_id: WORKER_ID,
//   });
//
//   if (error) {
//     console.error('Failed to claim job:', error);
//     await sleep(2000);
//     continue;
//   }
//
//   const job = data?.[0];
//
//   if (!job) {
//     console.log('No jobs available, sleeping for 3 seconds...');
//     await sleep(3000);
//     continue;
//   }
//
//   switch (job.job_type) {
//     case 'google_places_search':
//       try {
//         await handleGooglePlacesSearchJob(job as GooglePlacesSearchJob);
//       } catch (err) {
//         console.error('Error handling Google Places Search Job:', err);
//       }
//       break;
//     default:
//       console.error('Unknown job type:', job.job_type);
//   }
//
//   console.log('Claimed job:', job.id, job.job_type);
// }
