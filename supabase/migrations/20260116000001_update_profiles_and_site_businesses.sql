-- Update profiles and site_businesses tables for Stripe billing and claim verification

-- =============================================================================
-- PROFILES TABLE CHANGES
-- =============================================================================

-- Add email field (can be synced from auth.users or set separately)
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "email" text;

-- Add Stripe customer ID (one customer per user, can have multiple subscriptions)
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;

-- Add updated_at for tracking changes
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();

-- =============================================================================
-- SITE_BUSINESSES TABLE CHANGES
-- =============================================================================

-- Remove stripe_customer_id (moving to profiles)
ALTER TABLE "public"."site_businesses" DROP COLUMN IF EXISTS "stripe_customer_id";

-- Change claimed_by from text to uuid with FK to profiles
-- First, drop policies that reference claimed_by (we'll recreate them after)
DROP POLICY IF EXISTS "users can delete categories for claimed businesses" ON "public"."business_categories";
DROP POLICY IF EXISTS "users can insert categories for claimed businesses" ON "public"."business_categories";
DROP POLICY IF EXISTS "users can read categories for claimed businesses" ON "public"."business_categories";
DROP POLICY IF EXISTS "users can read own claimed businesses" ON "public"."businesses";
DROP POLICY IF EXISTS "users can read own claimed businesses" ON "public"."site_businesses";
DROP POLICY IF EXISTS "users can update own claimed businesses" ON "public"."businesses";

-- Convert claimed_by from text to uuid
ALTER TABLE "public"."site_businesses"
  ALTER COLUMN "claimed_by" TYPE uuid USING "claimed_by"::uuid;

-- Add foreign key constraint
ALTER TABLE "public"."site_businesses"
  ADD CONSTRAINT "site_businesses_claimed_by_fkey"
  FOREIGN KEY ("claimed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;

-- Add verification fields
ALTER TABLE "public"."site_businesses" ADD COLUMN IF NOT EXISTS "verification_status" text DEFAULT 'unverified';
ALTER TABLE "public"."site_businesses" ADD COLUMN IF NOT EXISTS "verification_email" text;
ALTER TABLE "public"."site_businesses" ADD COLUMN IF NOT EXISTS "verification_token" text;
ALTER TABLE "public"."site_businesses" ADD COLUMN IF NOT EXISTS "verification_token_expires_at" timestamp with time zone;
ALTER TABLE "public"."site_businesses" ADD COLUMN IF NOT EXISTS "verified_at" timestamp with time zone;

-- Add check constraint for verification_status
ALTER TABLE "public"."site_businesses"
  ADD CONSTRAINT "site_businesses_verification_status_check"
  CHECK (verification_status IN ('unverified', 'pending', 'verified', 'expired'));

-- Add plan field (null = unclaimed, 'free' = claimed free listing, 'premium' = paid subscription)
ALTER TABLE "public"."site_businesses" ADD COLUMN IF NOT EXISTS "plan" text;

-- Add check constraint for plan
ALTER TABLE "public"."site_businesses"
  ADD CONSTRAINT "site_businesses_plan_check"
  CHECK (plan IS NULL OR plan IN ('free', 'premium'));

-- =============================================================================
-- RECREATE RLS POLICIES (with uuid type for claimed_by)
-- =============================================================================

-- business_categories policies
CREATE POLICY "users can delete categories for claimed businesses" ON "public"."business_categories"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "public"."site_businesses"
      WHERE "site_businesses"."business_id" = "business_categories"."business_id"
        AND "site_businesses"."claimed_by" = auth.uid()
    )
  );

CREATE POLICY "users can insert categories for claimed businesses" ON "public"."business_categories"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."site_businesses"
      WHERE "site_businesses"."business_id" = "business_categories"."business_id"
        AND "site_businesses"."claimed_by" = auth.uid()
    )
  );

CREATE POLICY "users can read categories for claimed businesses" ON "public"."business_categories"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "public"."site_businesses"
      WHERE "site_businesses"."business_id" = "business_categories"."business_id"
        AND "site_businesses"."claimed_by" = auth.uid()
    )
  );

-- businesses policies
CREATE POLICY "users can read own claimed businesses" ON "public"."businesses"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "public"."site_businesses"
      WHERE "site_businesses"."business_id" = "businesses"."id"
        AND "site_businesses"."claimed_by" = auth.uid()
    )
  );

CREATE POLICY "users can update own claimed businesses" ON "public"."businesses"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "public"."site_businesses"
      WHERE "site_businesses"."business_id" = "businesses"."id"
        AND "site_businesses"."claimed_by" = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."site_businesses"
      WHERE "site_businesses"."business_id" = "businesses"."id"
        AND "site_businesses"."claimed_by" = auth.uid()
    )
  );

-- site_businesses policies
CREATE POLICY "users can read own claimed businesses" ON "public"."site_businesses"
  FOR SELECT USING ("claimed_by" = auth.uid());
