# Guide du Funnel d'Avis Personnalisable

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation](#installation)
3. [Configuration Étape 1 : Setup](#étape-1--setup)
4. [Configuration Étape 2 : Contenu et Flux](#étape-2--contenu-et-flux)
5. [Utilisation](#utilisation)
6. [Personnalisation avancée](#personnalisation-avancée)

---

## 🎯 Vue d'ensemble

Le système de **Funnel d'Avis Personnalisable** vous permet de créer une expérience unique de collecte d'avis pour chaque client. Contrairement au système standard, ce système offre une personnalisation complète :

### Fonctionnalités principales

✅ **Logo de l'entreprise** - Affichez le logo du client en haut de la page  
✅ **Nom d'entreprise personnalisable** - Montrez ou cachez le nom de l'entreprise  
✅ **Messages personnalisés** - Adaptez chaque texte selon votre client  
✅ **Seuil de filtrage ajustable** - Définissez à partir de quelle note filtrer les avis  
✅ **Multi-plateformes** - Demandez aux clients de laisser des avis sur plusieurs sites  
✅ **URL personnalisée** - Créez une URL mémorable pour le funnel  
✅ **Page de remerciement** - Personnalisez le message après soumission  

---

## 🛠 Installation

### Étape 1 : Appliquer la migration SQL

1. Ouvrez le **Supabase Dashboard** :  
   → [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. Sélectionnez votre projet

3. Allez dans **SQL Editor** (dans le menu latéral gauche)

4. Copiez et exécutez le contenu de :  
   `supabase/migrations/20251029120000_add_funnel_config.sql`

5. Cliquez sur **Run** pour exécuter la migration

### Étape 2 : Créer le bucket de stockage pour les logos

1. Dans le Supabase Dashboard, allez dans **Storage**

2. Cliquez sur **"New bucket"**

3. **Nom du bucket** : `client-logos`

4. **Public** : ✅ Activé (pour que les logos soient accessibles publiquement)

5. Cliquez sur **Create bucket**

6. Retournez dans **SQL Editor** et exécutez :

```sql
-- RLS Policies pour le bucket client-logos

-- SELECT policy (lecture publique)
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'client-logos');

-- INSERT policy (upload authentifié)
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-logos');

-- UPDATE policy (modification authentifiée)
CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'client-logos');

-- DELETE policy (suppression authentifiée)
CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'client-logos');
```

### Étape 3 : Redémarrer l'application

```bash
npm run dev
```

---

## ⚙️ Étape 1 : Setup

### Accès

1. Allez dans **Clients** → Sélectionnez un client
2. Cliquez sur **"Configuration Avis"**
3. Cliquez sur le bouton **"Funnel Personnalisé"** ✨

### Configuration

#### 1. Activation du Funnel

- **Activé** : Le funnel est actif et accessible via l'URL publique
- **Désactivé** : Le funnel n'est plus accessible (erreur 404)

#### 2. Seuil de Filtrage

Utilisez le **curseur** pour définir le seuil :

- **1 étoile** : Seuls les avis à 1 étoile sont négatifs (collectés en privé)
- **2 étoiles** : Avis à 1-2 étoiles = négatifs
- **3 étoiles** : Avis à 1-3 étoiles = négatifs
- **4 étoiles** : Avis à 1-4 étoiles = négatifs (recommandé)

**Exemple** :  
Si vous sélectionnez **≤ 4**, alors :
- 1-4 étoiles → Feedback privé
- 5 étoiles → Redirection publique (Google, etc.)

#### 3. Logo de l'Entreprise

**Upload du logo** :
- Cliquez sur la zone d'upload
- Sélectionnez un fichier PNG, JPG, SVG ou WEBP
- Max 2MB
- Le logo sera centré en haut de la page

**Affichage** :
- Activez/désactivez l'affichage du logo avec le switch

#### 4. Nom de l'Entreprise

- **Activé** : Le nom de l'entreprise s'affiche sous le logo
- **Désactivé** : Seul le titre personnalisé est visible

#### 5. URL Personnalisée

Personnalisez le slug de l'URL :

**Exemple** :
- Slug : `plomberie-martin`
- URL finale : `https://votre-domaine.com/review/plomberie-martin`

**Conseils** :
- Utilisez des tirets `-` plutôt que des espaces
- Gardez-le court et mémorable
- Évitez les caractères spéciaux

---

## 📝 Étape 2 : Contenu et Flux

### 1. Page d'Évaluation Initiale

**Titre** (modifiable) :
- Par défaut : "Comment nous évalueriez-vous ?"
- Exemple : "Votre avis nous intéresse !"

**Description** (modifiable) :
- Par défaut : "Merci de prendre un moment pour évaluer votre expérience..."
- Personnalisez selon le ton de votre client

### 2. Configuration des Avis Négatifs

**Titre** :
- Par défaut : "Aidez-nous à nous améliorer"
- Exemple : "Nous sommes désolés"

**Description** :
- Message affiché aux clients insatisfaits
- Ton empathique recommandé

**Placeholder du commentaire** :
- Texte dans la zone de texte
- Exemple : "Dites-nous ce qui s'est passé..."

**Texte du bouton** :
- Par défaut : "Envoyer mon retour"
- Exemple : "Partager mon expérience"

**Champs requis** :
- ☑️ **Nom obligatoire** : Le client doit entrer son nom
- ☑️ **Email obligatoire** : Le client doit entrer son email
- ☑️ **Téléphone obligatoire** : Le client doit entrer son téléphone

### 3. Configuration des Avis Positifs

**Plateformes disponibles** :
- Google ⭐ (recommandé)
- Pages Jaunes
- Trustpilot
- TripAdvisor
- Facebook
- Yelp

**Pour chaque plateforme** :
1. Activez/désactivez avec le switch
2. Entrez l'URL de redirection

**Plateforme principale** :
- C'est la plateforme par défaut si une seule redirection est activée
- Sélectionnez parmi les plateformes actives

### 4. Sélection Multi-Plateformes

**Activer la sélection multi-plateformes** :
- ✅ **Activé** : Affiche une page intermédiaire où le client choisit les plateformes
- ❌ **Désactivé** : Redirection directe vers la plateforme principale

**Titre** :
- Par défaut : "Partagez votre expérience"

**Description** :
- Message pour encourager le partage
- Exemple : "Votre avis compte ! Choisissez où partager..."

**Nombre minimum de plateformes** :
- Définissez combien de plateformes le client doit au minimum sélectionner
- Recommandé : 1

### 5. Page de Remerciement

**Titre** :
- Par défaut : "Merci pour votre retour"
- Exemple : "Nous avons reçu votre message !"

**Message** :
- Par défaut : "Votre retour a été reçu et un membre de notre équipe support client vous contactera sous peu."
- Personnalisez selon votre processus

**Affichage** :
- ☑️ Afficher le logo
- ☑️ Afficher le nom de l'entreprise

---

## 🚀 Utilisation

### Créer un lien de collecte d'avis

Il existe **2 façons** d'accéder au funnel :

#### Option 1 : Via un employé (avec tracking)

1. Créez un employé dans **"Employés"**
2. Générez son QR code/lien unique
3. Le lien sera : `https://votre-domaine.com/scan/:employeeId`
4. Ce lien trackera les scans ET redirigera vers le funnel

#### Option 2 : Lien direct (sans tracking employé)

Utilisez l'URL personnalisée :
```
https://votre-domaine.com/review/:custom-slug
```

**Exemple** :
```
https://votre-domaine.com/review/plomberie-martin
```

### Prévisualiser le funnel

1. Dans **"Contenu et flux"**, cliquez sur **"Prévisualiser"** 👁️
2. Une nouvelle fenêtre s'ouvre avec le funnel
3. Mode prévisualisation = **aucune donnée enregistrée**

### Parcours client

#### Scénario 1 : Avis Négatif (≤ seuil)

1. Client scanne le QR ou clique sur le lien
2. Voit le logo + nom d'entreprise (si activés)
3. Sélectionne 1-4 étoiles (si seuil = 4)
4. **Reste sur la même page**
5. Voit le formulaire de feedback (titre, description personnalisés)
6. Remplit les champs (nom, email, téléphone selon config)
7. Entre son commentaire
8. Clique sur "Envoyer mon retour"
9. **Page de remerciement** s'affiche

#### Scénario 2 : Avis Positif (> seuil) - Mode Simple

1. Client scanne le QR ou clique sur le lien
2. Voit le logo + nom d'entreprise
3. Sélectionne 5 étoiles (si seuil = 4)
4. **Redirection automatique** vers la plateforme principale (ex: Google)

#### Scénario 3 : Avis Positif - Mode Multi-Plateformes

1. Client scanne le QR ou clique sur le lien
2. Voit le logo + nom d'entreprise
3. Sélectionne 5 étoiles
4. **Page intermédiaire** : "Partagez votre expérience"
5. Liste des plateformes activées (Google, Pages Jaunes, etc.)
6. Sélectionne les plateformes (avec checkbox)
7. Clique sur "Continuer"
8. **Redirection** vers la première plateforme sélectionnée

---

## 🎨 Personnalisation avancée

### Couleurs et thème (futur)

Le système est préparé pour supporter des couleurs personnalisées :
- Couleur primaire
- Couleur secondaire
- Couleur des étoiles
- Couleur du texte
- Couleur de fond

**Note** : Cette fonctionnalité sera ajoutée dans une future mise à jour.

### Notifications

**Emails de notification** :
- Entrez une liste d'emails pour recevoir les avis négatifs
- Séparés par des virgules
- Exemple : `contact@entreprise.fr, support@entreprise.fr`

**Webhook** :
- Configurez un webhook pour envoyer les avis négatifs à un service tiers
- Compatible avec Slack, Make, Zapier, etc.

---

## 📊 Rapports et Analytics

### Avis Négatifs

Accédez à tous les avis négatifs depuis :  
**Clients** → Sélectionner client → **"Avis Négatifs"**

**Informations disponibles** :
- Note (1-5 étoiles)
- Commentaire
- Nom, email, téléphone du client
- Date de soumission
- Employé concerné (si via QR)
- Statut (Nouveau, Lu, En cours, Résolu, Archivé)

### Scans et Redirections

Consultez les rapports de scans :  
**Clients** → Sélectionner client → **"Rapports"**

**Données disponibles** :
- Nombre de scans par employé
- Scans par jour
- Scans par heure
- Redirections vers plateformes
- Taux de conversion

---

## 🔧 Dépannage

### Le logo ne s'affiche pas

1. Vérifiez que le bucket `client-logos` est **public**
2. Vérifiez les RLS policies dans Supabase
3. Testez l'URL du logo directement dans le navigateur

### Le funnel affiche "Page non disponible"

1. Vérifiez que le funnel est **activé** dans Setup
2. Vérifiez que la migration a bien été appliquée
3. Vérifiez que le `client_id` dans l'URL est correct

### Les avis ne sont pas enregistrés

1. Vérifiez les RLS policies de la table `negative_reviews`
2. Ouvrez la console développeur (F12) pour voir les erreurs
3. Vérifiez que vous n'êtes pas en mode prévisualisation

### L'URL personnalisée ne fonctionne pas

1. Vérifiez que le slug est unique (pas utilisé par un autre client)
2. Utilisez uniquement des caractères alphanumériques et tirets
3. Sauvegardez bien la configuration

---

## 🎯 Bonnes pratiques

### Design
- ✅ Uploadez un logo de haute qualité (PNG avec fond transparent recommandé)
- ✅ Gardez les messages courts et clairs
- ✅ Testez sur mobile ET desktop
- ✅ Prévisualisez avant de partager

### Messages
- ✅ Ton empathique pour les avis négatifs
- ✅ Ton enthousiaste pour les avis positifs
- ✅ Évitez le jargon technique
- ✅ Personnalisez selon le secteur du client

### Seuil
- ✅ **4 étoiles** est le seuil recommandé
- ✅ Ne mettez pas un seuil trop bas (sinon trop d'avis négatifs publics)
- ✅ Ne mettez pas un seuil trop haut (sinon peu de redirections)

### Multi-plateformes
- ✅ Activez uniquement si vous voulez vraiment multiplier les avis
- ✅ Configurez au moins 2-3 plateformes
- ✅ Testez que toutes les URLs fonctionnent

---

## 🆘 Support

Pour toute question ou problème :
1. Consultez d'abord ce guide
2. Vérifiez les logs dans la console développeur
3. Contactez le support technique

---

**Version** : 1.0  
**Dernière mise à jour** : 29 octobre 2025


