# 📥 Guide d'Import de vos Clients

## ✅ Ce qui a été mis à jour

### 1. Vos informations dans les factures PDF
- ✅ Nom : Elroy SITBON
- ✅ Entreprise : RaiseMed.IA
- ✅ Adresse : 4 Rue Bellanger, 92200 Neuilly-Sur-Seine
- ✅ Téléphone : 07 82 49 21 24
- ✅ SIRET : 94011372300016
- ✅ TVA : FR27940113723

Les factures générées afficheront maintenant vos vraies coordonnées !

### 2. Nouveaux champs clients
- ✅ SIRET du client
- ✅ Numéro de TVA intracommunautaire
- ✅ Adresse de facturation complète (rue, code postal, ville)

---

## 🚀 Import de vos clients existants

### ⚠️ **ÉTAPE 0 : Migration de la Base de Données**

**IMPORTANT** : Avant d'importer vos clients, vous devez ajouter les nouveaux champs à la base de données.

#### Option A : Script automatique (recommandé)

1. **Ouvrez** le fichier : `scripts/apply-migration.html` dans votre navigateur
   ```bash
   open /Users/elroysitbon/raisedesk-io/scripts/apply-migration.html
   ```

2. **Connectez-vous** d'abord sur RaiseMed OS (http://localhost:8080)

3. **Revenez** sur le script et cliquez sur **"🚀 Appliquer la migration"**

4. **Si succès** : Passez à l'Étape 1 ✅

5. **Si échec** : Suivez l'Option B ci-dessous

#### Option B : Migration manuelle via Supabase Dashboard

