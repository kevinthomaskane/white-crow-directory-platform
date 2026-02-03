import { notFound } from 'next/navigation';
import { getSiteConfig } from '@/lib/data/site';
import { ContactForm } from '@/components/sites/contact-form';

export default async function ContactPage() {
  const siteConfig = await getSiteConfig();

  if (!siteConfig) {
    notFound();
  }

  return (
    <div className="bg-muted/30 py-16 px-4">
      <div className="mx-auto max-w-xl px-4">
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Contact Us</h1>
          <p className="text-muted-foreground">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <ContactForm siteName={siteConfig.name} />
        </div>
      </div>
    </div>
  );
}
