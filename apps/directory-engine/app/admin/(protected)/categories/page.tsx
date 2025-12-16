import { createClient } from '@/lib/supabase/server';
import { AddCategories } from '@/components/admin/add-categories';
import ErrorDisplay from '@/components/admin/error-display';

export default async function CategoriesPage() {
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
          Directory Engine - Categories
        </h2>
        <p className="mt-1 text-muted-foreground">
          Add categories to verticals that exist in the directory engine.
        </p>
      </div>

      <AddCategories verticals={verticals} />
    </div>
  );
}
