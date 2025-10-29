# 📊 Review & Tracking System - Documentation Technique

> **Système complet de gestion des avis et de tracking des employés**

---

## 🏗️ Architecture

### Stack Technique

- **Frontend** : React + TypeScript + Vite
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **UI** : Tailwind CSS + shadcn/ui
- **QR Codes** : qrcode.js
- **Dates** : date-fns
- **Routing** : React Router v6

### Structure des Fichiers

```
src/
├── pages/
│   ├── ClientEmployees.tsx          # Gestion des employés
│   ├── ClientReviewSettings.tsx     # Configuration du funnel
│   ├── ClientScanReports.tsx        # Rapports de scans
│   ├── ClientNegativeReviews.tsx    # Avis négatifs
│   ├── ScanRedirect.tsx             # Redirection après scan (public)
│   └── ReviewFunnel.tsx             # Funnel d'avis (public)
├── types/
│   └── review-system.ts             # Types TypeScript
└── App.tsx                          # Routes

supabase/
└── migrations/
    └── 20251029000000_create_review_system.sql  # Migration SQL
```

---

## 🗄️ Schéma de Base de Données

### Tables

#### `employees`
Gestion des employés avec liens uniques.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK vers clients |
| name | VARCHAR | Nom de l'employé |
| position | VARCHAR | Poste (optionnel) |
| email | VARCHAR | Email (optionnel) |
| phone | VARCHAR | Téléphone (optionnel) |
| unique_link_id | UUID | Lien unique pour tracking |
| qr_code_data | TEXT | Données QR code |
| is_active | BOOLEAN | Actif/inactif |
| notes | TEXT | Notes internes |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Dernière modification |
| created_by | UUID | Créé par (user) |

**Index** :
- `idx_employees_client_id` sur `client_id`
- `idx_employees_unique_link_id` sur `unique_link_id` (UNIQUE)
- `idx_employees_is_active` sur `is_active`

#### `scan_tracking`
Tracking de tous les scans de QR/NFC.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | FK vers employees |
| client_id | UUID | FK vers clients |
| scanned_at | TIMESTAMP | Date/heure du scan |
| scan_date | DATE | Date du scan (index) |
| scan_hour | INTEGER | Heure du scan (0-23) |
| user_agent | TEXT | User agent |
| ip_address | INET | Adresse IP |
| referer | TEXT | Referer |
| device_type | VARCHAR | mobile/tablet/desktop |
| metadata | JSONB | Métadonnées additionnelles |
| created_at | TIMESTAMP | Date de création |

**Index** :
- `idx_scan_tracking_employee_id` sur `employee_id`
- `idx_scan_tracking_client_id` sur `client_id`
- `idx_scan_tracking_scanned_at` sur `scanned_at`
- `idx_scan_tracking_scan_date` sur `scan_date`
- `idx_scan_tracking_scan_hour` sur `scan_hour`

**Trigger** : `auto_populate_scan_metadata` remplit automatiquement `scan_hour` et `scan_date`.

#### `review_settings`
Configuration du funnel d'avis par client.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK vers clients (UNIQUE) |
| review_platforms | JSONB | Plateformes configurées |
| threshold_score | INTEGER | Seuil avis positif (1-5) |
| redirect_platform | VARCHAR | Plateforme par défaut |
| email_notifications | VARCHAR[] | Emails pour notifications |
| slack_webhook | TEXT | Webhook Slack (optionnel) |
| positive_message | TEXT | Message avis positif |
| negative_message | TEXT | Message avis négatif |
| collect_customer_info | BOOLEAN | Collecter infos client |
| require_email | BOOLEAN | Email obligatoire |
| is_active | BOOLEAN | Système actif/inactif |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Dernière modification |

**Structure `review_platforms` (JSONB)** :
```json
{
  "google": {
    "enabled": true,
    "url": "https://g.page/r/..."
  },
  "pages_jaunes": {
    "enabled": false,
    "url": ""
  },
  "trustpilot": {
    "enabled": false,
    "url": ""
  },
  "tripadvisor": {
    "enabled": false,
    "url": ""
  },
  "custom": {
    "enabled": false,
    "url": "",
    "name": "Ma plateforme"
  }
}
```

#### `negative_reviews`
Collecte des avis négatifs en privé.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK vers clients |
| employee_id | UUID | FK vers employees (nullable) |
| rating | INTEGER | Note (1-5) |
| comment | TEXT | Commentaire client |
| customer_name | VARCHAR | Nom client (optionnel) |
| customer_email | VARCHAR | Email client (optionnel) |
| customer_phone | VARCHAR | Téléphone client (optionnel) |
| source | VARCHAR | web/qr/nfc |
| user_agent | TEXT | User agent |
| ip_address | INET | Adresse IP |
| status | VARCHAR | new/read/in_progress/resolved/archived |
| assigned_to | UUID | Assigné à (user) |
| response | TEXT | Réponse donnée |
| responded_at | TIMESTAMP | Date de réponse |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Dernière modification |