1. **Allez sur** [Supabase SQL Editor](https://supabase.com/dashboard/project/qpbtmqgsnqnbkzxopaiv/editor)

2. **Connectez-vous** avec votre compte Supabase

3. **Copiez et collez** ce code SQL :

```sql
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS siret TEXT,
  ADD COLUMN IF NOT EXISTS tva_number TEXT,
  ADD COLUMN IF NOT EXISTS billing_address TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT;
```

4. **Cliquez sur "Run"** pour exécuter

5. ✅ Migration terminée ! Passez à l'Étape 1

---

### **ÉTAPE 1 : Préparer vos données**

J'ai créé un fichier avec vos **7 clients réels** déjà formatés :

📄 **`scripts/mes-clients.txt`**

**Vos clients :**
1. ✅ **Palma Speak** - Abonnement semestriel 900€ (actif)
2. ⏸️ **Ethan Ayache** - Inactif
3. ⏸️ **Jobert Immobilier** - Inactif
4. ✅ **HF AUDITION** - 115€/mois (actif)
5. ✅ **Global Views** - 150€/mois (actif)
6. ✅ **SIMON BENOIT** - 150€/mois + campagne Meta Ads (actif)
7. ✅ **FRANCE ENERGIE VERTE** - 390€/mois + frais d'intégration (actif)

**Notes importantes :**
- J'ai exclu **SARL Dubois** (client fictif de démo)
- Les informations fiscales (SIRET, TVA) sont incluses
- Les adresses complètes sont formatées pour les factures
- Les montants mensuels reflètent vos abonnements actuels

---

### **ÉTAPE 2 : Ouvrir le script d'import**

Ouvrez le script **`import-clients.html`** dans votre navigateur :

```bash
open /Users/elroysitbon/raisedesk-io/scripts/import-clients.html
```

---

### **ÉTAPE 3 : Se connecter à RaiseMed OS**

⚠️ **Avant d'importer, vous DEVEZ être connecté sur RaiseMed OS**

1. Ouvrez un nouvel onglet : http://localhost:8080
2. Connectez-vous avec vos identifiants
3. Revenez sur le script d'import

---

### **ÉTAPE 4 : Copier vos données**

1. **Ouvrez** le fichier **`scripts/mes-clients.txt`**
   ```bash
   open /Users/elroysitbon/raisedesk-io/scripts/mes-clients.txt
   ```

2. **Sélectionnez TOUT** le contenu (⌘ Cmd + A)

3. **Copiez** (⌘ Cmd + C)

4. **Retournez** sur la page web d'import

5. **Collez** dans la grande zone de texte (⌘ Cmd + V)

---

### **ÉTAPE 5 : Lancer l'import**

1. **Vérifiez** que les données sont bien collées

2. **Cliquez** sur **"🚀 Importer les clients"**

3. **Attendez** quelques secondes...

4. ✅ **Résultat** : "Import terminé ! 7 clients importés avec succès"

---

### **ÉTAPE 6 : Vérifier**

Allez sur **http://localhost:8080/clients** pour voir tous vos clients !

Vous devriez voir :
- 5 clients **actifs** (avec badge vert)
- 2 clients **inactifs** (avec badge gris)

---

## 📝 Format des Données (pour ajouter de nouveaux clients)

### Format : **1 ligne = 1 client**

```
Nom|Entreprise|Email|Téléphone|Adresse|Code Postal|Ville|Montant|Date|Statut|SIRET|TVA
```

### Exemple complet :

```
Jean Dupont|Dupont SARL|jean@dupont.fr|06 12 34 56 78|10 rue de la Paix|75001|Paris|1500|2024-01-15|actif|12345678901234|FR12345678901
Marie Martin|Auto-entrepreneur|marie@martin.fr|06 98 76 54 32|25 avenue Victor Hugo|69001|Lyon|800|2024-02-20|prospect||
```

### Détails des colonnes :

| Colonne | Description | Obligatoire | Exemple |
|---------|-------------|-------------|---------|
| **Nom** | Nom du contact | Oui | Jean Dupont |
| **Entreprise** | Nom de l'entreprise | Oui | Dupont SARL |
| **Email** | Email du contact | Oui | jean@dupont.fr |
| **Téléphone** | Téléphone | Oui | 06 12 34 56 78 |
| **Adresse** | Adresse facturation (rue) | Oui | 10 rue de la Paix |
| **Code Postal** | Code postal | Oui | 75001 |
| **Ville** | Ville | Oui | Paris |
| **Montant** | Montant mensuel HT (€) | Oui | 1500 |
| **Date** | Date début (AAAA-MM-JJ) | Oui | 2024-01-15 |
| **Statut** | prospect/actif/inactif/churned | Oui | actif |
| **SIRET** | Numéro SIRET | Non | 12345678901234 |
| **TVA** | N° TVA intracommunautaire | Non | FR12345678901 |

**Statuts possibles :**
- `prospect` : Client potentiel
- `actif` : Client actif avec abonnement en cours
- `inactif` : Client temporairement inactif
- `churned` : Client perdu/parti

---

## 🎯 Après l'import

Pour chaque client, vous pouvez maintenant :

### 1. Compléter les informations
- **Onglet "Informations"** : 
  - Modifier/compléter les données
  - Ajouter le type de contrat
  - Ajouter des notes générales

### 2. Configurer l'onboarding
- **Onglet "Onboarding"** : 
  - ✅ Cocher les étapes complétées (audit, devis, formulaire Tally, etc.)
  - 🔗 Ajouter les liens importants (Google Drive, Page GBP, etc.)
  - 📊 Suivre la progression en temps réel

### 3. Créer des tâches personnalisées
- **Onglet "Tâches"** :
  - 📝 To-do lists uniques par client
  - 📅 Dates limites
  - 🔥 Priorités (haute, moyenne, basse)
  - ✅ Suivi de l'avancement

### 4. Remplir les KPIs mensuels
- **Onglet "KPIs"** :
  - 📅 Sélectionner le mois et l'année
  - ✏️ Ajouter actions réalisées
  - 📈 Ajouter résultats obtenus
  - 📊 Définir des KPIs personnalisés
  - ⚠️ Noter problèmes et solutions
  - 🎯 Plans d'amélioration
  - 📄 **Générer le rapport PDF mensuel**

### 5. Gérer les factures
- **Onglet "Factures"** :
  - ➕ Créer une nouvelle facture
  - 📥 Télécharger le PDF (avec SIRET et TVA du client)
  - 📧 Copier le template email (facture, relance J+7, relance J+15)
  - ✅ Marquer comme payée

### 6. Stocker les documents
- **Onglet "Documents"** :
  - 📎 Upload de fichiers (contrats, audits, visuels)
  - 📂 Organisation par client
  - 🔐 Stockage sécurisé dans Supabase

### 7. Historique des communications
- **Onglet "Communications"** :
  - 📞 Appels
  - 📧 Emails envoyés
  - 🤝 Notes de réunion
  - 📝 Notes générales
  - 📅 Timeline chronologique

---

## 💡 Dates d'anniversaire d'abonnement

Les dates que vous avez importées servent à :
- ✅ Calculer automatiquement les anniversaires d'abonnement
- ✅ Générer des **notifications 7 jours avant** le renouvellement
- ✅ Afficher dans le **Dashboard** les prochaines échéances
- ✅ Vous rappeler d'envoyer les factures et rapports mensuels

**Pour modifier la date d'anniversaire :**
1. Allez sur la fiche du client
2. Onglet **"Informations"** → **"Modifier"**
3. Changez la **"Date de début"**
4. Enregistrez

---

## 📊 Informations sur vos clients importés

Voici un récapitulatif de ce qui a été importé :

### Clients actifs (5)

1. **Palma Speak**
   - 💰 900€ / semestre (soit 150€/mois)
   - 📅 Depuis août 2024
   - 📧 s.chiang@accom.fr

2. **HF AUDITION**
   - 💰 115€ / mois
   - 📍 Marseille
   - 📧 hfaudition13@gmail.com
   - 📝 Note : Frais d'intégration étalés sur 4 mois

3. **Global Views**
   - 💰 150€ / mois
   - 📍 Saint-Tropez
   - 📧 yaronsitbon5@gmail.com

4. **SIMON BENOIT**
   - 💰 150€ / mois
   - 📅 Depuis février 2025
   - 📍 Neuves-Maisons
   - 📧 bs@lavauximmobilier.fr
   - 📝 Note : + Campagne Meta Ads 500€ (100€ x 5 mois)

5. **FRANCE ENERGIE VERTE**
   - 💰 390€ / mois
   - 📍 Malakoff
   - 📧 didierpariente@france-energieverte.fr
   - 📝 Note : + 1500€ frais d'intégration

### Clients inactifs (2)

6. **Ethan Ayache** (Paris 16e)
7. **Jobert Immobilier** (Nogent-sur-Marne)

---

## 🔄 Ajouter de nouveaux clients

Pour ajouter de nouveaux clients plus tard :

1. **Ouvrez** `scripts/import-clients.html`
2. **Préparez** vos données au format (voir ci-dessus)
3. **Collez** et cliquez sur "Importer"

⚠️ **Note :** Le script ne détecte pas les doublons. Si vous réimportez le même client, il sera créé en double. Dans ce cas, supprimez le doublon depuis la page Clients.

---

## 📋 Prochaines étapes recommandées

### Pour chaque client actif :

- [ ] **Onglet Onboarding** : Cocher les étapes déjà réalisées
- [ ] **Onglet Tâches** : Créer les to-do lists mensuelles
- [ ] **Onglet KPIs** : Remplir le mois en cours
- [ ] **Onglet Factures** : Générer les factures du mois
- [ ] **Onglet Documents** : Upload des contrats et audits
- [ ] **Onglet Informations** : Ajouter les notes importantes

### Cas spéciaux :

#### SIMON BENOIT - Campagne Meta Ads
- Créer une tâche : "Facturation Meta Ads 100€/mois (5 mois)"
- Ajouter dans les notes : "Sept 2024 : Campagne 500€ étalée"

#### HF AUDITION - Frais d'intégration
- Créer une note : "Frais d'intégration étalés sur 4 mois"
- Suivre le paiement mensuel

#### FRANCE ENERGIE VERTE - Frais d'intégration
- Créer une facture séparée pour les 1500€ de frais
- Facturation mensuelle de 390€

---

## ✅ Checklist de démarrage

- [ ] Migration de la base de données effectuée
- [ ] Import des 7 clients réalisé
- [ ] Vérification sur http://localhost:8080/clients
- [ ] Compléter les onglets Onboarding pour chaque client actif
- [ ] Créer les premières factures du mois
- [ ] Remplir les KPIs du mois en cours
- [ ] Ajouter les documents importants (contrats, audits)
- [ ] Configurer les tâches récurrentes

---

## 🎉 C'est terminé !

**Vos 7 clients sont maintenant dans RaiseMed OS !**

Tous vos PDF (factures et rapports) afficheront :
- ✅ Vos coordonnées complètes
- ✅ Les coordonnées de facturation du client
- ✅ Les numéros SIRET et TVA
- ✅ Le logo RaiseMed.IA

**Vous pouvez maintenant gérer toute votre agence depuis une seule plateforme ! 🚀**

---

## 💬 Besoin d'aide ?

Si vous rencontrez un problème :
1. Vérifiez que vous êtes bien connecté sur http://localhost:8080
2. Vérifiez que la migration a bien été appliquée
3. Vérifiez le format des données (pipe `|` comme séparateur)
4. Consultez les erreurs affichées dans le script d'import

**Astuce :** Importez d'abord 1-2 clients pour tester, puis importez le reste une fois que tout fonctionne !
