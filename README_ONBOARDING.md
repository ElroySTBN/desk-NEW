# 📋 Système d'Onboarding Client - RaiseMed.IA

## 🎯 Vue d'ensemble

Système complet pour onboarder vos clients de manière professionnelle avec :
- ✅ Formulaire interactif en 10 sections
- ✅ Pré-remplissage des informations
- ✅ Sauvegarde automatique
- ✅ Upload de fichiers
- ✅ Export PDF professionnel
- ✅ 100% responsive (mobile-friendly)

## 🚀 Installation

### Option 1 : Installation automatique (RECOMMANDÉ)

```bash
node scripts/install-onboarding.mjs
```

Le script va :
1. Vérifier la connexion Supabase ✅
2. Afficher le SQL à appliquer
3. Vous guider étape par étape

### Option 2 : Interface Web

```bash
open scripts/auto-setup-onboarding.html
```

Interface visuelle avec bouton "Démarrer" qui fait tout.

### Option 3 : Manuel

1. **SQL Editor** : Copiez `supabase/migrations/20251028000000_add_onboarding_table.sql`
2. **Storage** : Créez un bucket `onboarding-files` (public)

## 📱 Utilisation

### 1. Créer un onboarding

```
/onboarding → Nouveau Onboarding
```

- Nom du client (obligatoire)
- Informations pré-remplies (optionnel)
- → Génère un lien unique

### 2. Le client remplit

Le lien est du type :
```
https://votre-app.com/onboarding/form/[UUID]
```

**Fonctionnalités :**
- 🟡 Champs pré-remplis en orange avec ℹ️
- 💾 Sauvegarde auto toutes les 30s
- 📊 Barre de progression en temps réel
- 📎 Upload de photos
- 📱 Responsive mobile

### 3. Exporter en PDF

```
Terminer → Télécharger PDF
```

PDF avec :
- Logo RaiseMed.IA
- Toutes les sections
- Champs pré-remplis marqués
- Mise en page professionnelle

## 📂 Structure

```
src/
├── pages/
│   ├── Onboarding.tsx              # Liste des onboardings
│   ├── CreateOnboarding.tsx        # Création admin
│   ├── OnboardingForm.tsx          # Formulaire client
│   └── OnboardingExport.tsx        # Export PDF
│
├── components/onboarding/
│   ├── LegalInfoSection.tsx        # Section 1
│   ├── BrandIdentitySection.tsx    # Section 2
│   ├── TargetAudienceSection.tsx   # Section 3
│   ├── CommunicationSection.tsx    # Section 4
│   ├── HistorySection.tsx          # Section 5
│   ├── GoogleBusinessSection.tsx   # Section 6
│   ├── VisualsSection.tsx          # Section 7
│   ├── NFCTeamSection.tsx          # Section 8
│   ├── FollowUpSection.tsx         # Section 9
│   └── ValidationSection.tsx       # Section 10
│
├── lib/
│   ├── onboarding-schema.ts        # Validation Zod
│   └── pdfExport.ts                # Génération PDF
│
└── types/
    └── onboarding.ts               # Types TypeScript
```

## 🔧 Technologies

- **React** + **TypeScript**
- **React Hook Form** + **Zod** (validation)
- **Supabase** (BDD + Storage)
- **jsPDF** (export PDF)
- **Shadcn/ui** (composants)
- **Tailwind CSS** (styling)

## 📊 Base de données

### Table `onboarding`

```sql
id              uuid PRIMARY KEY
client_name     text NOT NULL
created_by      text NOT NULL
status          text (draft/sent/completed/exported)
legal_info      jsonb
brand_identity  jsonb
... (10 sections JSONB)
created_at      timestamp
updated_at      timestamp
```

### Storage

- Bucket : `onboarding-files` (public)
- Types acceptés : Images + PDF
- Limite : 50 MB par fichier

## 🎨 Personnalisation

### Modifier une section

Éditez le composant correspondant dans `src/components/onboarding/`

### Modifier la validation

Éditez `src/lib/onboarding-schema.ts`

### Personnaliser le PDF

Éditez `src/lib/pdfExport.ts`

## 📱 Responsive

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px)
- ✅ Tablet (768px)
- ✅ Mobile (375px)

## 🔒 Sécurité

- RLS policies activées
- Accès authentifié uniquement (admin)
- Formulaire public accessible via lien unique
- Upload sécurisé avec types validés

## 📈 Statuts

- **draft** : En cours de remplissage
- **sent** : Envoyé au client
- **completed** : Complété par le client
- **exported** : PDF généré

## 🐛 Dépannage

### La table n'existe pas

```bash
# Réappliquer la migration
node scripts/install-onboarding.mjs
```

### Les fichiers ne s'uploadent pas

Vérifiez que le bucket `onboarding-files` :
- Existe
- Est configuré en **public**
- A les bons MIME types

### Le PDF ne se génère pas

Vérifiez que `jspdf` est installé :
```bash
npm install jspdf
```

## 📚 Documentation

- **INSTALLATION_RAPIDE.md** - Guide d'installation
- **GUIDE_ONBOARDING.md** - Guide utilisateur complet
- **ONBOARDING_IMPLEMENTATION.md** - Documentation technique

## 🎯 Prochaines fonctionnalités possibles

- [ ] Notifications email automatiques
- [ ] Templates d'onboarding
- [ ] Signature électronique
- [ ] Multi-langue
- [ ] Analytics & rapports
- [ ] Application mobile dédiée

## 🤝 Support

Pour toute question :
- Consultez la documentation
- Vérifiez les logs console
- Contactez le support RaiseMed.IA

---

**Version** : 1.0.0
**Date** : Octobre 2024
**Auteur** : RaiseMed.IA Team

