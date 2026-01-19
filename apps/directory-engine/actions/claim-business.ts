'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';

/**
 * Validates that the email domain matches the business website domain
 */
function validateEmailDomain(email: string, businessWebsite: string): boolean {
  try {
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!emailDomain) return false;

    const websiteDomain = new URL(businessWebsite).hostname
      .replace(/^www\./, '')
      .toLowerCase();

    return emailDomain === websiteDomain;
  } catch {
    return false;
  }
}

/**
 * Initiates a business claim for unauthenticated users.
 * Sends a magic link to the provided email address.
 */
export async function initiateBusinessClaim(payload: {
  siteBusinessId: string;
  email: string;
  redirectUrl: string;
}): Promise<ActionsResponse<{ message: string }>> {
  const { siteBusinessId, email, redirectUrl } = payload;

  if (!siteBusinessId || !email) {
    return { ok: false, error: 'Missing required fields.' };
  }

  const supabase = await createClient();

  // Fetch the site_business and related business data
  const { data: siteBusiness, error: fetchError } = await supabase
    .from('site_businesses')
    .select(
      `
      id,
      is_claimed,
      business:businesses!inner(
        id,
        website
      )
    `
    )
    .eq('id', siteBusinessId)
    .single();

  if (fetchError || !siteBusiness) {
    return { ok: false, error: 'Business not found.' };
  }

  if (siteBusiness.is_claimed) {
    return { ok: false, error: 'This business has already been claimed.' };
  }

  const business = siteBusiness.business as { id: string; website: string | null };

  if (!business.website) {
    return {
      ok: false,
      error: 'This business does not have a website on file. Please contact our verification team.',
    };
  }

  // Validate email domain matches business website
  if (!validateEmailDomain(email, business.website)) {
    const websiteDomain = new URL(business.website).hostname.replace(/^www\./, '');
    return {
      ok: false,
      error: `Email must match the business website domain (${websiteDomain}).`,
    };
  }

  // Generate verification token
  const verificationToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Update site_businesses with verification data
  const { error: updateError } = await supabase
    .from('site_businesses')
    .update({
      verification_status: 'pending',
      verification_email: email,
      verification_token: verificationToken,
      verification_token_expires_at: expiresAt.toISOString(),
    })
    .eq('id', siteBusinessId);

  if (updateError) {
    console.error('Error updating site_business:', updateError);
    return { ok: false, error: 'Failed to initiate claim. Please try again.' };
  }

  // Send magic link via Supabase Auth
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${redirectUrl}?siteBusinessId=${siteBusinessId}`,
    },
  });

  if (otpError) {
    console.error('Error sending magic link:', otpError);
    return { ok: false, error: 'Failed to send verification email. Please try again.' };
  }

  return {
    ok: true,
    data: { message: 'Verification email sent. Please check your inbox.' },
  };
}

/**
 * Claims a business for an authenticated user.
 * Does not require magic link - user is already logged in.
 */
export async function claimBusinessAsUser(payload: {
  siteBusinessId: string;
}): Promise<ActionsResponse<{ claimed: true }>> {
  const { siteBusinessId } = payload;

  if (!siteBusinessId) {
    return { ok: false, error: 'Missing required fields.' };
  }

  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    return { ok: false, error: 'You must be logged in to claim a business.' };
  }

  // Fetch the site_business and related business data
  const { data: siteBusiness, error: fetchError } = await supabase
    .from('site_businesses')
    .select(
      `
      id,
      is_claimed,
      business:businesses!inner(
        id,
        website
      )
    `
    )
    .eq('id', siteBusinessId)
    .single();

  if (fetchError || !siteBusiness) {
    return { ok: false, error: 'Business not found.' };
  }

  if (siteBusiness.is_claimed) {
    return { ok: false, error: 'This business has already been claimed.' };
  }

  const business = siteBusiness.business as { id: string; website: string | null };

  if (!business.website) {
    return {
      ok: false,
      error: 'This business does not have a website on file. Please contact our verification team.',
    };
  }

  // Validate user's email domain matches business website
  if (!validateEmailDomain(user.email, business.website)) {
    const websiteDomain = new URL(business.website).hostname.replace(/^www\./, '');
    return {
      ok: false,
      error: `Your account email must match the business website domain (${websiteDomain}).`,
    };
  }

  // Mark business as claimed
  const { error: updateError } = await supabase
    .from('site_businesses')
    .update({
      is_claimed: true,
      claimed_by: user.id,
      claimed_at: new Date().toISOString(),
      verification_status: 'verified',
      verification_email: user.email,
      verified_at: new Date().toISOString(),
    })
    .eq('id', siteBusinessId);

  if (updateError) {
    console.error('Error claiming business:', updateError);
    return { ok: false, error: 'Failed to claim business. Please try again.' };
  }

  return { ok: true, data: { claimed: true } };
}

/**
 * Completes the business claim after magic link verification.
 * Sets the user's password and display name, then marks business as claimed.
 */
export async function completeBusinessClaim(payload: {
  siteBusinessId: string;
  displayName: string;
  password: string;
}): Promise<ActionsResponse<{ claimed: true; redirectTo: string }>> {
  const { siteBusinessId, displayName, password } = payload;

  if (!siteBusinessId || !displayName || !password) {
    return { ok: false, error: 'Missing required fields.' };
  }

  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const supabase = await createClient();

  // Verify user is authenticated (via magic link)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'Session expired. Please try again.' };
  }

  // Fetch the site_business to verify token
  const { data: siteBusiness, error: fetchError } = await supabase
    .from('site_businesses')
    .select(
      `
      id,
      is_claimed,
      verification_email,
      verification_token,
      verification_token_expires_at,
      business:businesses!inner(
        id,
        name
      )
    `
    )
    .eq('id', siteBusinessId)
    .single();

  if (fetchError || !siteBusiness) {
    return { ok: false, error: 'Business not found.' };
  }

  if (siteBusiness.is_claimed) {
    return { ok: false, error: 'This business has already been claimed.' };
  }

  // Verify email matches
  if (siteBusiness.verification_email !== user.email) {
    return { ok: false, error: 'Email mismatch. Please try again.' };
  }

  // Check token expiration
  if (siteBusiness.verification_token_expires_at) {
    const expiresAt = new Date(siteBusiness.verification_token_expires_at);
    if (expiresAt < new Date()) {
      // Reset verification status
      await supabase
        .from('site_businesses')
        .update({ verification_status: 'expired' })
        .eq('id', siteBusinessId);

      return { ok: false, error: 'Verification link has expired. Please try again.' };
    }
  }

  // Set user password
  const { error: passwordError } = await supabase.auth.updateUser({
    password,
  });

  if (passwordError) {
    console.error('Error setting password:', passwordError);
    return { ok: false, error: 'Failed to set password. Please try again.' };
  }

  // Update profile with display name and mark has_password
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      has_password: true,
    })
    .eq('id', user.id);

  if (profileError) {
    console.error('Error updating profile:', profileError);
    return { ok: false, error: 'Failed to update profile. Please try again.' };
  }

  // Mark business as claimed
  const { error: claimError } = await supabase
    .from('site_businesses')
    .update({
      is_claimed: true,
      claimed_by: user.id,
      claimed_at: new Date().toISOString(),
      verification_status: 'verified',
      verified_at: new Date().toISOString(),
    })
    .eq('id', siteBusinessId);

  if (claimError) {
    console.error('Error claiming business:', claimError);
    return { ok: false, error: 'Failed to claim business. Please try again.' };
  }

  const business = siteBusiness.business as { id: string; name: string };

  return {
    ok: true,
    data: {
      claimed: true,
      redirectTo: `/business/${business.id}`,
    },
  };
}

/**
 * Gets the claim status for the verify page.
 * Checks if user has a password set.
 */
export async function getClaimStatus(payload: {
  siteBusinessId: string;
}): Promise<
  ActionsResponse<{
    hasPassword: boolean;
    businessName: string;
    email: string;
  }>
> {
  const { siteBusinessId } = payload;

  if (!siteBusinessId) {
    return { ok: false, error: 'Missing siteBusinessId.' };
  }

  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'Not authenticated.' };
  }

  // Fetch profile to check has_password
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('has_password')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return { ok: false, error: 'Profile not found.' };
  }

  // Fetch business name
  const { data: siteBusiness, error: businessError } = await supabase
    .from('site_businesses')
    .select(
      `
      id,
      is_claimed,
      verification_email,
      business:businesses!inner(name)
    `
    )
    .eq('id', siteBusinessId)
    .single();

  if (businessError || !siteBusiness) {
    return { ok: false, error: 'Business not found.' };
  }

  if (siteBusiness.is_claimed) {
    return { ok: false, error: 'This business has already been claimed.' };
  }

  const business = siteBusiness.business as { name: string };

  return {
    ok: true,
    data: {
      hasPassword: profile.has_password ?? false,
      businessName: business.name,
      email: user.email ?? '',
    },
  };
}
