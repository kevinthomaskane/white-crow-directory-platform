import { createClient } from '@/lib/supabase/server';
import { AddBusinessesForm } from '@/components/admin/add-businesses';
import ErrorDisplay from '@/components/admin/error-display';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
        <h1 className="text-3xl font-bold tracking-tight">Add Businesses</h1>
        <p className="mt-2 text-muted-foreground">
          Submit Google Places search jobs to populate your directory with businesses.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create Search Jobs</CardTitle>
          <CardDescription>
            Select a vertical, categories, state, and cities to generate search queries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddBusinessesForm verticals={verticals} states={states} />
        </CardContent>
      </Card>
    </div>
  );
}
