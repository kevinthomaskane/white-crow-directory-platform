import { DocsTableOfContents } from '@/components/admin/docs-table-of-contents';
import { DocsCoreConceptsSection } from '@/components/admin/docs-core-concepts';
import { DocsDataModelSection } from '@/components/admin/docs-data-model';
import { DocsCreatingSiteSection } from '@/components/admin/docs-creating-site';
import { DocsManagingSiteSection } from '@/components/admin/docs-managing-site';
import { DocsTechStackSection } from '@/components/admin/docs-tech-stack';

export default function AdminDashboard() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="mt-2 text-muted-foreground">
          Reference guide for the White Crow Directory Engine.
        </p>
      </div>

      <DocsTableOfContents />
      <DocsCoreConceptsSection />
      <DocsDataModelSection />
      <DocsCreatingSiteSection />
      <DocsManagingSiteSection />
      <DocsTechStackSection />
    </div>
  );
}
