import { redirect } from 'next/navigation';
import { getSiteConfig, getSiteFormOptions } from '@/lib/data/site';
import { SubmitBusinessForm } from '@/components/sites/submit-business/submit-business-form';

export default async function SubmitBusinessPage() {
  const siteConfig = await getSiteConfig();

  if (!siteConfig) {
    redirect('/');
  }

  const { categories, cities } = await getSiteFormOptions(siteConfig);

  const termBusiness = siteConfig.vertical?.term_business || 'Business';

  return (
    <div className="bg-muted/30 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Submit Your {termBusiness}
          </h1>
          <p className="text-muted-foreground">
            Add your business to our directory. We&apos;ll review your
            submission and contact you at the provided email address.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <SubmitBusinessForm
            siteId={siteConfig.id}
            categories={categories}
            cities={cities}
          />
        </div>
      </div>
    </div>
  );
}
