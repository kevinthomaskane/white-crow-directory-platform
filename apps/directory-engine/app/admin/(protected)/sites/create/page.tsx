import { createClient } from '@/lib/supabase/server';
import { CreateSiteForm } from '@/components/admin/create-site-form';
import ErrorDisplay from '@/components/admin/error-display';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CreateSitePage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Create Site</h1>
        <p className="mt-2 text-muted-foreground">
          Configure a new directory site with its vertical, categories, and target cities.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Site Configuration</CardTitle>
          <CardDescription>
            Enter the domain name and select the vertical, categories, state, and cities for this directory site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateSiteForm verticals={verticals} states={states} />
        </CardContent>
      </Card>
    </div>
  );
}
