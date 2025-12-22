import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Plus } from 'lucide-react';
import ErrorDisplay from '@/components/admin/error-display';

export default async function SitesPage() {
  const supabase = await createClient();

  const { data: sites, error } = await supabase
    .from('sites')
    .select(`
      id,
      name,
      created_at,
      verticals (name),
      states (name, code)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <ErrorDisplay
        message={`Error loading sites: ${error.message}. Try refreshing the page.`}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your directory sites and their configurations.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/sites/create">
            <Plus className="h-4 w-4" />
            Create Site
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Sites</CardTitle>
            <CardDescription>
              {sites?.length || 0} site{sites?.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </div>
          <Globe className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {sites && sites.length > 0 ? (
            <ul className="space-y-3">
              {sites.map((site) => (
                <li
                  key={site.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{site.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {site.verticals?.name} &middot; {site.states?.name} ({site.states?.code})
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/sites/${site.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No sites yet. Create your first one to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
