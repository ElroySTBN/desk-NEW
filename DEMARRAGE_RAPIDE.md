# 🚀 Démarrage Rapide - Système d'Onboarding

## ✅ Installation TERMINÉE !

Tout le code est prêt et fonctionnel. Il ne reste que 2 petites étapes sur Supabase.

---

## ⚡ 2 ACTIONS RAPIDES (< 30 secondes)

### 1️⃣ Appliquer le SQL (10 secondes)

Le SQL Editor Supabase est déjà ouvert dans votre navigateur.

**OU ouvrez :** https://supabase.com/dashboard/project/qpbtmqgsnqnbkzxopaiv/sql/new

**Actions :**
1. Le SQL est déjà dans votre presse-papiers
2. Collez avec `Cmd+V`
3. Cliquez sur **"Run"** en haut à droite

✅ Table `onboarding` créée !

---

### 2️⃣ Créer le bucket Storage (20 secondes)

La page Storage Supabase est déjà ouverte dans votre navigateur.

**OU ouvrez :** https://supabase.com/dashboard/project/qpbtmqgsnqnbkzxopaiv/storage/buckets

**Actions :**
1. Cliquez sur **"New bucket"**
2. Nom du bucket : `onboarding-files`
3. Cochez **"Public bucket"** ✅
4. Cliquez sur **"Create bucket"**

✅ Stockage de fichiers prêt !

---

## 🎯 C'EST PRÊT !

Votre app tourne sur : **http://localhost:8080**

### Accédez au système d'onboarding :

```
http://localhost:8080/onboarding
```

La page est déjà ouverte dans votre navigateur ! 🎉

---

## 📱 Utilisation

### Créer un onboarding

1. Cliquez sur **"Nouveau Onboarding"**
2. Remplissez :
   - Nom du client (obligatoire)
   - Votre nom (créé par)
   - Pré-remplissez les infos que vous connaissez (optionnel)
3. Cliquez **"Créer l'onboarding"**
4. **Copiez le lien** généré
5. Envoyez-le au client (WhatsApp, Email, SMS...)

### Le client remplit le formulaire

Le lien sera du type :
```
http://localhost:8080/onboarding/form/[UUID]
```

**Fonctionnalités client :**
- 🟡 Champs pré-remplis affichés en **orange** avec icône ℹ️
- 💾 Sauvegarde automatique toutes les **30 secondes**
- 📊 Barre de progression en temps réel
- 📱 Interface **100% responsive** (mobile-friendly)
- 📎 Upload de photos possible
- 🎨 10 sections en accordéon faciles à naviguer

### Exporter en PDF

Une fois le formulaire **complété à 100%** :
1. Le client clique sur **"Terminer"**
2. Vous êtes redirigé vers la page d'export
3. Cliquez sur **"Télécharger le PDF"**

**Le PDF contient :**
- Logo RaiseMed.IA en en-tête
- Toutes les 10 sections complétées
- Champs pré-remplis marqués en orange
- Mise en page professionnelle
- Pagination automatique

---

## 🎨 Les 10 Sections du Formulaire

1. **Informations légales** - SIRET, adresse, contacts
2. **Identité de marque** - Services, certifications, garanties
3. **Clientèle cible** - Types de clients, persona, saisonnalité
4. **Communication** - Ton, perception, valeurs
5. **Historique & Expérience** - Création, équipe, interventions
6. **Google Business Profile** - Établissement, horaires, description
7. **Visuels & Photos** - Upload de fichiers, méthode d'envoi
8. **Cartes NFC & Équipe** - Techniciens, formation
9. **Communication & Suivi** - Fréquence rapports, canal
10. **Validation finale** - Accords, dates de rendez-vous

---

## 📊 Statuts des Onboardings

- **🟦 draft** - Brouillon en cours
- **🟨 sent** - Envoyé au client
- **🟩 completed** - Formulaire complété
- **🟪 exported** - PDF généré

---

## 🛠️ Si besoin de réinstaller

```bash
# Script automatique
node scripts/install-onboarding.mjs

# Ou interface web
open scripts/auto-setup-onboarding.html
```

---

## 📚 Documentation

- **INSTALLATION_RAPIDE.md** - Guide d'installation
- **README_ONBOARDING.md** - Documentation complète
- **GUIDE_ONBOARDING.md** - Guide utilisateur détaillé
- **ONBOARDING_IMPLEMENTATION.md** - Documentation technique

---

## 🎯 Ce qui a été créé

### Pages (4)
- Liste des onboardings
- Création admin
- Formulaire client (public)
- Export PDF

### Composants (10 sections)
- Tous les composants de formulaire

### Librairies
- Types TypeScript complets
- Validation Zod
- Export PDF avec jsPDF

### Database
- Table `onboarding` avec RLS
- Bucket `onboarding-files` pour les fichiers

---

## 🚀 Prochaines étapes suggérées

Une fois que vous avez testé le système :

1. **Personnaliser** le PDF avec votre logo
2. **Ajuster** les sections selon vos besoins
3. **Configurer** l'envoi d'emails automatiques
4. **Créer** des templates d'onboarding

---

**Bon onboarding ! 🎉**

*Développé pour RaiseMed.IA - Octobre 2024*