**Index** :
- `idx_negative_reviews_client_id` sur `client_id`
- `idx_negative_reviews_employee_id` sur `employee_id`
- `idx_negative_reviews_status` sur `status`
- `idx_negative_reviews_created_at` sur `created_at`

#### `positive_review_redirects`
Tracking des redirections vers plateformes publiques.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK vers clients |
| employee_id | UUID | FK vers employees (nullable) |
| rating | INTEGER | Note (1-5) |
| platform | VARCHAR | Plateforme de redirection |
| redirected_at | TIMESTAMP | Date/heure redirection |
| user_agent | TEXT | User agent |
| ip_address | INET | Adresse IP |
| created_at | TIMESTAMP | Date de création |

**Index** :
- `idx_positive_redirects_client_id` sur `client_id`
- `idx_positive_redirects_employee_id` sur `employee_id`
- `idx_positive_redirects_platform` sur `platform`

---

### Vues SQL

#### `employee_scan_stats_monthly`
Statistiques de scans par employé par mois.

```sql
SELECT 
  employee_id,
  employee_name,
  client_id,
  month,
  total_scans,
  days_with_scans
FROM employee_scan_stats_monthly;
```

#### `employee_scan_stats_daily`
Statistiques de scans par jour.

```sql
SELECT 
  employee_id,
  employee_name,
  client_id,
  scan_date,
  total_scans,
  hours_with_scans
FROM employee_scan_stats_daily;
```

#### `employee_scan_stats_hourly`
Statistiques de scans par heure.

```sql
SELECT 
  employee_id,
  employee_name,
  client_id,
  scan_date,
  scan_hour,
  total_scans
FROM employee_scan_stats_hourly;
```

---

### Fonctions SQL

#### `regenerate_employee_link(employee_uuid UUID)`
Régénère un nouveau lien unique pour un employé.

```sql
SELECT regenerate_employee_link('uuid-employee');
-- Returns: nouveau UUID
```

#### `get_employee_stats(employee_uuid UUID, start_date DATE, end_date DATE)`
Récupère les statistiques complètes d'un employé.

```sql
SELECT * FROM get_employee_stats(
  'uuid-employee',
  '2025-10-01',
  '2025-10-31'
);
```

**Retourne** :
- `total_scans` : Total de scans
- `scans_today` : Scans aujourd'hui
- `scans_this_week` : Scans cette semaine
- `scans_this_month` : Scans ce mois
- `average_scans_per_day` : Moyenne par jour
- `most_active_hour` : Heure la plus active
- `most_active_day` : Jour le plus actif

---

## 🔒 Row Level Security (RLS)

### Permissions

#### Utilisateurs authentifiés (Admin)
✅ **TOUS les droits** sur toutes les tables

#### Utilisateurs anonymes (Public)
✅ Peut **CRÉER** dans `scan_tracking` (tracking)
✅ Peut **CRÉER** dans `negative_reviews` (avis)
✅ Peut **LIRE** `review_settings` actifs
❌ Pas d'accès aux autres tables

### Policies

Toutes les tables ont RLS activé avec les policies appropriées.

Exemple pour `scan_tracking` :

```sql
-- Authenticated users can view scans
CREATE POLICY "Authenticated users can view scans"
  ON scan_tracking FOR SELECT
  TO authenticated
  USING (true);

-- Public can create scans
CREATE POLICY "Public can create scans"
  ON scan_tracking FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

---

## 🛣️ Routes

### Routes Admin (authentification requise)

| Route | Composant | Description |
|-------|-----------|-------------|
| `/clients/:id/employees` | ClientEmployees | Gestion des employés |
| `/clients/:id/review-settings` | ClientReviewSettings | Config funnel d'avis |
| `/clients/:id/scan-reports` | ClientScanReports | Rapports de scans |
| `/clients/:id/negative-reviews` | ClientNegativeReviews | Avis négatifs |

### Routes Publiques (pas d'authentification)

| Route | Composant | Description |
|-------|-----------|-------------|
| `/scan/:employeeId` | ScanRedirect | Redirection après scan |
| `/review/:clientId` | ReviewFunnel | Funnel d'avis |

**Params** :
- `:employeeId` : `unique_link_id` de l'employé
- `:clientId` : `id` du client
- Query param `?employee=uuid` : Pour tracker l'employé dans le funnel

---

## 🔄 Flux de Données

### Scan QR/NFC → Tracking

```
1. Client scanne QR code
   → GET /scan/:employeeId

2. ScanRedirect.tsx
   ├─ Vérifie que l'employé existe et est actif
   ├─ Crée un enregistrement dans scan_tracking
   │   └─ employee_id, client_id, scanned_at, device_type, etc.
   └─ Redirige vers /review/:clientId?employee=:employeeId

3. Tracking terminé ✅
```

### Funnel d'Avis

```
1. Utilisateur arrive sur /review/:clientId

2. ReviewFunnel.tsx
   ├─ Charge review_settings du client
   └─ Affiche : Étape 1 (Rating)

3. Utilisateur clique sur une note (1-5 étoiles)

4. Si note >= threshold_score (ex: 4)
   ├─ Affiche : Étape 2A (Avis positif)
   ├─ Enregistre dans positive_review_redirects
   └─ Redirige vers plateforme (Google, etc.)

