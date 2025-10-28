# Créer votre compte administrateur

Pour vous connecter avec l'identifiant `elroy`, vous devez d'abord créer le compte dans Supabase.

## Option 1 : Via l'interface Supabase (Recommandé)

1. Allez sur https://supabase.com/dashboard/project/qpbtmqgsnqnbkzxopaiv
2. Cliquez sur **Authentication** dans le menu
3. Cliquez sur **Users**
4. Cliquez sur **Add user** → **Create new user**
5. Remplissez :
   - **Email** : `elroy@raisemed.ia`
   - **Password** : `[votre mot de passe choisi]`
   - Cochez **Auto Confirm User** (important !)
6. Cliquez sur **Create user**

## Option 2 : Via SQL Editor

1. Allez sur https://supabase.com/dashboard/project/qpbtmqgsnqnbkzxopaiv/sql/new
2. Exécutez ce script SQL (remplacez `VOTRE_MOT_DE_PASSE`) :

```sql
-- Créer l'utilisateur principal
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'elroy@raisemed.ia',
  crypt('VOTRE_MOT_DE_PASSE', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  ''
);
```

## Identifiants de connexion

Une fois le compte créé dans Supabase :

- **Identifiant** : `elroy`
- **Mot de passe** : [celui que vous avez choisi lors de la création]

## Ajouter d'autres utilisateurs

Pour ajouter un autre utilisateur :

1. Modifiez le fichier `src/pages/Auth.tsx`
2. Ajoutez une entrée dans `AUTHORIZED_USERS` :

```typescript
const AUTHORIZED_USERS = [
  {
    username: "elroy",
    email: "elroy@raisemed.ia",
    displayName: "Elroy SITBON"
  },
  {
    username: "nouvel_user",
    email: "nouvel_user@raisemed.ia",
    displayName: "Nom Complet"
  }
];
```

3. Créez le compte dans Supabase avec l'email correspondant
4. L'utilisateur pourra se connecter avec son identifiant

## Notes de sécurité

- Les mots de passe sont gérés par Supabase (hashés et sécurisés)
- Seuls les identifiants listés dans `AUTHORIZED_USERS` peuvent se connecter
- Aucun nouveau compte ne peut être créé depuis l'interface

