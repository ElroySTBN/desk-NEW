-- ============================================================================
-- Migration : Ajouter la table products si elle n'existe pas
-- ============================================================================
-- Cette migration ajoute la table products au schéma TDAH
-- ============================================================================

-- Créer la table products si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_ht DECIMAL(10,2) NOT NULL,
  tva_rate DECIMAL(5,2) DEFAULT 20,
  subscription_type TEXT CHECK (subscription_type IN ('mensuel', 'trimestriel', 'semestriel', 'annuel', 'ponctuel', 'installation', 'service')) DEFAULT 'mensuel',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reference)
);

-- Ajouter les colonnes manquantes si la table existe déjà
DO $$ 
BEGIN
  -- Ajouter subscription_type si elle n'existe pas (avec les nouvelles valeurs)
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'products') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'products' 
                   AND column_name = 'subscription_type') THEN
      ALTER TABLE public.products ADD COLUMN subscription_type TEXT DEFAULT 'mensuel';
    END IF;
    
    -- Mettre à jour la contrainte CHECK pour inclure les nouvelles valeurs
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_schema = 'public' 
               AND table_name = 'products' 
               AND constraint_name = 'products_subscription_type_check') THEN
      ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_subscription_type_check;
    END IF;
    ALTER TABLE public.products ADD CONSTRAINT products_subscription_type_check 
      CHECK (subscription_type IN ('mensuel', 'trimestriel', 'semestriel', 'annuel', 'ponctuel', 'installation', 'service'));
  END IF;
END $$;

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_reference ON public.products(user_id, reference);

-- Activer RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes si elles existent
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;

-- Créer les policies RLS
CREATE POLICY "Users can view their own products"
  ON public.products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);

-- Créer le trigger pour updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- Commentaires
COMMENT ON TABLE public.products IS 'Catalogue des produits et services pour la facturation';


