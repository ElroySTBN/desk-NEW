# Migration template_type

## Problème

L'erreur "Could not find the 'template_type' column of 'gbp_report_templates' in the schema cache" indique que la colonne `template_type` n'existe pas encore dans votre base de données Supabase.

## Solution

Pour activer la fonctionnalité de types de templates, vous devez appliquer la migration SQL suivante :

### Étape 1 : Ouvrir Supabase Dashboard

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor** (dans le menu de gauche)

### Étape 2 : Exécuter le script de migration

1. Copiez le contenu du fichier `supabase/apply_template_type_migration.sql`
2. Collez-le dans l'éditeur SQL de Supabase
3. Cliquez sur **Run** pour exécuter le script

### Étape 3 : Vérifier que la migration a été appliquée

Vous devriez voir un message "Colonne template_type ajoutée avec succès" dans les résultats.

### Étape 4 : Redémarrer l'application

Après avoir appliqué la migration, redémarrez votre application pour que les changements soient pris en compte.

## Note

Jusqu'à ce que la migration soit appliquée, le champ "Type de template" est désactivé dans l'interface. L'application fonctionnera normalement, mais tous les templates seront créés comme type "gbp_report" par défaut.

## Après la migration

Une fois la migration appliquée, vous pouvez :
- Sélectionner le type de template lors de la création
- Filtrer les templates par type
- Utiliser des templates différents pour les rapports GBP et les documents d'audit

