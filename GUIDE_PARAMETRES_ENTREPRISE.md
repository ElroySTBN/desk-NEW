# 📝 Système de Paramètres Entreprise - RaiseMed OS

## ✅ Ce qui a été implémenté

### 1. **Page Paramètres complète** (`/settings`)
- 📊 **Onglet Entreprise** : Toutes les informations de RaiseMed.IA
- 📦 **Onglet Produits** : Catalogue de vos produits et services

### 2. **Tables de base de données**
- `company_settings` : Informations de l'entreprise
- `products` : Catalogue produits/services

### 3. **Intégration dynamique**
- ✅ **Factures PDF** : Utilisent automatiquement vos paramètres
- ✅ **Emails** : Signature dynamique basée sur vos infos
- ✅ **Templates** : Tous les emails utilisent votre signature

---

## 🎯 Configuration initiale (obligatoire)

### Étape 1 : Appliquer la migration SQL

Dans l'éditeur SQL de Supabase, exécutez le contenu du fichier :
`supabase/migrations/20251027120000_add_settings_tables.sql`

Ou copiez-collez ceci :

```sql
-- Create company_settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  company_name TEXT NOT NULL DEFAULT 'RaiseMed.IA',
  legal_form TEXT DEFAULT 'Micro-entreprise',
  siret TEXT,
  siren TEXT,
  tva_number TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'France',
  email TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  bank_name TEXT,
  iban TEXT,
  bic TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  reference TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_ht DECIMAL(10,2) NOT NULL,
  tva_rate DECIMAL(5,2) DEFAULT 20,
  subscription_type TEXT CHECK (subscription_type IN ('mensuel', 'trimestriel', 'semestriel', 'annuel', 'ponctuel')) DEFAULT 'mensuel',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reference)
);

-- Add indexes
CREATE INDEX idx_company_settings_user_id ON public.company_settings(user_id);
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_active ON public.products(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_settings
CREATE POLICY "Users can view their own company settings"
  ON public.company_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company settings"
  ON public.company_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company settings"
  ON public.company_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for products
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
```

### Étape 2 : Remplir vos informations d'entreprise

1. Allez dans **Paramètres** (nouvelle icône dans la sidebar)
2. Onglet **Entreprise**
3. Remplissez les informations de RaiseMed.IA :

**Informations générales** :
- Nom entreprise : `RaiseMed.IA`
- Forme juridique : `Micro-entreprise`
- SIRET : `94011372300016`
- SIREN : `940113723`
- TVA : `FR27940113723`

**Adresse** :
- Adresse : `4 Rue Bellanger`
- Code postal : `92200`
- Ville : `Neuilly-Sur-Seine`

**Contact** :
- Email : `contact@raisemed.ia`
- Téléphone : `07 82 49 21 24`
- Site web : `https://raisemed.ia`

**Informations bancaires** (optionnel) :
- Nom banque : `[Votre banque]`
- IBAN : `[Votre IBAN]`
- BIC : `[Votre BIC]`

4. Cliquez sur **Enregistrer les paramètres**

### Étape 3 : Créer votre catalogue de produits

1. Onglet **Produits & Services**
2. Cliquez sur **Nouveau produit**
3. Remplissez les informations :

**Exemple de produit** :
- Référence : `GBP-MENSUEL`
- Nom : `Google Business Profile - Abonnement Mensuel`
- Description : `Gestion complète de votre profil Google Business...`
- Prix HT : `150.00`
- TVA : `20`
- Type : `Mensuel`
- Actif : ✅

**Autres produits à créer** :
- `GBP-SEMESTRIEL` → 900€ HT
- `INTEGRATION` → 1500€ HT (ponctuel)
- `META-ADS` → 500€ HT (ponctuel)

---

## 📋 Informations sur les produits RaiseMed.IA

Voici vos produits actuels (à ajouter dans le catalogue) :

