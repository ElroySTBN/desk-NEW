# 🚀 Installation Rapide - Système d'Onboarding

## ✅ Ce qui a été fait automatiquement

- ✅ Toutes les pages et composants créés
- ✅ Routes configurées dans l'application
- ✅ Navigation ajoutée au menu
- ✅ Types TypeScript générés
- ✅ Validation Zod configurée
- ✅ Export PDF implémenté
- ✅ SQL copié dans votre presse-papiers
- ✅ SQL Editor ouvert dans votre navigateur

## 📝 2 actions rapides pour finaliser (< 30 secondes)

### 1. Appliquer le SQL (10 secondes)

Le SQL Editor de Supabase est déjà ouvert dans votre navigateur.

**Action :** 
- Collez le SQL (déjà dans votre presse-papiers : `Cmd+V`)
- Cliquez sur le bouton **"Run"** en haut à droite

✅ C'est tout ! La table `onboarding` est créée avec toutes les politiques RLS.

### 2. Créer le bucket de stockage (20 secondes)

La page Storage est également ouverte dans votre navigateur.

**Actions :**
1. Cliquez sur **"New bucket"**
2. Nom du bucket : `onboarding-files`
3. Cochez **"Public bucket"** ✅
4. Cliquez sur **"Create bucket"**

✅ Terminé ! Le stockage de fichiers est prêt.

## 🎉 C'est fini !

Vous pouvez maintenant :

```bash
npm run dev
```

Puis allez sur : **http://localhost:5173/onboarding**

## 📖 Utilisation

### Créer un onboarding

1. Cliquez sur **"Nouveau Onboarding"**
2. Entrez le nom du client
3. Pré-remplissez les informations que vous connaissez
4. Cliquez sur **"Créer l'onboarding"**
5. Copiez le lien généré
6. Envoyez-le au client (WhatsApp, Email, SMS...)

### Le client remplit le formulaire

- Le lien est accessible sur mobile et desktop
- Les champs pré-remplis sont **en orange** avec ℹ️
- Sauvegarde automatique toutes les 30 secondes
- Barre de progression en temps réel
- Upload de photos possible

### Exporter en PDF

Une fois le formulaire complété (100%) :
- Cliquez sur **"Terminer"**
- Puis **"Télécharger le PDF"**
- PDF professionnel avec logo RaiseMed.IA

## 🛠️ Scripts disponibles

```bash
# Installation automatique (déjà fait)
node scripts/install-onboarding.mjs

# Ou interface web
open scripts/auto-setup-onboarding.html
```

## 📚 Documentation complète

- **GUIDE_ONBOARDING.md** - Guide détaillé d'utilisation
- **ONBOARDING_IMPLEMENTATION.md** - Documentation technique

## ❓ Besoin d'aide ?

Consultez les guides ou contactez le support.

---

**Développé avec ❤️ pour RaiseMed.IA**

