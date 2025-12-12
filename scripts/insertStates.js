// run from root folder with: node scripts/insertStates.js

import fs from 'fs';
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function importStates() {
  const csvPath = resolve(process.cwd(), 'scripts', 'uscities.csv');
  const file = fs.readFileSync(csvPath, 'utf8');
  const rows = parse(file, { columns: true, skip_empty_lines: true });

  const seen = new Set();
  const states = [];

  for (const row of rows) {
    const code = row.state_id?.trim();
    const name = row.state_name?.trim();

    if (!code || !name) continue;
    if (seen.has(code)) continue;

    seen.add(code);
    states.push({ name, code });
  }

  console.log(`Inserting ${states.length} states...`);

  const { error } = await supabase.from('states').insert(states);
  if (error) {
    console.error('Error inserting states:', error);
    return;
  }

  console.log('States imported successfully.');
}

importStates();
