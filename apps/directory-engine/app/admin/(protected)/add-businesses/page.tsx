import { createClient } from '@/lib/supabase/server';
import { AddBusinessesForm } from '@/components/admin/add-businesses';

export default async function AddBusinessesPage() {
  const supabase = await createClient();

  const [
    { data: verticals, error: verticalsError },
    { data: states, error: statesError },
  ] = await Promise.all([
    supabase.from('verticals').select('id, name, slug').order('name'),
    supabase.from('states').select('id, name, code').order('name'),
  ]);

  if (verticalsError) {
    console.error('Error fetching verticals:', verticalsError);
  }
  if (statesError) {
    console.error('Error fetching states:', statesError);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Add Businesses
        </h2>
        <p className="mt-1 text-muted-foreground">
          Select a vertical, categories, a state, and the cities you want to
          target.
        </p>
      </div>

      <div className="max-w-2xl">
        <AddBusinessesForm verticals={verticals || []} states={states || []} />
      </div>
    </div>
  );
}
