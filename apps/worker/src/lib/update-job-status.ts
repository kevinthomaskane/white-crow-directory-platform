import { supabase } from '../lib/supabase/client';
import { Json } from '@white-crow/shared';

export async function markJobCompleted(jobId: string, meta: Json = {}) {
  const { error } = await supabase
    .from('jobs')
    .update({
      progress: 100,
      status: 'completed',
      error: null,
      locked_at: null,
      locked_by: null,
      updated_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      meta,
    })
    .eq('id', jobId);

  if (error) {
    console.error('Failed to mark job as completed:', error);
  }
}

export async function markJobFailed(jobId: string, errorMessage: string) {
  const { error } = await supabase
    .from('jobs')
    .update({
      status: 'failed',
      error: errorMessage,
      locked_at: null,
      locked_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (error) {
    console.error('Failed to mark job as failed:', error);
  }
}
