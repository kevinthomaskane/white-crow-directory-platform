import { createClient } from '@/lib/supabase/server';
import { AddVerticalForm } from '@/components/admin/add-vertical-form';
import ErrorDisplay from '@/components/admin/error-display';

export default async function VerticalsPage() {
  const supabase = await createClient();

  // Fetch existing verticals
  const { data: verticals, error: verticalsError } = await supabase
    .from('verticals')
    .select('id, name, slug')
    .order('name');

  if (verticalsError) {
    return (
      <ErrorDisplay
        message={`Error loading verticals: ${verticalsError.message}. Try refreshing the page.`}
      />
    );
  }
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Directory Engine - Verticals
        </h2>
        <p className="mt-1 text-muted-foreground">
          Add a new vertical to the directory engine.
        </p>
      </div>

      <AddVerticalForm verticals={verticals} />
    </div>
  );
}
