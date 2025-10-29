# 🚀 Démarrage Rapide - Système d'Avis

> **Guide de 5 minutes pour mettre en place votre système de collecte d'avis**

---

## ⚡ Installation en 3 étapes

### 1️⃣ Appliquer la migration SQL (2 min)

1. Allez sur **Supabase Dashboard**
2. Cliquez sur **SQL Editor**
3. Copiez-collez le contenu de :
   ```
   supabase/migrations/20251029000000_create_review_system.sql
   ```
4. Cliquez sur **Run** ✅

### 2️⃣ Créer votre premier employé (1 min)

1. Dans l'app, allez sur **Clients**
2. Sélectionnez un client
3. Cliquez sur **"Employés"** (ou allez sur `/clients/:id/employees`)
4. Cliquez sur **"Ajouter un employé"**
5. Entrez le nom : **"Jean Dupont"**
6. Cliquez sur **"Créer"** ✅

### 3️⃣ Configurer le funnel d'avis (2 min)

1. Depuis la fiche client, cliquez sur **"Avis"**
2. Activez le système avec le **switch**
3. **Seuil** : Laissez "4 étoiles" (recommandé)
4. **Google** : Activez et collez votre URL Google Business :
   ```
   https://g.page/r/VOTRE_ID/review
   ```
5. **Email** : Ajoutez votre email pour recevoir les avis négatifs
6. Cliquez sur **"Enregistrer"** ✅

---

## 🎯 Utilisation immédiate

### Générer le QR code

1. Retournez sur la page **Employés**
2. Cliquez sur l'icône **QR Code** à côté de Jean
3. Cliquez sur **"Télécharger"**
4. **Imprimez** le QR code (ou affichez-le sur votre téléphone)

### Tester le système

1. Scannez le QR code avec votre téléphone
2. Vous êtes redirigé vers le funnel d'avis
3. Donnez une note de **5 étoiles** ⭐⭐⭐⭐⭐
4. Vous êtes redirigé vers Google !

---

## 📊 Voir les résultats

### Rapports de scans

1. Allez sur **Clients** > Votre client > **"Rapports"**
2. Vous voyez :
   - Total de scans
   - Stats par employé
   - Détails par jour et heure

### Avis négatifs

1. Allez sur **Clients** > Votre client > **"Avis négatifs"**
2. Vous voyez tous les avis < 4 étoiles collectés en privé

---

## 🎓 Prochaines étapes

1. **Ajoutez tous vos employés**
2. **Commandez des cartes NFC** avec les QR codes
3. **Formez votre équipe** à demander des avis après chaque intervention
4. **Consultez les rapports mensuels** pour récompenser les meilleurs

---

## 📚 Documentation complète

Consultez **GUIDE_SYSTEME_AVIS.md** pour :
- Toutes les fonctionnalités détaillées
- Cas d'usage avancés
- Bonnes pratiques
- FAQ

---

**C'est tout ! Vous êtes prêt à collecter des avis 🚀**