5. Si note < threshold_score
   ├─ Affiche : Étape 2B (Avis négatif)
   ├─ Formulaire : nom, email, téléphone, commentaire
   ├─ Enregistre dans negative_reviews
   └─ Affiche : Étape 3 (Merci)

6. Fin ✅
```

---

## 📦 Dépendances

### Nouvelles dépendances installées

```json
{
  "qrcode": "^1.5.x",
  "@types/qrcode": "^1.5.x",
  "date-fns": "^2.30.x"
}
```

### Installation

```bash
npm install qrcode @types/qrcode date-fns
```

---

## 🧪 Tests

### Test du système complet

1. **Créer un employé** :
   ```
   POST /employees
   {
     "client_id": "uuid",
     "name": "Test Employee"
   }
   ```

2. **Générer QR code** :
   ```typescript
   const qrCode = await QRCode.toDataURL(scanUrl);
   ```

3. **Scanner le lien** :
   ```
   GET /scan/{unique_link_id}
   ```

4. **Vérifier le tracking** :
   ```sql
   SELECT * FROM scan_tracking 
   WHERE employee_id = 'uuid'
   ORDER BY scanned_at DESC;
   ```

5. **Donner un avis négatif** :
   ```
   POST /negative_reviews
   {
     "client_id": "uuid",
     "employee_id": "uuid",
     "rating": 2,
     "comment": "Test"
   }
   ```

6. **Vérifier l'avis** :
   ```sql
   SELECT * FROM negative_reviews 
   WHERE client_id = 'uuid'
   ORDER BY created_at DESC;
   ```

---

## 🔧 Configuration

### Variables d'environnement

Aucune variable supplémentaire nécessaire.

Le système utilise les variables Supabase existantes :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 🚀 Déploiement

### Checklist

- [x] Appliquer la migration SQL
- [x] Vérifier les RLS policies
- [x] Tester les routes publiques
- [x] Configurer au moins un client
- [x] Ajouter au moins un employé
- [x] Générer et tester un QR code

### Production

Le système fonctionne en production dès que :

1. ✅ Migration SQL appliquée sur Supabase
2. ✅ Application déployée (Vercel, etc.)
3. ✅ Routes publiques accessibles

**URLs publiques** :
```
https://votre-domaine.com/scan/:employeeId
https://votre-domaine.com/review/:clientId
```

---

## 📈 Performance

### Optimisations appliquées

- ✅ Index sur toutes les FK
- ✅ Index sur les champs de tri (`scanned_at`, `created_at`)
- ✅ Index sur `scan_date` et `scan_hour` pour les rapports
- ✅ Vues matérialisées pour les stats (via vues SQL)
- ✅ Trigger auto-populate pour éviter les calculs côté client

### Scalabilité

Le système peut gérer :
- ✅ **Employés** : Illimité
- ✅ **Scans** : Millions (avec index)
- ✅ **Avis** : Illimité
- ✅ **Clients** : Illimité

---

## 🐛 Debugging

### Logs utiles

```typescript
// ScanRedirect.tsx
console.log('Employee found:', employee);
console.log('Scan tracked:', trackingResult);

// ReviewFunnel.tsx
console.log('Settings loaded:', settings);
console.log('Rating selected:', rating);
console.log('Review submitted:', submissionResult);
```

### Requêtes SQL de debug

```sql
-- Vérifier les scans récents
SELECT * FROM scan_tracking 
ORDER BY scanned_at DESC 
LIMIT 10;

-- Vérifier les employés actifs
SELECT * FROM employees 
WHERE is_active = true;

-- Vérifier les avis négatifs non traités
SELECT * FROM negative_reviews 
WHERE status = 'new';

-- Vérifier les redirections positives
SELECT * FROM positive_review_redirects 
ORDER BY redirected_at DESC 
LIMIT 10;
```

---

## 📚 Documentation Utilisateur

- **Guide complet** : `GUIDE_SYSTEME_AVIS.md`
- **Démarrage rapide** : `QUICK_START_AVIS.md`
- **Ce fichier** : Documentation technique

---

## 🤝 Contribution

### Ajouter une nouvelle plateforme

1. Modifiez `ReviewPlatforms` dans `src/types/review-system.ts`
2. Ajoutez le champ dans `ClientReviewSettings.tsx`
3. Mettez à jour la migration SQL (default value)

### Ajouter un nouveau type de rapport

1. Créez une vue SQL dans la migration
2. Créez un type TypeScript correspondant
3. Ajoutez la logique dans `ClientScanReports.tsx`

---

## 📝 Changelog

### v1.0.0 (2025-10-29)

- ✅ Système de gestion des employés
- ✅ Génération de QR codes
- ✅ Tracking des scans
- ✅ Funnel d'avis intelligent
- ✅ Collecte avis négatifs
- ✅ Redirection avis positifs
- ✅ Rapports mensuels détaillés
- ✅ Notifications par email

---

**Développé par RaiseMed.IA**

*Version 1.0 - Octobre 2025*

