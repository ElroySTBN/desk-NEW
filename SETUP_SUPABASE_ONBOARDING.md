# 🗄️ CONFIGURATION SUPABASE POUR L'ONBOARDING

⚠️ **IMPORTANT** : Avant de déployer, vous devez créer les tables d'onboarding dans votre projet Supabase !

---

## 📋 ÉTAPE 1 : Créer la table `onboarding`

1. **Allez sur** : https://supabase.com/dashboard/project/lpkjndazjigkyxniqptb/editor

2. **Cliquez sur "SQL Editor"** (à gauche)

3. **Cliquez sur "+ New query"**

4. **Copiez-collez ce SQL** :

```sql
-- Table onboarding
CREATE TABLE IF NOT EXISTS public.onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id),
  client_name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'validated')),
  legal_info JSONB DEFAULT '{}'::jsonb,
  brand_identity JSONB DEFAULT '{}'::jsonb,
  target_audience JSONB DEFAULT '{}'::jsonb,
  communication JSONB DEFAULT '{}'::jsonb,
  history JSONB DEFAULT '{}'::jsonb,
  google_business JSONB DEFAULT '{}'::jsonb,
  visuals JSONB DEFAULT '{}'::jsonb,
  nfc_team JSONB DEFAULT '{}'::jsonb,
  follow_up JSONB DEFAULT '{}'::jsonb,
  validation JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_onboarding_client_id ON public.onboarding(client_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON public.onboarding(status);

-- RLS (Row Level Security)
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire et écrire (pour le moment)
CREATE POLICY "Allow all access to onboarding" ON public.onboarding
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_updated_at
  BEFORE UPDATE ON public.onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

5. **Cliquez sur "Run"** (ou Ctrl+Enter)

6. ✅ **Vous devriez voir** : "Success. No rows returned"

---

## 📁 ÉTAPE 2 : Créer le bucket de stockage

1. **Allez sur** : https://supabase.com/dashboard/project/lpkjndazjigkyxniqptb/storage/buckets

2. **Cliquez sur "+ New bucket"**

3. **Nom du bucket** : `onboarding-files`

4. **Public bucket** : ✅ **COCHEZ** (pour que les fichiers soient accessibles)

5. **Cliquez sur "Create bucket"**

---

## ✅ ÉTAPE 3 : Vérification

### Vérifier la table

1. Allez sur : https://supabase.com/dashboard/project/lpkjndazjigkyxniqptb/editor

2. Dans "Table Editor", vous devriez voir la table **`onboarding`**

### Vérifier le bucket

1. Allez sur : https://supabase.com/dashboard/project/lpkjndazjigkyxniqptb/storage/buckets

2. Vous devriez voir le bucket **`onboarding-files`**

---

## 🚀 C'EST PRÊT !

Une fois ces 2 étapes terminées, vous pouvez déployer sur Vercel !

---

## 🆘 Problèmes courants

### Erreur "relation does not exist"
→ La table n'a pas été créée. Réexécutez le SQL de l'étape 1

### Erreur "bucket not found"
→ Le bucket n'existe pas. Créez-le dans l'étape 2

### Erreur "permission denied"
→ Vérifiez que les politiques RLS sont bien créées (étape 1)

---

## 📝 Note

Ces configurations sont déjà prêtes dans les fichiers :
- `supabase/migrations/20251028000000_add_onboarding_table.sql`
- `supabase/migrations/20251028000001_create_onboarding_storage.sql`

Mais comme vous avez un nouveau projet Supabase, il faut les appliquer manuellement.

