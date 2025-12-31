import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { EditVerticalForm } from '@/components/admin/edit-vertical-form';

interface VerticalEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function VerticalEditPage({
  params,
}: VerticalEditPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: vertical, error } = await supabase
    .from('verticals')
    .select(
      `
      id,
      name,
      slug,
      term_category,
      term_categories,
      term_business,
      term_businesses,
      term_cta
    `
    )
    .eq('id', id)
    .single();

  if (error || !vertical) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/verticals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{vertical.name}</h1>
          <p className="mt-1 text-muted-foreground">
            Configure terminology for this vertical.
          </p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Terminology</CardTitle>
          <CardDescription>
            Customize the language used throughout sites in this vertical.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditVerticalForm vertical={vertical} />
        </CardContent>
      </Card>
    </div>
  );
}
