'use server';

import type { Database } from '@white-crow/shared';
import { createServiceRoleClient } from '@white-crow/shared';
import type { ActionsResponse } from '@/lib/types';
import { sendBusinessSubmissionNotification } from '@/lib/emails/business-submission-notification';

type BusinessSubmissionInsert =
  Database['public']['Tables']['business_submissions']['Insert'];

export interface SubmitBusinessPayload {
  siteId: string;
  businessName: string;
  businessEmail: string;
  businessWebsite: string;
  categoryId: string;
  cityId: string;
}

/**
 * Submits a new business for review.
 */
export async function submitBusiness(
  payload: SubmitBusinessPayload
): Promise<ActionsResponse<{ submitted: true }>> {
  const {
    siteId,
    businessName,
    businessEmail,
    businessWebsite,
    categoryId,
    cityId,
  } = payload;

  if (!siteId || !businessName || !businessEmail || !categoryId || !cityId) {
    return { ok: false, error: 'Missing required fields.' };
  }

  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  // Verify site exists and category/city belong to this site
  const [siteResult, categoryResult, cityResult] = await Promise.all([
    supabase.from('sites').select('name').eq('id', siteId).single(),
    supabase
      .from('site_categories')
      .select('category:categories(name)')
      .eq('site_id', siteId)
      .eq('category_id', categoryId)
      .single(),
    supabase
      .from('site_cities')
      .select('city:cities(name)')
      .eq('site_id', siteId)
      .eq('city_id', cityId)
      .single(),
  ]);

  if (siteResult.error || !siteResult.data) {
    return { ok: false, error: 'Invalid site.' };
  }

  if (categoryResult.error || !categoryResult.data?.category) {
    return { ok: false, error: 'Invalid category for this site.' };
  }

  if (cityResult.error || !cityResult.data?.city) {
    return { ok: false, error: 'Invalid city for this site.' };
  }

  const categoryName = (categoryResult.data.category as { name: string }).name;
  const cityName = (cityResult.data.city as { name: string }).name;

  // Insert submission
  const submission: BusinessSubmissionInsert = {
    site_id: siteId,
    business_name: businessName.trim(),
    business_email: businessEmail.trim().toLowerCase(),
    business_website: businessWebsite?.trim() || null,
    category_id: categoryId,
    city_id: cityId,
  };

  const { data: insertedSubmission, error: insertError } = await supabase
    .from('business_submissions')
    .insert(submission)
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting business submission:', insertError);
    return { ok: false, error: 'Failed to submit business. Please try again.' };
  }

  // Send notification email
  try {
    await sendBusinessSubmissionNotification({
      submission: insertedSubmission,
      siteName: siteResult.data.name,
      categoryName,
      cityName,
    });
  } catch (error) {
    console.error('Failed to send submission notification email:', error);
  }

  return { ok: true, data: { submitted: true } };
}
