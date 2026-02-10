import { notFound } from 'next/navigation';
import { getSiteConfig } from '@/lib/data/site';

export default async function TermsPage() {
  const site = await getSiteConfig();

  if (!site) {
    notFound();
  }

  return (
    <div className="bg-muted/30 py-16 px-4">
      <div className="mx-auto max-w-3xl prose prose-neutral dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground">
          Last updated:{' '}
          {new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>

        <h2>Acceptance of Terms</h2>
        <p>
          By accessing or using {site.name}, you agree to be bound by these
          terms. If you do not agree, please do not use our services.
        </p>

        <h2>Services</h2>
        <p>
          {site.name} is a business directory that aggregates publicly available
          business information. We provide tools for business owners to claim
          and manage their listings, including the ability to update business
          details, upload media, and subscribe to premium plans.
        </p>

        <h2>Accounts</h2>
        <p>
          To claim a business listing, you must create an account using a valid
          email address associated with the business. You are responsible for
          maintaining the security of your account credentials and for all
          activity that occurs under your account.
        </p>

        <h2>Business Claims</h2>
        <p>
          When you claim a business listing, you represent that you are
          authorized to manage that business. We verify ownership through email
          domain matching. We reserve the right to revoke a claim if we
          determine it was made fraudulently.
        </p>

        <h2>Subscriptions and Payments</h2>
        <p>
          Premium plans are billed as recurring subscriptions through Stripe. By
          subscribing, you authorize us to charge your payment method on a
          recurring basis until you cancel.
        </p>
        <ul>
          <li>
            You can manage or cancel your subscription at any time from your
            listing management page.
          </li>
          <li>
            Cancellations take effect at the end of the current billing period.
          </li>
          <li>We do not offer refunds for partial billing periods.</li>
        </ul>

        <h2>User Content</h2>
        <p>
          You retain ownership of content you submit (descriptions, photos,
          media). By uploading content, you grant us a non-exclusive license to
          display it on {site.name} as part of your business listing.
        </p>
        <p>
          You must not upload content that is unlawful, defamatory, or infringes
          on the rights of others. We reserve the right to remove any content
          that violates these terms.
        </p>

        <h2>Accuracy of Information</h2>
        <p>
          Business data displayed on {site.name} is sourced from third-party
          providers and user submissions. We do not guarantee the accuracy,
          completeness, or timeliness of any listing information.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          {site.name} is provided &quot;as is&quot; without warranties of any
          kind. To the fullest extent permitted by law, we shall not be liable
          for any indirect, incidental, or consequential damages arising from
          your use of the service.
        </p>

        <h2>Termination</h2>
        <p>
          We may suspend or terminate your account at our discretion if you
          violate these terms. Upon termination, your right to use the service
          ceases and any active subscriptions will be cancelled.
        </p>

        <h2>Changes to These Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of{' '}
          {site.name} after changes constitutes acceptance of the updated terms.
        </p>
      </div>
    </div>
  );
}