| Référence | Nom | Prix HT | Type | Description |
|-----------|-----|---------|------|-------------|
| GBP-MENSUEL | GBP - Mensuel | 150 € | Mensuel | Gestion mensuelle Google Business Profile |
| GBP-SEMESTRIEL | GBP - Semestriel | 900 € | Semestriel | Abonnement GBP 6 mois |
| INTEGRATION | Frais d'intégration | 1500 € | Ponctuel | Setup initial et intégration |
| META-ADS | Campagne Meta Ads | 500 € | Ponctuel | Campagne publicitaire Facebook/Instagram |

---

## 🚀 Avantages du système de paramètres

### 1. **Factures PDF automatiques**
- ✅ Toutes vos factures utilisent automatiquement vos infos d'entreprise
- ✅ SIRET, TVA, adresse affichés automatiquement
- ✅ IBAN affiché si renseigné
- ✅ Mentions légales dynamiques

### 2. **Signatures d'emails dynamiques**
- ✅ Tous les emails utilisent votre signature personnalisée
- ✅ Basée sur vos paramètres (nom, email, téléphone, site web)
- ✅ Mise à jour instantanée sur tous les templates

### 3. **Catalogue produits**
- ✅ Gérez vos offres en un seul endroit
- ✅ Référencez rapidement vos prestations
- ✅ (Futur) Génération automatique de devis
- ✅ (Futur) Sélection rapide lors création facture

---

## 📊 Comparaison Avant / Après

### Avant (version hardcodée)
```typescript
// Factures avec infos codées en dur
doc.text("RaiseMed.IA", 20, 55);
doc.text("4 Rue Bellanger", 20, 60);
doc.text("SIRET: 94011372300016", 20, 75);
// ❌ Changement = modifier le code
```

### Après (version paramétrable)
```typescript
// Factures avec infos depuis la base de données
doc.text(companySettings.company_name, 20, 55);
doc.text(companySettings.address, 20, 60);
doc.text(`SIRET: ${companySettings.siret}`, 20, 75);
// ✅ Changement = modifier les paramètres (interface)
```

---

## 🎯 Utilisation quotidienne

### Modifier les informations de l'entreprise
1. **Paramètres** → **Entreprise**
2. Modifier les champs souhaités
3. **Enregistrer**
4. ✅ Toutes les factures et emails futurs utiliseront les nouvelles infos

### Ajouter un nouveau produit
1. **Paramètres** → **Produits & Services**
2. **Nouveau produit**
3. Remplir le formulaire
4. ✅ Disponible immédiatement

### Désactiver un produit
1. **Paramètres** → **Produits & Services**
2. Cliquer sur l'icône ✏️ du produit
3. Décocher "Produit actif"
4. ✅ Masqué du catalogue (mais conservé en base)

---

## 💡 Prochaines évolutions possibles

1. **Générateur de devis**
   - Sélection rapide des produits depuis le catalogue
   - Calcul automatique des montants
   - Génération PDF comme les factures

2. **Multi-devises**
   - Support EUR, USD, etc.
   - Conversion automatique

3. **Historique des modifications**
   - Tracer les changements de paramètres
   - Audit trail complet

4. **Multi-utilisateurs**
   - Gestion des permissions
   - Plusieurs utilisateurs par entreprise

---

## 🆘 En cas de problème

### Les paramètres ne s'enregistrent pas
- Vérifier que la migration SQL a bien été appliquée
- Vérifier les logs dans la console navigateur (F12)
- Vérifier que vous êtes bien connecté

### Les factures n'utilisent pas mes paramètres
- Vérifier que les paramètres ont bien été enregistrés
- Générer une nouvelle facture (les anciennes gardent les anciennes infos)

### Les emails n'ont pas ma signature
- Vérifier que les paramètres de contact (email, téléphone) sont remplis
- Envoyer un nouvel email pour tester

---

**Date de création** : 27 octobre 2024
**Version** : 2.0
**Développé par** : Claude (Assistant IA)


