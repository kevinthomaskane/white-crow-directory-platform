'use server';

import { createClient } from '@/lib/supabase/server';
import { getSiteConfig } from '@/lib/data/site';
import { stripe } from '@/lib/stripe';
import { STRIPE_PREMIUM_LOOKUP_KEY } from '@/lib/constants';
import type { ActionsResponse } from '@/lib/types';

export async function createCheckoutSession(payload: {
  siteBusinessId: string;
}): Promise<ActionsResponse<{ url: string }>> {
  const { siteBusinessId } = payload;

  if (!siteBusinessId) {
    return { ok: false, error: 'Missing siteBusinessId.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  const site = await getSiteConfig();
  if (!site) {
    return { ok: false, error: 'Site not found.' };
  }

  // Verify user owns this listing on this site
  const { data: targetListing } = await supabase
    .from('site_businesses')
    .select('id, plan')
    .eq('id', siteBusinessId)
    .eq('site_id', site.id)
    .eq('claimed_by', user.id)
    .single();

  if (!targetListing) {
    return { ok: false, error: 'Listing not found.' };
  }

  if (targetListing.plan === 'premium') {
    return { ok: false, error: 'This listing is already on the premium plan.' };
  }

  // Check if an existing stripe_customer_id exists for this user on this site
  const { data: existingCustomer } = await supabase
    .from('site_businesses')
    .select('stripe_customer_id')
    .eq('site_id', site.id)
    .eq('claimed_by', user.id)
    .not('stripe_customer_id', 'is', null)
    .limit(1)
    .single();

  const returnUrl = `https://${site.domain}/profile/listings/${siteBusinessId}`;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: (
          await stripe.prices.list({
            lookup_keys: [STRIPE_PREMIUM_LOOKUP_KEY],
            limit: 1,
          })
        ).data[0].id,
        quantity: 1,
      },
    ],
    ...(existingCustomer?.stripe_customer_id
      ? { customer: existingCustomer.stripe_customer_id }
      : { customer_email: user.email }),
    metadata: { siteBusinessId },
    subscription_data: {
      metadata: {
        siteBusinessId,
        siteId: site.id,
        userId: user.id,
      },
    },
    success_url: returnUrl,
    cancel_url: returnUrl,
  });

  if (!session.url) {
    return { ok: false, error: 'Failed to create checkout session.' };
  }

  return { ok: true, data: { url: session.url } };
}

export async function createBillingPortalSession(payload: {
  siteBusinessId: string;
}): Promise<ActionsResponse<{ url: string }>> {
  const { siteBusinessId } = payload;

  if (!siteBusinessId) {
    return { ok: false, error: 'Missing siteBusinessId.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  const site = await getSiteConfig();
  if (!site) {
    return { ok: false, error: 'Site not found.' };
  }

  // Find the stripe_customer_id from any of the user's claimed listings on this site
  const { data: siteBusiness } = await supabase
    .from('site_businesses')
    .select('stripe_customer_id')
    .eq('site_id', site.id)
    .eq('claimed_by', user.id)
    .not('stripe_customer_id', 'is', null)
    .limit(1)
    .single();

  if (!siteBusiness?.stripe_customer_id) {
    return { ok: false, error: 'No billing account found.' };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: siteBusiness.stripe_customer_id,
    return_url: `https://${site.domain}/profile/listings/${siteBusinessId}`,
  });

  return { ok: true, data: { url: session.url } };
}
