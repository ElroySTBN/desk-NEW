-- ============================================================================
-- SYSTÈME DE TÂCHES ET NOTES RAPIDES
-- ============================================================================
-- Ce fichier crée toutes les tables nécessaires pour la gestion des tâches,
-- notes, contenu, et alertes intelligentes

-- ============================================================================
-- 1. TABLE : tasks (Tâches avec priorités et deadlines)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Informations de la tâche
  title TEXT NOT NULL,
  description TEXT,
  
  -- Classification
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'general',
    'onboarding',
    'content',
    'invoice',
    'call',
    'deadline',
    'urgent'
  )),
  
  -- Priorité et urgence
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  urgency BOOLEAN DEFAULT false,
  
  -- Dates importantes
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes pour les requêtes rapides
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_category ON public.tasks(category);

-- RLS Policies
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. TABLE : quick_notes (Notes rapides globales ou par client)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quick_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Contenu
  content TEXT NOT NULL,
  
  -- Classification
  tags TEXT[] DEFAULT '{}',
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_quick_notes_user_id ON public.quick_notes(user_id);
CREATE INDEX idx_quick_notes_client_id ON public.quick_notes(client_id);
CREATE INDEX idx_quick_notes_created_at ON public.quick_notes(created_at DESC);

-- RLS Policies
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes"
  ON public.quick_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON public.quick_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.quick_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.quick_notes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. TABLE : client_calls (Historique des appels/meetings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.client_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Informations de l'appel
  call_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  call_type TEXT NOT NULL DEFAULT 'phone' CHECK (call_type IN ('phone', 'video', 'meeting', 'email')),
  
  -- Contenu
  notes TEXT,
  action_items TEXT[],
  follow_ups TEXT[],
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_client_calls_user_id ON public.client_calls(user_id);
CREATE INDEX idx_client_calls_client_id ON public.client_calls(client_id);
CREATE INDEX idx_client_calls_call_date ON public.client_calls(call_date DESC);

-- RLS Policies
ALTER TABLE public.client_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calls"
  ON public.client_calls FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calls"
  ON public.client_calls FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calls"
  ON public.client_calls FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calls"
  ON public.client_calls FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. TABLE : content_library (Bibliothèque de contenu pour Google Business)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Type de contenu
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'photo', 'promotion', 'update', 'other')),
  
  -- Planification
  scheduled_date TIMESTAMPTZ NOT NULL,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  -- Contenu
  title TEXT,
  description TEXT,
  content TEXT NOT NULL,
  hashtags TEXT[],
  
  -- Fichiers
  media_url TEXT[],
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'scheduled', 'published')),
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_content_library_user_id ON public.content_library(user_id);
CREATE INDEX idx_content_library_client_id ON public.content_library(client_id);
CREATE INDEX idx_content_library_scheduled_date ON public.content_library(scheduled_date);
CREATE INDEX idx_content_library_status ON public.content_library(status);

-- RLS Policies
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content"
  ON public.content_library FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own content"
  ON public.content_library FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content"
  ON public.content_library FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content"
  ON public.content_library FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. TABLE : brand_dna (Document d'identité d'entreprise exportable)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.brand_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Liens avec onboarding
  onboarding_id UUID REFERENCES public.onboarding(id),
  
  -- Contenu complet du Brand DNA (JSON)
  dna_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Version
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(client_id)
);

-- Indexes
CREATE INDEX idx_brand_dna_user_id ON public.brand_dna(user_id);
CREATE INDEX idx_brand_dna_client_id ON public.brand_dna(client_id);

-- RLS Policies
ALTER TABLE public.brand_dna ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brand DNA"
  ON public.brand_dna FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand DNA"
  ON public.brand_dna FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand DNA"
  ON public.brand_dna FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand DNA"
  ON public.brand_dna FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. TABLE : client_photos (Photos des clients pour carrousel)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.client_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- URL de la photo
  photo_url TEXT NOT NULL,
  photo_name TEXT,
  
  -- Classification
  tags TEXT[],
  
  -- Métadonnées
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_client_photos_user_id ON public.client_photos(user_id);
CREATE INDEX idx_client_photos_client_id ON public.client_photos(client_id);

-- RLS Policies
ALTER TABLE public.client_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own photos"
  ON public.client_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own photos"
  ON public.client_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON public.client_photos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. TRIGGERS : Mise à jour automatique de updated_at
-- ============================================================================

-- Fonction générique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_tasks_timestamp
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quick_notes_timestamp
  BEFORE UPDATE ON public.quick_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_calls_timestamp
  BEFORE UPDATE ON public.client_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_library_timestamp
  BEFORE UPDATE ON public.content_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_dna_timestamp
  BEFORE UPDATE ON public.brand_dna
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. COLONNES SUPPRIMAIRES POUR CLIENTS
-- ============================================================================

-- Ajouter colonne pour photo de profil client
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Ajouter colonne pour compte Stripe
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Ajouter colonne pour prochaine facture
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS next_invoice_date DATE;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

