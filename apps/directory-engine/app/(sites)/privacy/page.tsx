import { notFound } from 'next/navigation';
import { getSiteConfig } from '@/lib/data/site';

export default async function PrivacyPolicyPage() {
  const site = await getSiteConfig();

  if (!site) {
    notFound();
  }

  return (
    <div className="bg-muted/30 py-16 px-4">
      <div className="mx-auto max-w-3xl prose prose-neutral dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last updated:{' '}
          {new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>

        <h2>Information We Collect</h2>
        <p>
          When you use {site.name}, we may collect the following information:
        </p>
        <ul>
          <li>
            <strong>Account information:</strong> Your email address and display
            name when you create an account or claim a business listing.
          </li>
          <li>
            <strong>Business claim data:</strong> Information you provide when
            claiming or managing a business listing, including business name,
            phone number, address, website, photos, and descriptions.
          </li>
          <li>
            <strong>Payment information:</strong> When you subscribe to a paid
            plan, payment processing is handled by Stripe. We store your Stripe
            customer ID and subscription status but do not store your credit
            card details.
          </li>
          <li>
            <strong>Communications:</strong> Messages you send through our
            contact or feedback forms, including your name and email address.
          </li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain our directory services</li>
          <li>To verify business ownership during the claim process</li>
          <li>To process subscription payments</li>
          <li>To respond to your inquiries and feedback</li>
          <li>To send service-related communications</li>
        </ul>

        <h2>Third-Party Services</h2>
        <p>We use the following third-party services to operate {site.name}:</p>
        <ul>
          <li>
            <strong>Supabase</strong> for authentication and data storage
          </li>
          <li>
            <strong>Stripe</strong> for payment processing
          </li>
          <li>
            <strong>Google Places</strong> for business data
          </li>
        </ul>
        <p>
          Each of these services has its own privacy policy governing how they
          handle your data.
        </p>

        <h2>Data Retention</h2>
        <p>
          We retain your account and business listing data for as long as your
          account is active. You may request deletion of your account and
          associated data by contacting us.
        </p>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your account and personal data</li>
          <li>Withdraw consent for data processing</li>
        </ul>
      </div>
    </div>
  );
}
