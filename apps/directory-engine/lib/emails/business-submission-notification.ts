import type { Database } from '@white-crow/shared';
import { resend } from './index';
import { ADMIN_DOMAIN, CONTACT_EMAIL } from '@/lib/constants';

type BusinessSubmission =
  Database['public']['Tables']['business_submissions']['Row'];

interface BusinessSubmissionEmailData {
  submission: Pick<
    BusinessSubmission,
    'site_id' | 'business_name' | 'business_email' | 'business_website'
  >;
  siteName: string;
  categoryName: string;
  cityName: string;
}

export async function sendBusinessSubmissionNotification({
  submission,
  siteName,
  categoryName,
  cityName,
}: BusinessSubmissionEmailData) {
  const adminUrl =
    process.env.NODE_ENV === 'production'
      ? `https://${ADMIN_DOMAIN}/admin/sites/${submission.site_id}`
      : `http://localhost:3000/admin/sites/${submission.site_id}`;

  const { data, error } = await resend.emails.send({
    from: `${siteName} <${CONTACT_EMAIL}>`,
    to: CONTACT_EMAIL,
    subject: `New Business Submission: ${submission.business_name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Business Submission</h2>

        <p>A new business has been submitted for review on <strong>${siteName}</strong>.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Business Name</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${submission.business_name}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Email</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${submission.business_email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Website</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${submission.business_website ?? 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Category</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${categoryName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">City</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${cityName}</td>
          </tr>
        </table>

        <p>
          <a href="${adminUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Review in Admin Dashboard
          </a>
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('Failed to send business submission notification:', error);
    throw error;
  }

  return data;
}
