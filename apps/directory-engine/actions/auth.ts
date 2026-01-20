'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';

/**
 * Initiates an email change. Supabase will send a confirmation link to the new email.
 */
export async function updateEmail(payload: {
  email: string;
}): Promise<ActionsResponse<{ message: string }>> {
  const { email } = payload;

  if (!email) {
    return { ok: false, error: 'Email is required.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in to update your email.' };
  }

  if (user.email === email) {
    return { ok: false, error: 'This is already your current email.' };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    email,
  });

  if (updateError) {
    console.error('Error updating email:', updateError);
    return { ok: false, error: updateError.message };
  }

  return {
    ok: true,
    data: { message: 'Confirmation email sent. Please check your inbox.' },
  };
}

/**
 * Updates the user's password and marks has_password as true in their profile.
 */
export async function updatePassword(payload: {
  password: string;
}): Promise<ActionsResponse<{ updated: true }>> {
  const { password } = payload;

  if (!password || password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in to update your password.' };
  }

  // Update password
  const { error: passwordError } = await supabase.auth.updateUser({
    password,
  });

  if (passwordError) {
    console.error('Error updating password:', passwordError);
    return { ok: false, error: 'Failed to update password. Please try again.' };
  }

  // Update profile to mark has_password as true
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ has_password: true })
    .eq('id', user.id);

  if (profileError) {
    console.error('Error updating profile:', profileError);
    // Don't fail the whole operation if profile update fails
    // The password was still updated successfully
  }

  return { ok: true, data: { updated: true } };
}
