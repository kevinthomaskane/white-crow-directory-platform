'use server';

import type { ActionsResponse } from '@/lib/types';

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
 * TODO: Implement actual submission logic
 */
export async function submitBusiness(
  payload: SubmitBusinessPayload
): Promise<ActionsResponse<{ submitted: true }>> {
  const { siteId, businessName, businessEmail, businessWebsite, categoryId, cityId } = payload;

  // Validate required fields
  if (!siteId || !businessName || !businessEmail) {
    return { ok: false, error: 'Missing required fields.' };
  }

  if (!categoryId || !cityId) {
    return { ok: false, error: 'Category and city are required.' };
  }

  // TODO: Implement actual submission logic:
  // 1. Create a business_submissions record in the database
  // 2. Send confirmation email to businessEmail
  // 3. Notify admin of new submission

  console.log('Business submission received:', {
    siteId,
    businessName,
    businessEmail,
    businessWebsite,
    categoryId,
    cityId,
  });

  return { ok: true, data: { submitted: true } };
}
