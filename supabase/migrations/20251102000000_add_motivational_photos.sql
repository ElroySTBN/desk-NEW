-- ============================================================================
-- 📸 MOTIVATIONAL PHOTOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.motivational_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS motivational_photos_user_id_idx ON public.motivational_photos(user_id);
CREATE INDEX IF NOT EXISTS motivational_photos_display_order_idx ON public.motivational_photos(display_order);

-- Trigger for updated_at
CREATE TRIGGER motivational_photos_updated_at
  BEFORE UPDATE ON public.motivational_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.motivational_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own motivational photos"
  ON public.motivational_photos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own motivational photos"
  ON public.motivational_photos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own motivational photos"
  ON public.motivational_photos
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own motivational photos"
  ON public.motivational_photos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.motivational_photos TO authenticated;

