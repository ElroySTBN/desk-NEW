# Instructions : Correction du système de rapports GBP

## 📋 Vue d'ensemble

Ce guide vous explique comment corriger le problème "Bucket not found" et configurer correctement le système de rapports GBP.

## 🎯 Problèmes à résoudre

1. **Erreur "Bucket not found"** : Le bucket `gbp-reports` est privé, donc les URLs ne fonctionnent pas
2. **Pas d'interface pour configurer les zones** : Maintenant résolu avec le composant `TemplateZoneConfigurator`

## ✅ Étape 1 : Appliquer la migration SQL principale

### 1.1 Ouvrir Supabase Dashboard

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (menu de gauche)

### 1.2 Exécuter la migration principale

1. Cliquez sur **"New query"**
2. Copiez-collez le contenu du fichier `supabase/migrations/20250105000006_make_gbp_reports_public.sql`
3. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter` / `Cmd+Enter`)

**Ce que fait cette migration :**
- Met à jour le bucket `gbp-reports` pour le rendre public (`public: true`)
- Crée le bucket s'il n'existe pas déjà
- Ne touche pas aux politiques (pour éviter les problèmes de privilèges)

### 1.3 Vérifier que la migration a réussi

Vous devriez voir un message de succès. Le bucket `gbp-reports` est maintenant public.

## ✅ Étape 2 : Créer la politique publique (IMPORTANT)

### 2.1 Exécuter le script SQL pour la politique publique

1. Dans le **SQL Editor** de Supabase, créez une nouvelle query
2. Copiez-collez le contenu du fichier `supabase/ADD_PUBLIC_POLICY_GBP_REPORTS.sql`
3. Cliquez sur **"Run"**

**Ce que fait ce script :**
- Supprime l'ancienne politique privée "Users can view their own GBP reports" (si elle existe)
- Crée la nouvelle politique publique "Public can view GBP reports"
- Permet à tous les utilisateurs (même non authentifiés) de lire les rapports PDF

### 2.2 Vérifier que la politique a été créée

1. Allez dans **Storage** (menu de gauche)
2. Cliquez sur **"Policies"**
3. Sélectionnez le bucket `gbp-reports`
4. Vous devriez voir la politique "Public can view GBP reports" avec l'opération `SELECT` et le rôle `public`

## ✅ Étape 3 : Configurer le template dans l'application

### 3.1 Créer ou modifier un template par défaut

1. Allez dans votre application
2. Allez dans **Paramètres** (Settings)
3. Cliquez sur l'onglet **"Templates Rapports GBP"**
4. Si vous n'avez pas de template par défaut, cliquez sur **"Créer template par défaut"**
5. Si vous en avez déjà un, cliquez sur **"Modifier"**

### 3.2 Uploader le template PDF

1. Dans le dialog d'édition, allez dans l'onglet **"Template"**
2. Cliquez sur **"Sélectionner un template (PDF ou image)"**
3. Sélectionnez votre fichier PDF de template (celui que vous avez créé sur Canva)
4. Attendez que l'upload soit terminé
5. Vous verrez un message de succès avec une instruction pour configurer les zones

### 3.3 Configurer les zones du template

1. Dans le dialog d'édition, allez dans l'onglet **"Zones"**
2. Vous verrez une interface pour configurer visuellement les zones

#### Pour la page 1 (Couverture - Logo) :

1. Dans le sélecteur de page, sélectionnez **"Page 1 - Couverture (Logo)"**
2. Cliquez sur **"Configurer le logo"**
3. Sur l'image du template affichée, cliquez et glissez pour dessiner une zone où le logo du client sera placé
4. La zone sera automatiquement sauvegardée

#### Pour les pages 2-5 (Catégories) :

Pour chaque page (Vue d'ensemble, Appels, Clics web, Itinéraire) :

1. Sélectionnez la page dans le sélecteur (par exemple "Page 2 - Vue d'ensemble")
2. Cliquez sur **"Configurer le screenshot"**
3. Dessinez une zone sur le template où le screenshot sera placé
4. Cliquez sur **"Configurer le texte"**
5. Dessinez une zone sur le template où le texte d'analyse sera placé

**Note :** Les zones OCR sont configurées automatiquement via les paramètres par défaut. Vous pouvez les modifier plus tard si nécessaire.

### 3.4 Configurer les templates de textes (optionnel)

1. Dans le dialog d'édition, allez dans l'onglet **"Templates de textes"**
2. Pour chaque catégorie (Vue d'ensemble, Appels, Clics web, Itinéraire), configurez :
   - Texte si évolution positive élevée (> 10%)
   - Texte si évolution positive modérée (0-10%)
   - Texte si évolution stable (-10% à 10%)
   - Texte si évolution négative modérée (-10% à 0%)
   - Texte si évolution négative élevée (< -10%)
3. Utilisez des variables comme `{current}`, `{previous}`, `{difference}`, `{percentage}`, etc.

### 3.5 Sauvegarder le template

1. Cliquez sur **"Enregistrer"** en bas du dialog
2. Vérifiez qu'il n'y a pas d'erreurs
3. Le template est maintenant configuré et prêt à être utilisé

## ✅ Étape 4 : Générer un rapport de test

### 4.1 Créer un nouveau rapport

1. Allez dans **Rapports** > **GBP**
2. Cliquez sur **"Générer un rapport"** (ou **"Créer un rapport"**)
3. Sélectionnez un client dans la liste
4. Sélectionnez le mois et l'année
5. Cliquez sur **"Suivant"**

### 4.2 Uploader les screenshots

1. Pour chaque catégorie (Vue d'ensemble, Appels, Clics web, Itinéraire), cliquez sur **"Sélectionner un fichier"**
2. Sélectionnez les screenshots de votre dashboard Google Business Profile
3. Si vous avez activé l'extraction OCR automatique, les valeurs seront extraites automatiquement
4. Sinon, vous pouvez saisir les valeurs manuellement

### 4.3 Générer le rapport

1. Cliquez sur **"Générer le PDF"**
2. Attendez que le rapport soit généré
3. Vous serez redirigé vers la liste des rapports

### 4.4 Vérifier que le rapport fonctionne

1. Dans la liste des rapports, trouvez le rapport que vous venez de créer
2. Cliquez sur l'icône **"Voir"** (👁️) pour visualiser le rapport
3. Le rapport devrait s'ouvrir dans un nouvel onglet sans erreur "Bucket not found"
4. Cliquez sur l'icône **"Télécharger"** (⬇️) pour télécharger le rapport
5. Le téléchargement devrait fonctionner sans erreur

## 🔍 Vérification finale

### Vérifier que tout fonctionne :

- ✅ Le bucket `gbp-reports` est public dans Supabase Storage
- ✅ La politique "Public can view GBP reports" existe et est active
- ✅ Le template est configuré avec les zones (logo, screenshots, textes)
- ✅ Un rapport peut être généré sans erreur
- ✅ Le rapport peut être visualisé dans le navigateur
- ✅ Le rapport peut être téléchargé

## ❌ En cas d'erreur

### Erreur "Bucket not found" persiste :

1. Vérifiez que le bucket `gbp-reports` est bien public dans Supabase Storage
2. Vérifiez que la politique "Public can view GBP reports" existe
3. Vérifiez que l'URL du rapport commence par `https://[votre-projet].supabase.co/storage/v1/object/public/gbp-reports/`
4. Si l'URL ne contient pas `/public/`, c'est que le bucket n'est pas public

