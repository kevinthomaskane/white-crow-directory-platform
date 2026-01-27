-- Create site_business_media table for owner-uploaded images and video embeds (pro feature)
-- Images are stored in Supabase Storage under the site's bucket
-- Videos are YouTube/Vimeo embed URLs

CREATE TABLE IF NOT EXISTS public.site_business_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_business_id UUID NOT NULL REFERENCES public.site_businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  file_path TEXT,                    -- storage path for images (e.g., site-domain/business-media/uuid/filename)
  embed_url TEXT,                    -- YouTube/Vimeo URL for videos
  sort_order INTEGER NOT NULL DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),

  -- Ensure correct source based on type
  CONSTRAINT media_source_check CHECK (
    (type = 'image' AND file_path IS NOT NULL AND embed_url IS NULL) OR
    (type = 'video' AND embed_url IS NOT NULL AND file_path IS NULL)
  )
);

-- Index for querying media by site_business, ordered by sort_order
CREATE INDEX idx_site_business_media_site_business_id ON public.site_business_media(site_business_id, sort_order);

-- Index for querying media by creator
CREATE INDEX idx_site_business_media_created_by ON public.site_business_media(created_by) WHERE created_by IS NOT NULL;

-- RLS policies
ALTER TABLE public.site_business_media ENABLE ROW LEVEL SECURITY;

-- Anyone can view media
CREATE POLICY "Anyone can view site business media"
  ON public.site_business_media
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Business owners can manage media for their claimed businesses
CREATE POLICY "Business owners can manage their media"
  ON public.site_business_media
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.site_businesses sb
      WHERE sb.id = site_business_id
      AND sb.claimed_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.site_businesses sb
      WHERE sb.id = site_business_id
      AND sb.claimed_by = auth.uid()
    )
  );

-- Admins can manage all media
CREATE POLICY "Admins can manage all site business media"
  ON public.site_business_media
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
