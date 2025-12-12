// run from root folder with: node scripts/insertCities.js

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

const MIN_POPULATION = 2000;
const BATCH_SIZE = 500;

function toNumber(value) {
  if (value === null || value === undefined) return null;
  const n = Number(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

async function loadStateCodeToIdMap() {
  const { data, error } = await supabase.from('states').select('id, code');
  if (error) throw error;

  const map = new Map();
  for (const row of data || []) {
    if (row?.code && row?.id) map.set(String(row.code).trim(), row.id);
  }
  return map;
}

async function insertBatch(batch) {
  if (batch.length === 0) return;

  // Use upsert so re-running the script doesn't fail on duplicates.
  const { error } = await supabase.from('cities').upsert(batch, {
    onConflict: 'name,state_id',
    ignoreDuplicates: true,
  });

  if (error) throw error;
}

async function importCities() {
  const csvPath = resolve(process.cwd(), 'scripts', 'uscities.csv');
  const file = fs.readFileSync(csvPath, 'utf8');
  const rows = parse(file, { columns: true, skip_empty_lines: true });

  const stateCodeToId = await loadStateCodeToIdMap();

  let inserted = 0;
  let skippedNoState = 0;

  const batch = [];

  for (const row of rows) {
    const population = toNumber(row.population) ?? 0;

    // CSV is sorted by descending population, so we can exit early.
    if (population < MIN_POPULATION) break;

    const stateCode = String(row.state_id || '').trim(); // e.g. "FL"
    const stateId = stateCodeToId.get(stateCode);
    if (!stateId) {
      skippedNoState += 1;
      continue;
    }

    const name = String(row.city || '').trim();
    const latitude = toNumber(row.lat);
    const longitude = toNumber(row.lng);

    if (!name || latitude === null || longitude === null) continue;

    batch.push({
      name,
      latitude,
      longitude,
      population: Number.isFinite(population) ? population : null,
      state_id: stateId,
    });

    if (batch.length >= BATCH_SIZE) {
      await insertBatch(batch);
      inserted += batch.length;
      batch.length = 0;
      console.log(`Inserted ${inserted} cities so far...`);
    }
  }

  if (batch.length > 0) {
    await insertBatch(batch);
    inserted += batch.length;
  }

  console.log(`Cities imported successfully: ${inserted}`);
  if (skippedNoState > 0) {
    console.log(`Skipped (missing state mapping): ${skippedNoState}`);
  }
  console.log(`Stopped when population dropped below ${MIN_POPULATION}.`);
}

importCities().catch((err) => {
  console.error('Error importing cities:', err);
  process.exitCode = 1;
});
