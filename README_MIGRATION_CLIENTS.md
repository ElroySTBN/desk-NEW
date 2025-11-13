# Migration de la table clients

## Problème

Lors du développement local, vous rencontrez des erreurs comme "column clients.statut does not exist" car il y a une incohérence entre :
- Les colonnes de la base de données (noms en anglais : `status`, `monthly_amount`, `start_date`, `next_invoice_date`)
- Le code de l'application (noms en français : `statut`, `montant_mensuel`, `date_debut_contrat`, `date_anniversaire_abonnement`)

## Solution

Une migration SQL a été créée pour aligner les colonnes de la base de données avec le code français.

## Comment appliquer la migration

### Option 1 : Via le Dashboard Supabase (Recommandé)

1. **Ouvrez le Dashboard Supabase** : https://app.supabase.com
2. **Sélectionnez votre projet**
3. **Allez dans "SQL Editor"** (dans le menu de gauche)
4. **Créez une nouvelle requête**
5. **Copiez-collez le contenu** du fichier `supabase/migrations/20250108000000_rename_clients_status_to_statut.sql`
6. **Exécutez la requête** en cliquant sur "Run"

### Option 2 : Via la CLI Supabase (Si vous avez la CLI installée)

```bash
# Si vous avez la CLI Supabase installée et configurée
supabase db push
```

### Option 3 : Via psql (Si vous avez accès direct à la base de données)

```bash
# Connectez-vous à votre base de données Supabase
psql -h <your-supabase-host> -U postgres -d postgres

# Exécutez la migration
\i supabase/migrations/20250108000000_rename_clients_status_to_statut.sql
```

## Ce que fait la migration

La migration effectue les actions suivantes :

1. **Renomme `status` en `statut`** : Aligne la colonne avec le code français
2. **Renomme `monthly_amount` en `montant_mensuel`** : Aligne la colonne avec le code français
3. **Renomme `start_date` en `date_debut_contrat`** : Aligne la colonne avec le code français
4. **Renomme `next_invoice_date` en `date_anniversaire_abonnement`** : Aligne la colonne avec le code français
5. **Ajoute `secteur_activite`** : Colonne manquante utilisée par le code
6. **Ajoute `type_campagne`** : Colonne manquante utilisée par le code (array de TEXT)
7. **Met à jour les contraintes CHECK** : Assure que les valeurs de `statut` sont valides
8. **Crée des index** : Améliore les performances des requêtes

## Vérification

Après avoir appliqué la migration, vérifiez que tout fonctionne :

1. **Rechargez l'application** dans votre navigateur
2. **Essayez de générer un rapport GBP** : L'erreur "column clients.statut does not exist" ne devrait plus apparaître
3. **Vérifiez la page Clients** : Les clients devraient s'afficher correctement
4. **Testez la création d'un client** : Les champs devraient fonctionner correctement

## Notes importantes

- **Sauvegardez votre base de données** avant d'appliquer la migration (recommandé)
- **La migration est idempotente** : Elle peut être exécutée plusieurs fois sans problème
- **Les données existantes sont préservées** : Seuls les noms de colonnes sont modifiés
- **Les valeurs de `status` sont automatiquement converties** : Les valeurs 'prospect' deviennent 'actif'

## Problèmes possibles

### Erreur : "column status does not exist"
- Cela signifie que la colonne a déjà été renommée. La migration gère ce cas automatiquement.

### Erreur : "column statut already exists"
- Cela signifie que la colonne existe déjà. La migration gère ce cas automatiquement.

### Erreur : "constraint clients_statut_check already exists"
- La migration supprime et recrée la contrainte, donc cette erreur ne devrait pas apparaître.

Si vous rencontrez d'autres erreurs, vérifiez les logs dans le Dashboard Supabase ou contactez le support.

