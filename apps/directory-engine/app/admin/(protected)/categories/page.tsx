import { createClient } from '@/lib/supabase/server';
import { AddCategories } from '@/components/admin/add-categories';
import ErrorDisplay from '@/components/admin/error-display';

export default async function CategoriesPage() {
  const supabase = await createClient();

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
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="mt-2 text-muted-foreground">
          Add and manage categories for your directory verticals.
        </p>
      </div>

      <AddCategories verticals={verticals} />
    </div>
  );
}
