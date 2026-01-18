-- Multi-site user management: site_id on profiles
-- Each auth user can have one profile per site
-- Profiles are created in signup form, not automatically via trigger

-- Drop the handle_new_user trigger if it exists (profiles created in signup form now)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Note: site_id column, foreign key, and unique constraint were already added to profiles
-- in a previous migration. This migration just ensures the trigger is removed.

-- The profiles table structure:
-- - id: uuid (FK to auth.users)
-- - site_id: uuid (FK to sites)
-- - display_name, email, role, stripe_customer_id, etc.
-- - Unique constraint on (id, site_id): one profile per user per site
