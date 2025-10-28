# 🔧 Configuration de VOTRE nouveau Supabase

## ✅ Étape 3 : Mettre à jour le fichier .env

Ouvrez le fichier `.env` à la racine du projet et remplacez-le par :

```bash
# Remplacez par VOS clés Supabase
VITE_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...VOTRE_CLE_ANON_PUBLIC
```

### Comment trouver ces valeurs ?

1. Dans votre projet Supabase → **Settings** (⚙️) → **API**
2. Copiez :
   - **Project URL** → Collez après `VITE_SUPABASE_URL=`
   - **anon public** → Collez après `VITE_SUPABASE_PUBLISHABLE_KEY=`

---

## ✅ Étape 4 : Créer les tables (Migrations SQL)

### Option A : Via l'interface Supabase (Recommandé)

1. Dans votre projet Supabase, cliquez sur **SQL Editor** dans le menu
2. Cliquez sur **New query**
3. Copiez le contenu du fichier `supabase/migrations/20251025111131_c564f016-3265-48ea-aa21-56a5c236550a.sql`
4. Collez dans l'éditeur SQL
5. Cliquez sur **Run** (ou Ctrl+Enter)
6. ✅ Attendez le message "Success"

7. Répétez avec le fichier `supabase/migrations/20251026000000_add_onboarding.sql`

### Option B : Via Supabase CLI

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier votre projet (remplacez VOTRE_PROJECT_ID)
supabase link --project-ref VOTRE_PROJECT_ID

# Appliquer les migrations
supabase db push
```

---

## ✅ Étape 5 : Créer le bucket Storage

Pour stocker les documents clients :

1. Dans Supabase, cliquez sur **Storage** dans le menu
2. Cliquez sur **New bucket**
3. Remplissez :
   - **Name** : `client-documents`
   - **Public bucket** : ❌ Non (laissez décoché)
4. Cliquez sur **Create bucket**

### Configurer les politiques RLS :

1. Cliquez sur votre bucket `client-documents`
2. Allez dans l'onglet **Policies**
3. Cliquez sur **New policy** → **Create a custom policy**
4. Dans le SQL Editor qui s'ouvre, exécutez ces 3 politiques :

```sql
-- Politique pour l'upload
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'client-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour le téléchargement
CREATE POLICY "Users can download own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'client-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour la suppression
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'client-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## ✅ Étape 6 : Créer votre compte Admin

### Option A : Via l'interface Supabase

1. Allez dans **Authentication** → **Users**
2. Cliquez sur **Add user** → **Create new user**
3. Remplissez :
   - **Email** : `elroy@raisemed.ia`
   - **Password** : Choisissez votre mot de passe
   - ✅ **Cochez "Auto Confirm User"**
4. Cliquez sur **Create user**

### Option B : Via SQL Editor

```sql
-- Remplacez VOTRE_MOT_DE_PASSE
SELECT auth.signup(
  'elroy@raisemed.ia',
  'VOTRE_MOT_DE_PASSE',
  '{"full_name": "Elroy SITBON"}'::jsonb
);
```

---

## ✅ Étape 7 : Redémarrer l'application

```bash
# Arrêtez le serveur (Ctrl+C dans le terminal)
# Puis relancez
cd /Users/elroysitbon/raisedesk-io
npm run dev
```

---

## ✅ Étape 8 : Se connecter !

1. Allez sur http://localhost:8080
2. Connectez-vous avec :
   - **Identifiant** : `elroy`
   - **Mot de passe** : celui que vous avez créé

---

## 🎉 C'est terminé !

Votre RaiseMed OS est maintenant connecté à VOTRE base de données Supabase !

Toutes vos données (clients, factures, KPIs, etc.) seront stockées sur votre compte.

---

## ⚠️ Checklist de vérification

- [ ] Fichier .env mis à jour avec mes clés
- [ ] Migration 1 exécutée (tables clients, invoices, etc.)
- [ ] Migration 2 exécutée (onboarding, tasks, notifications)
- [ ] Bucket `client-documents` créé
- [ ] Politiques RLS configurées sur le bucket
- [ ] Compte admin créé (elroy@raisemed.ia)
- [ ] Application redémarrée
- [ ] Connexion réussie !