### Erreur lors de la création de la politique :

1. Vérifiez que vous êtes connecté à Supabase avec un compte ayant les privilèges administrateur
2. Exécutez le script SQL manuellement dans le SQL Editor
3. Si l'erreur persiste, créez la politique via l'interface Supabase Storage > Policies

### Le template ne s'affiche pas dans l'onglet "Zones" :

1. Vérifiez que vous avez bien uploadé le template dans l'onglet "Template"
2. Vérifiez que le template est bien sauvegardé
3. Rechargez la page et réessayez

## 📝 Notes importantes

- **Le bucket doit être public** pour que les URLs fonctionnent
- **La politique publique doit exister** pour permettre la lecture des rapports
- **Les zones du template doivent être configurées** pour que le rapport soit généré correctement
- **Les templates de textes sont optionnels** mais recommandés pour personnaliser les analyses

## 🎉 Résultat attendu

Après avoir suivi toutes ces étapes, vous devriez avoir :

1. Un bucket `gbp-reports` public et fonctionnel
2. Une politique publique permettant la lecture des rapports
3. Un template configuré avec toutes les zones nécessaires
4. Des rapports qui peuvent être générés, visualisés et téléchargés sans erreur

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :

1. Les logs dans la console du navigateur (F12)
2. Les logs dans Supabase Dashboard > Logs
3. Les politiques dans Supabase Storage > Policies

---

**Date de création :** 2025-01-05
**Version :** 1.0

