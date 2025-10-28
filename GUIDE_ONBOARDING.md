# Guide d'utilisation - Système d'Onboarding Client

## Vue d'ensemble

Le système d'onboarding permet de collecter toutes les informations nécessaires auprès de vos nouveaux clients de manière structurée et interactive. Il comprend :

- **Page Admin** : Création et gestion des onboardings
- **Formulaire Client** : Interface responsive pour que le client complète ses informations
- **Export PDF** : Génération d'un PDF professionnel avec toutes les données

## Configuration initiale

### 1. Migration de la base de données

La migration a déjà été créée dans `supabase/migrations/20251028000000_add_onboarding_table.sql`.

Pour l'appliquer :

```bash
# Si vous utilisez Supabase CLI localement
supabase db push

# Ou appliquez la migration directement dans le dashboard Supabase
```

### 2. Création du bucket Supabase Storage

Pour permettre l'upload de fichiers (photos, documents), créez un bucket dans Supabase :

1. Allez dans **Storage** dans votre dashboard Supabase
2. Créez un nouveau bucket nommé **`onboarding-files`**
3. Configurez les permissions :
   - Activer "Public bucket" pour permettre l'accès aux fichiers uploadés
   - Ou configurez des RLS policies selon vos besoins

**Politique RLS recommandée pour le bucket :**

```sql
-- Permettre l'upload pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'onboarding-files');

-- Permettre la lecture pour tout le monde (ou seulement authentifiés selon vos besoins)
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'onboarding-files');

-- Permettre la suppression pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'onboarding-files');
```

## Utilisation

### 1. Créer un nouveau onboarding (Admin)

1. Naviguez vers **Onboarding** dans le menu
2. Cliquez sur **"Nouveau Onboarding"**
3. Remplissez les informations obligatoires :
   - Nom du client
   - Créé par (votre nom)
4. Pré-remplissez les informations que vous connaissez déjà :
   - Raison sociale
   - SIRET
   - Adresse
   - Contacts
   - Informations publiques
5. Cliquez sur **"Créer l'onboarding"**
6. Copiez le lien généré et envoyez-le au client

### 2. Remplir le formulaire (Client)

Le client reçoit un lien unique du type :
`https://votre-domaine.com/onboarding/form/[ID]`

Le formulaire comprend 10 sections :

1. **Informations légales** : SIRET, adresse, contacts
2. **Identité de marque** : Services, certifications, garanties
3. **Clientèle cible** : Types de clients, persona
4. **Communication** : Ton, valeurs, perception
5. **Historique** : Création, équipe, expérience
6. **Google Business Profile** : Établissement, horaires, description
7. **Visuels & Photos** : Upload de fichiers, méthode d'envoi
8. **Cartes NFC & Équipe** : Techniciens, formation
9. **Communication & Suivi** : Fréquence, canal, référent
10. **Validation finale** : Accords, dates de RDV

**Fonctionnalités clés :**
- ✅ Champs pré-remplis marqués en **orange** avec icône ℹ️
- 💾 Sauvegarde automatique toutes les 30 secondes
- 📊 Barre de progression en temps réel
- 📱 Interface responsive (mobile-friendly)
- 📎 Upload de fichiers direct
- 🎨 Accordéon pour naviguer entre les sections

### 3. Exporter en PDF (Admin)

1. Une fois le formulaire complété par le client (100%)
2. Cliquez sur **"Terminer"** dans le formulaire
3. Vous serez redirigé vers la page d'export
4. Cliquez sur **"Télécharger le PDF"**

Le PDF généré contient :
- Logo RaiseMed.IA en en-tête
- Toutes les sections complétées
- Champs pré-remplis marqués en orange
- Mise en page professionnelle
- Pagination

## Statuts des onboardings

- **draft** : Brouillon en cours de remplissage
- **sent** : Envoyé au client
- **completed** : Formulaire complété par le client
- **exported** : PDF généré

## Personnalisation

### Modifier les sections du formulaire

Les sections sont dans `/src/components/onboarding/`. Chaque section est un composant séparé :

- `LegalInfoSection.tsx`
- `BrandIdentitySection.tsx`
- `TargetAudienceSection.tsx`
- etc.

### Modifier le schéma de validation

Le schéma Zod est dans `/src/lib/onboarding-schema.ts`. Ajoutez ou modifiez les validations selon vos besoins.

### Personnaliser le PDF

La génération du PDF est dans `/src/lib/pdfExport.ts`. Vous pouvez :
- Changer les couleurs
- Ajouter votre logo
- Modifier la mise en page
- Ajouter des sections

## Dépannage

### Les fichiers ne s'uploadent pas

Vérifiez que :
1. Le bucket `onboarding-files` existe
2. Les permissions sont correctement configurées
3. La taille des fichiers ne dépasse pas les limites Supabase

### Le formulaire ne se sauvegarde pas

Vérifiez que :
1. La table `onboarding` existe
2. Les RLS policies sont activées
3. L'utilisateur est authentifié (pour les routes protégées)

### Le PDF ne se génère pas

Vérifiez que :
1. `jspdf` est installé : `npm install jspdf`
2. Les données sont complètes
3. Vérifiez la console pour les erreurs

## Support

Pour toute question ou problème, consultez :
- Les logs de la console navigateur
- Les logs Supabase
- Le code source dans `/src/pages/` et `/src/components/onboarding/`

