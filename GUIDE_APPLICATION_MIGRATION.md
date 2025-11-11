# 🔧 Guide d'Application de la Migration SQL

## 📋 Migration à Appliquer

**Fichier** : `supabase/migrations/20250102000001_fix_all_check_constraints.sql`

Cette migration corrige **toutes les contraintes CHECK** pour qu'elles correspondent au frontend et au nouveau schéma TDAH.

## ✅ Ce que fait cette migration

### 1. Table `tasks`
- ✅ Supprime la contrainte CHECK sur `category` (permet texte libre)
- ✅ Corrige la contrainte CHECK sur `status` (utilise 'done' et 'archived')
- ✅ Corrige la contrainte CHECK sur `priority`
- ✅ Migre les données (`completed` -> `done`, `cancelled` -> `archived`)
- ✅ Renomme `due_date` en `deadline` si nécessaire
- ✅ Supprime la colonne `urgency` (remplacée par `is_blocking`)

### 2. Table `clients`
- ✅ Corrige la contrainte CHECK sur `statut`

### 3. Table `notes`
- ✅ Corrige la contrainte CHECK sur `type`

### 4. Table `invoices`
- ✅ Corrige la contrainte CHECK sur `statut`
- ✅ Migre les données si nécessaire

### 5. Table `products`
- ✅ Corrige la contrainte CHECK sur `subscription_type`

### 6. Table `documents`
- ✅ Corrige la contrainte CHECK sur `type`

### 7. Table `content_library`
- ✅ Corrige la contrainte CHECK sur `content_type`
- ✅ Corrige la contrainte CHECK sur `status`

### 8. Table `monthly_reports`
- ✅ Corrige la contrainte CHECK sur `mois`

## 🚀 Comment Appliquer la Migration

### Méthode 1 : Via Supabase Dashboard (Recommandé)

1. **Ouvrez Supabase Dashboard** : https://supabase.com/dashboard
2. **Sélectionnez votre projet**
3. **Allez dans "SQL Editor"** (menu de gauche)
4. **Cliquez sur "New query"**
5. **Ouvrez le fichier** : `supabase/migrations/20250102000001_fix_all_check_constraints.sql`
6. **Copiez tout le contenu** du fichier
7. **Collez dans l'éditeur SQL**
8. **Cliquez sur "Run"** (ou appuyez sur Ctrl+Enter)
9. **Vérifiez qu'il n'y a pas d'erreur** dans les résultats

### Méthode 2 : Via Supabase CLI

```bash
# Si vous avez Supabase CLI installé
supabase db push
```

## ✅ Vérification Après Migration

### 1. Vérifier que les contraintes sont correctes

Exécutez cette requête SQL dans Supabase SQL Editor :

```sql
-- Vérifier toutes les contraintes CHECK
SELECT 
  table_name,
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_name;
```

### 2. Vérifier que category n'a pas de contrainte CHECK

```sql
-- Vérifier que tasks.category n'a pas de contrainte CHECK
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE table_schema = 'public'
  AND constraint_name LIKE '%category%';
```

**Résultat attendu** : Aucune contrainte CHECK sur `category`

### 3. Vérifier que status utilise les bonnes valeurs

```sql
-- Vérifier la contrainte CHECK sur tasks.status
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE table_schema = 'public'
  AND table_name = 'tasks'
  AND constraint_name LIKE '%status%';
```

**Résultat attendu** : `status IN ('todo', 'in_progress', 'done', 'archived')`

### 4. Tester la création d'une tâche

1. **Allez sur votre site** : Ouvrez la page des tâches
2. **Cliquez sur "Nouvelle tâche"**
3. **Remplissez le formulaire** :
   - Titre : "Test"
   - Description : "Test description"
   - Catégorie : "Test Category" (texte libre)
   - Priorité : "medium"
   - Deadline : Une date future
   - Client : Sélectionnez un client
4. **Cliquez sur "Créer"**
5. **Vérifiez qu'il n'y a pas d'erreur** ✅

## 🐛 Si vous avez une erreur

### Erreur : "constraint does not exist"

**Solution** : C'est normal, la migration utilise `DROP CONSTRAINT IF EXISTS`, donc cette erreur peut être ignorée.

### Erreur : "column does not exist"

**Solution** : Vérifiez que vous avez appliqué `SETUP_TDAH_V1.sql` avant cette migration.

### Erreur : "violate check constraint"

**Solution** : 
1. Vérifiez que la migration a bien été appliquée
2. Vérifiez que les données existantes ont été migrées
3. Exécutez cette requête pour voir les données problématiques :

```sql
-- Voir les tâches avec status invalide
SELECT id, title, status 
FROM public.tasks 
WHERE status NOT IN ('todo', 'in_progress', 'done', 'archived');
```

## 📝 Notes Importantes

- ✅ La migration est **idempotente** : vous pouvez l'exécuter plusieurs fois sans problème
- ✅ La migration **ne supprime pas de données** : elle migre seulement les valeurs
- ✅ La migration **gère les cas où les tables n'existent pas** : utilise `IF EXISTS`
- ✅ La migration **gère les cas où les colonnes n'existent pas** : utilise `IF NOT EXISTS`

## 🎯 Après la Migration

Une fois la migration appliquée :

1. ✅ Testez la création d'une tâche avec une catégorie libre
2. ✅ Testez la création d'une tâche sans catégorie (NULL)
3. ✅ Testez toutes les autres fonctionnalités qui utilisent des contraintes CHECK
4. ✅ Vérifiez que les anciennes données fonctionnent toujours

## 🆘 Support

Si vous avez des problèmes après avoir appliqué la migration :

1. **Vérifiez les logs** dans Supabase SQL Editor
2. **Vérifiez les contraintes** avec les requêtes SQL ci-dessus
3. **Vérifiez les données** avec les requêtes de diagnostic
4. **Contactez-moi** avec les détails de l'erreur


