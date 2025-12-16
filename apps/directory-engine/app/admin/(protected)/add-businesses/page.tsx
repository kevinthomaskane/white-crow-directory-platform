import { createClient } from '@/lib/supabase/server';
import { AddBusinessesForm } from '@/components/admin/add-businesses';
import ErrorDisplay from '@/components/admin/error-display';

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
    return (
      <ErrorDisplay
        message={`Error loading verticals: ${verticalsError.message}. Try refreshing the page.`}
      />
    );
  }
  if (statesError) {
    return (
      <ErrorDisplay
        message={`Error loading states: ${statesError.message}. Try refreshing the page.`}
      />
    );
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
        <AddBusinessesForm verticals={verticals} states={states} />
      </div>
    </div>
  );
}
