# 📊 Guide du Système de Gestion des Avis et Tracking

> **Système complet de collecte d'avis et de suivi des performances des employés**

---

## 🎯 Vue d'ensemble

Ce système vous permet de :

1. **Gérer vos employés/commerciaux** avec des liens et QR codes uniques
2. **Tracker les scans** de cartes NFC/QR codes pour mesurer les performances
3. **Collecter les avis négatifs en privé** avant qu'ils n'aillent sur Google
4. **Rediriger les avis positifs** vers vos plateformes d'avis publiques
5. **Générer des rapports mensuels** pour récompenser les meilleurs employés

---

## 📋 Table des matières

1. [Installation et Configuration](#installation-et-configuration)
2. [Gestion des Employés](#gestion-des-employés)
3. [Configuration du Funnel d'Avis](#configuration-du-funnel-davis)
4. [Rapports de Scans](#rapports-de-scans)
5. [Avis Négatifs](#avis-négatifs)
6. [Utilisation Publique](#utilisation-publique)

---

## 🚀 Installation et Configuration

### 1. Appliquer les migrations SQL

Allez dans **Supabase Dashboard** > **SQL Editor** et exécutez le fichier :

```
supabase/migrations/20251029000000_create_review_system.sql
```

Cela va créer :
- ✅ Table `employees`
- ✅ Table `scan_tracking`
- ✅ Table `review_settings`
- ✅ Table `negative_reviews`
- ✅ Table `positive_review_redirects`
- ✅ Vues et fonctions pour les rapports

### 2. Vérifier les permissions (RLS)

Les permissions sont automatiquement configurées :
- **Admin** : Accès complet à toutes les tables
- **Public (anonyme)** : 
  - ✅ Peut créer des scans (`scan_tracking`)
  - ✅ Peut créer des avis négatifs (`negative_reviews`)
  - ✅ Peut lire les paramètres actifs (`review_settings`)

---

## 👥 Gestion des Employés

### Accès
**Clients** > **Sélectionner un client** > **Bouton "Employés"** dans la fiche client

Ou directement : `/clients/:id/employees`

### Fonctionnalités

#### ➕ Ajouter un employé

1. Cliquez sur **"Ajouter un employé"**
2. Remplissez :
   - **Nom** (obligatoire)
   - Poste (optionnel)
   - Email (optionnel)
   - Téléphone (optionnel)
   - Notes (optionnel)
3. Cliquez sur **"Créer"**

✅ **Un lien unique et un QR code sont générés automatiquement !**

#### 📱 Générer le QR code

1. Cliquez sur l'icône **QR Code** dans la ligne de l'employé
2. Le QR code s'affiche dans une popup
3. Options :
   - **Copier le lien** : Pour l'envoyer par email/SMS
   - **Télécharger** : Pour l'imprimer sur une carte NFC

#### 🔗 Copier le lien unique

Cliquez sur l'icône **Lien** pour copier l'URL de tracking :

```
https://votre-domaine.com/scan/uuid-unique-employé
```

#### 🔄 Régénérer le lien

Si un employé quitte l'entreprise ou si le lien est compromis :

1. Cliquez sur l'icône **Régénérer**
2. Confirmez
3. ✅ **Nouveau lien généré (l'ancien ne fonctionne plus)**

#### 🔴 Désactiver un employé

Utilisez le **switch** pour activer/désactiver :
- **Actif** ✅ : Le lien fonctionne
- **Inactif** ❌ : Le lien est désactivé (scans bloqués)

---

## ⚙️ Configuration du Funnel d'Avis

### Accès
**Clients** > **Sélectionner un client** > **Bouton "Avis"** dans la fiche client

Ou directement : `/clients/:id/review-settings`

### Étape 1 : Activation

Activez le système avec le **switch** en haut de la page.

### Étape 2 : Seuil d'avis positif

Définissez le **score minimum** pour considérer un avis comme positif :

- **3 étoiles** : Seuil bas (3-4-5 = positif)
- **4 étoiles** ⭐ **(recommandé)** : Seuil standard
- **5 étoiles** : Seuil strict (seulement 5 = positif)

💡 **Logique** :
- Avis **≥ seuil** → Redirection vers plateforme publique
- Avis **< seuil** → Collecte en privé

### Étape 3 : Plateformes d'avis

Configurez les plateformes où rediriger les avis positifs :

#### Google Business Profile ⭐

1. Activez le switch
2. Entrez l'URL de votre profil Google :

```
https://g.page/r/VOTRE_ID_GOOGLE/review
```

📝 **Comment trouver votre URL ?**

1. Allez sur votre profil Google Business
2. Cliquez sur "Demander des avis"
3. Copiez le lien généré

#### Pages Jaunes, Trustpilot, TripAdvisor

Même principe : activez et collez l'URL de votre profil.

#### Plateforme personnalisée

Activez et définissez :
- **Nom** : Ex: "Notre site web"
- **URL** : Ex: `https://monsite.com/avis`

### Étape 4 : Plateforme par défaut

Sélectionnez la plateforme principale pour les redirections.

### Étape 5 : Messages personnalisés

#### Message avis positif

Exemple :
```
Merci pour votre retour positif ! 
Pourriez-vous partager votre expérience sur Google ?
```

#### Message avis négatif

Exemple :
```
Nous sommes désolés que votre expérience n'ait pas été à la hauteur.
Aidez-nous à nous améliorer en nous partageant votre retour.
```

### Étape 6 : Notifications par email

Ajoutez les **emails** qui recevront les avis négatifs :

```
contact@monentreprise.com
manager@monentreprise.com
```

💡 **Vous pouvez ajouter plusieurs emails !**

### Étape 7 : Options de collecte

- **Collecter les informations du client** : Nom, email, téléphone
- **Email obligatoire** : Forcer le client à donner son email

### ✅ Enregistrer

Cliquez sur **"Enregistrer"** en bas de la page.

---

## 📈 Rapports de Scans

### Accès
**Clients** > **Sélectionner un client** > **Bouton "Rapports"** dans la fiche client

Ou directement : `/clients/:id/scan-reports`

### Filtres

#### Par employé

- **Tous les employés** : Vue globale de l'équipe
- **Employé spécifique** : Stats détaillées d'un employé

#### Par période

Sélectionnez un mois (12 derniers mois disponibles).

### Statistiques affichées

#### Vue globale (Tous les employés)

- **Total scans** : Nombre total de scans sur la période
- **Employés actifs** : Nombre d'employés avec au moins 1 scan
- **Top 5 Performers** 🏆 : Classement des meilleurs employés

#### Vue employé individuel

- **Total scans** : Nombre total pour cet employé
- **Moyenne / jour** : Scans moyens par jour
- **Jour le + actif** 📅 : Meilleur jour
- **Heure la + active** ⏰ : Meilleure heure

### Détails par jour

Tableau avec :
- Date complète (ex: "Lundi 15 octobre")
- Nombre de scans
- Heures actives (ex: "14h, 16h, 18h")

### Distribution horaire (Vue employé)

Grille 24h montrant le nombre de scans par heure.

💡 **Utile pour identifier les moments de forte activité !**

### 📥 Export PDF

Cliquez sur **"Exporter en PDF"** pour générer un rapport mensuel.

---

## 😞 Avis Négatifs

### Accès
**Clients** > **Sélectionner un client** > **Bouton "Avis négatifs"** dans la fiche client

Ou directement : `/clients/:id/negative-reviews`

### Vue d'ensemble

Statistiques en haut :
- **Total** : Nombre total d'avis négatifs
- **Nouveaux** 🔴 : Avis non lus
- **En cours** ⏳ : Avis en traitement
- **Résolus** ✅ : Avis traités
- **Note moyenne** : Moyenne des avis négatifs

### Filtrer les avis

Utilisez le menu déroulant pour filtrer par statut :
- Tous
- Nouveaux
- Lus
- En cours
- Résolus
- Archivés

### Gérer un avis

1. Cliquez sur **"Voir"** dans la ligne d'un avis
2. La popup affiche :
   - **Note** (1-5 étoiles)
   - **Commentaire** du client
   - **Informations** : Nom, email, téléphone
   - **Employé** concerné
   - **Date** et heure

### Répondre à un avis

1. Ouvrez un avis
2. Changez le **statut** (ex: "En cours")
3. Rédigez votre **réponse** dans le champ texte
4. Cliquez sur **"Enregistrer la réponse"**

✅ **La date de réponse est enregistrée automatiquement**

### Statuts disponibles

- **Nouveau** 🔴 : Avis non lu (s'affiche en rouge)
- **Lu** 👁️ : Avis consulté
- **En cours** ⏳ : Traitement en cours
- **Résolu** ✅ : Problème résolu
- **Archivé** 📦 : Classé

---

## 🌐 Utilisation Publique

### Parcours d'un client

#### 1. Scan du QR code / Carte NFC

Le client scanne le QR code ou touche la carte NFC.

```
Scan → https://votre-domaine.com/scan/uuid-employé
```

⚙️ **En arrière-plan** :
- Tracking automatique (date, heure, appareil, employé)
- Redirection vers le funnel d'avis

#### 2. Page de notation

Le client voit :
- **Titre** : "Votre avis compte ! ⭐"
- **5 étoiles** cliquables
- **Texte** : "Comment évalueriez-vous votre expérience ?"

💡 **Affichage dynamique** :
- Survol → Emoji + texte (ex: "😊 Satisfait")

#### 3A. Avis négatif (< seuil)

Si note < seuil (ex: 1-3 étoiles) :

1. **Message** : "Nous sommes désolés 😔" + message personnalisé
2. **Formulaire** :
   - Nom (optionnel)
   - Email (obligatoire si configuré)
   - Téléphone (optionnel)
   - Commentaire (optionnel)
3. **Bouton** : "Envoyer mon retour"

✅ **L'avis est enregistré en privé** (vous recevez un email)

#### 3B. Avis positif (≥ seuil)

Si note ≥ seuil (ex: 4-5 étoiles) :

1. **Message** : "Merci beaucoup ! 🎉" + message personnalisé
2. **Bouton** : "Laisser un avis sur Google" (ou autre plateforme)

💡 **Le client peut cliquer ou ignorer**

✅ **Si clic → Redirection** vers Google/autre plateforme

#### 4. Page de remerciement

Quelle que soit l'issue :

- **Icône** : ✅ Vert
- **Titre** : "Merci ! 🙏"
- **Message** personnalisé selon le type d'avis
- **Footer** : "Propulsé par RaiseMed.IA"

### URLs publiques

#### Lien de scan
```
https://votre-domaine.com/scan/[UUID-EMPLOYÉ]
```

#### Funnel d'avis direct
```
https://votre-domaine.com/review/[ID-CLIENT]
```

💡 **Vous pouvez partager ce lien directement par email/SMS si besoin**

---

## 🎯 Cas d'usage : Workflow complet

### Scénario : Plombier avec 3 techniciens

#### 1. Configuration initiale

1. **Créer les 3 employés** :
   - Jean (Plombier senior)
   - Marc (Plombier junior)
   - Sophie (Apprentie)

2. **Générer les QR codes** et les imprimer sur 3 cartes NFC

3. **Configurer le funnel** :
   - Seuil : 4 étoiles
   - Plateforme : Google Business Profile
   - Email : `contact@plomberie-dupont.fr`

#### 2. Utilisation sur le terrain

Chaque technicien, **après une intervention** :

1. Donne sa carte NFC au client
2. Lui demande de scanner pour donner son avis
3. Le client scanne → Tracking automatique ✅

#### 3. Collecte des avis

- **Client satisfait (5 étoiles)** → Redirigé vers Google ⭐
- **Client insatisfait (2 étoiles)** → Avis collecté en privé 📩

Vous recevez un email :

```
Nouvel avis négatif - 2/5 étoiles

Client : Mme Martin
Email : martin@example.com
Commentaire : "Fuite toujours pas résolue"
Technicien : Jean
Date : 29 oct. 2025 à 14h30
```

#### 4. Traitement

1. Ouvrez l'avis dans l'interface
2. Passez le statut en **"En cours"**
3. Contactez Mme Martin
4. Résolvez le problème
5. Rédigez votre réponse :

```
Bonjour Mme Martin,
Nous sommes désolés pour ce désagrément. 
Jean est repassé chez vous le 30 octobre et a résolu le problème.
Nous vous offrons une remise de 20% sur votre prochaine intervention.
Cordialement,
```

6. Passez le statut en **"Résolu"** ✅

#### 5. Rapport mensuel (fin de mois)

1. Allez dans **Rapports de scans**
2. Sélectionnez **"Octobre 2025"**
3. Consultez le classement :

```
🥇 Jean : 45 scans
🥈 Sophie : 38 scans
🥉 Marc : 32 scans
```

4. **Exportez le PDF** pour la réunion d'équipe
5. **Récompensez Jean** pour ses performances 🏆

---

## 🔧 Paramètres Avancés

### Modifier la destination d'un lien (à distance)

Si un employé quitte l'entreprise :

1. Allez dans **Employés**
2. Cliquez sur **Régénérer le lien**
3. L'ancien lien est désactivé ❌
4. Nouveau lien généré ✅

💡 **Vous pouvez aussi simplement désactiver l'employé**

### Webhooks Slack (optionnel)

Dans **Configuration des avis** :

1. Créez un webhook Slack
2. Collez l'URL dans le champ **"Slack webhook"**
3. ✅ Vous recevrez les avis négatifs dans Slack en temps réel

### Plusieurs emails de notification

Ajoutez autant d'emails que nécessaire :

```
manager@entreprise.com
sav@entreprise.com
direction@entreprise.com
```

Tous recevront les notifications d'avis négatifs.

---

## 📊 Données collectées (RGPD)

### Données de tracking (scan)

- Date et heure du scan
- Type d'appareil (mobile/tablet/desktop)
- Employé scanné
- Client concerné

### Données d'avis négatif

- Note (1-5)
- Commentaire (optionnel)
- Nom du client (optionnel)
- Email du client (optionnel si configuré)
- Téléphone du client (optionnel)

### Données d'avis positif

- Note (1-5)
- Plateforme de redirection
- Date et heure

💡 **Aucune donnée personnelle n'est stockée pour les avis positifs (anonyme)**

---

## 🛠️ Maintenance

### Nettoyer les anciens scans

Les scans sont conservés indéfiniment pour les statistiques.

Si vous voulez les supprimer (ex: > 2 ans) :

```sql
DELETE FROM scan_tracking 
WHERE scanned_at < NOW() - INTERVAL '2 years';
```

### Archiver les avis résolus

Passez les avis résolus en **"Archivé"** pour les masquer de la vue principale.

### Régénérer tous les QR codes

Si vous changez de domaine :

1. Allez dans **Employés**
2. Pour chaque employé, cliquez sur **Régénérer**
3. Téléchargez les nouveaux QR codes

---

## ❓ FAQ

### Combien d'employés puis-je ajouter ?

Illimité ! Ajoutez autant d'employés que nécessaire.

### Les liens ont une date d'expiration ?

Non, les liens sont permanents (sauf si vous les régénérez).

### Puis-je personnaliser le design du funnel ?

Oui, en modifiant le fichier `src/pages/ReviewFunnel.tsx`.

### Les scans fonctionnent hors ligne ?

Non, une connexion internet est nécessaire pour le tracking.

### Puis-je importer des employés en masse ?

Pas encore, mais vous pouvez le faire via l'API Supabase directement.

---

## 🎓 Bonnes pratiques

### ✅ Formation des employés

1. Expliquez le système à vos employés
2. Montrez-leur comment donner leur carte au client
3. Rappelez l'importance de demander l'avis **après chaque intervention**

### ✅ Placement des cartes NFC

- **Toujours sur soi** (portefeuille, badge)
- **Visible** (lanière autour du cou)
- **Propre** (remplacer si abîmée)

### ✅ Communication client

Phrase type :

```
"Auriez-vous 30 secondes pour scanner cette carte 
et nous donner votre avis ? Cela nous aide énormément !"
```

### ✅ Réactivité sur les avis négatifs

- Répondre **sous 24h maximum**
- Appeler le client directement si possible
- Proposer une solution concrète
- Enregistrer la réponse dans le système

### ✅ Motivation de l'équipe

- Affichez le classement mensuel
- Récompensez les meilleurs performers
- Fixez des objectifs (ex: 50 scans/mois)
- Organisez des challenges

---

## 🚀 Évolutions futures

### Fonctionnalités prévues

- [ ] Export Excel des rapports
- [ ] Graphiques interactifs
- [ ] Notifications push
- [ ] Intégration Zapier
- [ ] Multi-langue (funnel)
- [ ] QR codes dynamiques (changement URL sans réimprimer)
- [ ] Dashboard temps réel

---

## 💬 Support

### Besoin d'aide ?

- **Email** : support@raisemed.ia
- **Documentation** : Ce fichier
- **Supabase Dashboard** : Pour la gestion des données

---

**Créé avec ❤️ par RaiseMed.IA**

*Version 1.0 - Octobre 2025*

