// ensure you are logged in via supabase cli before running:
import { execSync } from 'child_process';

const command = `npx supabase gen types typescript --project-id zjutmafophweplqfgoed --schema public > packages/shared/src/supabase/database.ts`;

console.log(`🛠 Generating types for project...`);
execSync(command, { stdio: 'inherit' });
console.log(
  '✅ Supabase types generated in packages/shared/src/supabase/database.ts'
);
