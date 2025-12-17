import { createServiceRoleClient } from '@white-crow/shared';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL env var is required');
}

if (!SUPABASE_SECRET_KEY) {
  throw new Error('SUPABASE_SECRET_KEY env var is required');
}

export const supabase = createServiceRoleClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY
);
