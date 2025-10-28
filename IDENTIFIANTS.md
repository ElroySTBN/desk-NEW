# 🔐 Identifiants de Connexion RaiseMed OS

## ⚠️ IMPORTANT : Créer votre compte d'abord

Avant de pouvoir vous connecter, vous devez créer votre compte dans Supabase.

### Étape 1 : Créer le compte dans Supabase

**Option A : Via l'interface (Le plus simple)**

1. Allez sur : https://supabase.com/dashboard/project/qpbtmqgsnqnbkzxopaiv/auth/users
2. Cliquez sur **Add user** (en haut à droite)
3. Sélectionnez **Create new user**
4. Remplissez :
   - **Email** : `elroy@raisemed.ia`
   - **Password** : Choisissez un mot de passe (minimum 6 caractères)
   - ✅ **Cochez "Auto Confirm User"** (très important !)
5. Cliquez sur **Create user**

**Option B : Créer via SQL**

Si vous préférez SQL, allez dans **SQL Editor** et exécutez :

```sql
-- Remplacez VOTRE_MOT_DE_PASSE par votre mot de passe choisi
SELECT auth.signup(
  'elroy@raisemed.ia',
  'VOTRE_MOT_DE_PASSE',
  '{"full_name": "Elroy SITBON"}'::jsonb
);
```

---

### Étape 2 : Se connecter à RaiseMed OS

Une fois le compte créé dans Supabase :

**Identifiant** : `elroy`
**Mot de passe** : [celui que vous avez choisi à l'étape 1]

---

## 🔄 Mot de passe oublié ?

Si vous oubliez votre mot de passe :

### Option 1 : Réinitialiser via Supabase
1. Allez sur https://supabase.com/dashboard/project/qpbtmqgsnqnbkzxopaiv/auth/users
2. Trouvez votre utilisateur (`elroy@raisemed.ia`)
3. Cliquez sur les 3 points → **Reset Password**
4. Définissez un nouveau mot de passe

### Option 2 : Supprimer et recréer le compte
1. Dans Supabase, supprimez l'utilisateur `elroy@raisemed.ia`
2. Recréez-le avec un nouveau mot de passe
3. Reconnectez-vous avec l'identifiant `elroy`

---

## ➕ Ajouter d'autres utilisateurs

Pour ajouter un collaborateur :

1. **Créez le compte dans Supabase** avec un nouvel email (ex: `assistant@raisemed.ia`)
2. **Modifiez le fichier** `src/pages/Auth.tsx`
3. Ajoutez dans `AUTHORIZED_USERS` :

```typescript
{
  username: "assistant",
  email: "assistant@raisemed.ia",
  displayName: "Assistant RaiseMed"
}
```

4. Votre collaborateur pourra se connecter avec l'identifiant `assistant`

---

## 🛡️ Sécurité

- ✅ Seuls les identifiants listés dans le code peuvent se connecter
- ✅ Les mots de passe sont hashés et sécurisés par Supabase
- ✅ Impossible de créer un compte depuis l'interface de connexion
- ✅ Gestion centralisée des utilisateurs autorisés

---

## 📝 Résumé Rapide

**Pour vous connecter MAINTENANT :**

1. Créez le compte dans Supabase : https://supabase.com/dashboard/project/qpbtmqgsnqnbkzxopaiv/auth/users
   - Email: `elroy@raisemed.ia`
   - Password: votre choix
   - ✅ Auto Confirm User

2. Allez sur http://localhost:8080

3. Connectez-vous avec :
   - Identifiant: `elroy`
   - Mot de passe: celui que vous avez choisi

---

**Besoin d'aide ?** Vérifiez que :
- Le compte existe bien dans Supabase
- Vous utilisez le bon mot de passe
- Le serveur tourne bien (`npm run dev`)

