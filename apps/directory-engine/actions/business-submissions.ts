'use server';

import {
  placeDetailsFieldMask,
  parseAddressComponents,
  type Review,
  type ReviewSource,
} from '@white-crow/shared';
import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';
import { resend } from '@/lib/emails';
import { CONTACT_EMAIL } from '@/lib/constants';

interface ApproveSubmissionResult {
  businessId: string;
  placeFound: boolean;
  emailSent: boolean;
}

export async function approveBusinessSubmission(
  submissionId: string
): Promise<ActionsResponse<ApproveSubmissionResult>> {
  const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  if (!PLACES_API_KEY) {
    return { ok: false, error: 'Google Places API key not configured.' };
  }

  const supabase = await createClient();

  // Verify user is authenticated (RLS will enforce admin role)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: 'You must be logged in to approve submissions.',
    };
  }

  // Fetch submission with related data
  const { data: submission, error: fetchError } = await supabase
    .from('business_submissions')
    .select(
      `
      id,
      site_id,
      business_name,
      business_email,
      business_website,
      category_id,
      city_id,
      status,
      category:categories(name, slug),
      city:cities(name),
      site:sites(name, domain, vertical:verticals(slug))
    `
    )
    .eq('id', submissionId)
    .single();

  if (fetchError || !submission) {
    return { ok: false, error: 'Submission not found.' };
  }

  if (submission.status !== 'pending') {
    return { ok: false, error: 'Submission has already been processed.' };
  }

  const cityName = submission.city?.name;
  const categorySlug = submission.category?.slug;
  const site = submission.site;

  if (!site || !cityName || !categorySlug || !site.vertical) {
    return { ok: false, error: 'Invalid submission data.' };
  }

  const basePath = site.vertical.slug;

  // Search Google Places for the business
  const searchQuery = `${submission.business_name} in ${cityName}`;
  const searchRes = await fetch(
    'https://places.googleapis.com/v1/places:searchText',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify({ textQuery: searchQuery }),
    }
  );

  if (!searchRes.ok) {
    const text = await searchRes.text();
    console.error('Google Places search failed:', text);
    return { ok: false, error: 'Failed to search Google Places.' };
  }

  const searchData = await searchRes.json();
  const placeFound = searchData.places?.length > 0;
  let businessId: string;

  if (placeFound) {
    // Fetch place details
    const placeId = searchData.places[0].id;
    const detailsRes = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': PLACES_API_KEY,
          'X-Goog-FieldMask': placeDetailsFieldMask.join(','),
        },
      }
    );

    if (!detailsRes.ok) {
      const text = await detailsRes.text();
      console.error('Failed to fetch place details:', text);
      return {
        ok: false,
        error: 'Failed to fetch business details from Google.',
      };
    }

    const placeDetails = await detailsRes.json();
    const { state, city, postalCode, streetAddress } = parseAddressComponents(
      placeDetails.addressComponents || []
    );

    // Upsert business
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .upsert(
        {
          place_id: placeDetails.id,
          name: placeDetails.displayName?.text || submission.business_name,
          formatted_address: placeDetails.formattedAddress || null,
          website:
            placeDetails.websiteUri || submission.business_website || null,
          phone: placeDetails.nationalPhoneNumber || null,
          latitude: placeDetails.location?.latitude || null,
          longitude: placeDetails.location?.longitude || null,
          updated_at: new Date().toISOString(),
          raw: placeDetails,
          editorial_summary: placeDetails.editorialSummary?.text || null,
          city,
          state,
          city_id: submission.city_id,
          hours: placeDetails.regularOpeningHours || null,
          main_photo_name: placeDetails.photos?.[0]?.name || null,
          postal_code: postalCode,
          street_address: streetAddress,
        },
        { onConflict: 'place_id' }
      )
      .select('id')
      .single();

    if (businessError || !businessData) {
      console.error('Failed to upsert business:', businessError);
      return { ok: false, error: 'Failed to create business record.' };
    }

    businessId = businessData.id;

    // Handle reviews
    if (placeDetails.reviews?.length > 0) {
      const source: ReviewSource = 'google_places';
      const reviews = placeDetails.reviews.map((r: Review) => ({
        source,
        business_id: businessId,
        author_image_url: r.authorAttribution?.photoUri || null,
        author_name: r.authorAttribution?.displayName || 'Anonymous',
        author_url: r.authorAttribution?.uri || null,
        rating: r.rating,
        raw: r,
        text: r.text?.text || null,
        time: r.publishTime || null,
        review_id: r.name || crypto.randomUUID(),
      }));

      const [reviewsResult, reviewSourcesResult] = await Promise.all([
        supabase
          .from('business_reviews')
          .upsert(reviews, { onConflict: 'source,review_id' }),
        supabase.from('business_review_sources').upsert(
          {
            business_id: businessId,
            provider: source,
            rating: placeDetails.rating || null,
            review_count: placeDetails.userRatingCount || 0,
            url: placeDetails.googleMapsUri || null,
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: 'business_id,provider' }
        ),
      ]);

      if (reviewsResult.error) {
        console.error('Failed to upsert reviews:', reviewsResult.error);
        // Continue even if reviews fail - not critical
      }

      if (reviewSourcesResult.error) {
        console.error(
          'Failed to upsert review sources:',
          reviewSourcesResult.error
        );
        // Continue even if review sources fail - not critical
      }
    }
  } else {
    // No Google result - create business from submission data only
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .insert({
        name: submission.business_name,
        website: submission.business_website || null,
        city_id: submission.city_id,
        updated_at: new Date().toISOString(),
        raw: {},
      })
      .select('id')
      .single();

    if (businessError || !businessData) {
      console.error('Failed to insert business:', businessError);
      return { ok: false, error: 'Failed to create business record.' };
    }

    businessId = businessData.id;
  }

  // Associate business with category, site, and update submission in parallel
  const [categoryResult, siteBusinessResult, submissionResult] =
    await Promise.all([
      supabase.from('business_categories').upsert(
        {
          business_id: businessId,
          category_id: submission.category_id,
        },
        { onConflict: 'business_id,category_id' }
      ),
      supabase.from('site_businesses').upsert(
        {
          site_id: submission.site_id,
          business_id: businessId,
          verification_email: submission.business_email,
        },
        { onConflict: 'site_id,business_id' }
      ),
      supabase
        .from('business_submissions')
        .update({
          status: 'approved',
          business_id: businessId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', submissionId),
    ]);

  if (categoryResult.error) {
    console.error(
      'Failed to associate business with category:',
      categoryResult.error
    );
    return {
      ok: false,
      error: 'Failed to associate business with category.',
    };
  }

  if (siteBusinessResult.error) {
    console.error(
      'Failed to associate business with site:',
      siteBusinessResult.error
    );
    return {
      ok: false,
      error: 'Failed to associate business with site.',
    };
  }

  if (submissionResult.error) {
    console.error('Failed to update submission:', submissionResult.error);
    return {
      ok: false,
      error: 'Failed to update submission status.',
    };
  }

  // Get site category and city counts to determine URL structure
  const [siteCategoriesResult, siteCitiesResult] = await Promise.all([
    supabase
      .from('site_categories')
      .select('category_id', { count: 'exact', head: true })
      .eq('site_id', submission.site_id),
    supabase
      .from('site_cities')
      .select('city_id', { count: 'exact', head: true })
      .eq('site_id', submission.site_id),
  ]);

  const hasMultipleCategories = (siteCategoriesResult.count ?? 0) > 1;
  const hasMultipleCities = (siteCitiesResult.count ?? 0) > 1;

  // Build business URL based on site structure
  const parts = [basePath];

  if (hasMultipleCategories) {
    parts.push(categorySlug);
  }

  if (hasMultipleCities && cityName) {
    parts.push(slugify(cityName));
  }

  parts.push(businessId);
  const businessPath = '/' + parts.join('/');
  const businessUrl =
    process.env.NODE_ENV === 'production'
      ? `https://${site.domain}${businessPath}`
      : `http://localhost:3000${businessPath}`;

  // Send claim email with link to business page
  let emailSent = false;

  try {
    await resend.emails.send({
      from: `${site.name} <${CONTACT_EMAIL}>`,
      to: submission.business_email,
      subject: `Your business is now listed on ${site.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your Business Has Been Added!</h2>

          <p>Great news! <strong>${submission.business_name}</strong> has been added to ${site.name}.</p>

          <p>
            <a href="${businessUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Your Listing
            </a>
          </p>

          <p>To claim and manage your listing, visit your business page and click the "Claim this business" button.</p>

          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            If you didn't submit this business, you can ignore this email.
          </p>
        </div>
      `,
    });
    emailSent = true;
  } catch (error) {
    console.error('Failed to send claim email:', error);
  }

  return {
    ok: true,
    data: {
      businessId,
      placeFound,
      emailSent,
    },
  };
}

export async function rejectBusinessSubmission(
  submissionId: string
): Promise<ActionsResponse<{ rejected: true }>> {
  const supabase = await createClient();

  // Verify user is authenticated (RLS will enforce admin role)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: 'You must be logged in to reject submissions.',
    };
  }

  const { error } = await supabase
    .from('business_submissions')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .eq('status', 'pending');

  if (error) {
    console.error('Failed to reject submission:', error);
    return { ok: false, error: 'Failed to reject submission.' };
  }

  return { ok: true, data: { rejected: true } };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
