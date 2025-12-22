import { createClient } from '@/lib/supabase/server';
import { AddVerticalForm } from '@/components/admin/add-vertical-form';
import ErrorDisplay from '@/components/admin/error-display';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';

export default async function VerticalsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Verticals</h1>
        <p className="mt-2 text-muted-foreground">
          Manage industry verticals for your directory sites.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Vertical</CardTitle>
            <CardDescription>
              Create a new industry vertical to organize your categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddVerticalForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Existing Verticals</CardTitle>
              <CardDescription>
                {verticals?.length || 0} vertical{verticals?.length !== 1 ? 's' : ''} configured
              </CardDescription>
            </div>
            <Layers className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {verticals && verticals.length > 0 ? (
              <ul className="space-y-3">
                {verticals.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <div className="font-medium">{v.name}</div>
                      <div className="text-sm text-muted-foreground">{v.slug}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No verticals yet. Create your first one to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
