import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.d.ts';

export function createServiceRoleClient(url: string, key: string) {
  return createClient<Database>(url, key);
}
