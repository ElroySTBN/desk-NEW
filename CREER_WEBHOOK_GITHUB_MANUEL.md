# 🔗 Créer le Webhook GitHub Manuellement pour Vercel

## Pourquoi créer le webhook manuellement ?

Parfois, Vercel ne crée pas automatiquement le webhook GitHub lors de la connexion du dépôt. Dans ce cas, il faut le créer manuellement pour activer le déploiement automatique.

---

## 📋 Étapes Détaillées

### Étape 1 : Obtenir l'URL du Webhook Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Ouvrez votre projet (celui connecté à `desk-NEW`)
3. Allez dans **Settings** → **Git**
4. **Notez l'URL de votre projet Vercel** (ex: `https://vercel.com/your-username/your-project`)
5. L'URL du webhook sera : `https://api.vercel.com/v1/integrations/deploy`

**⚠️ Mais avant de créer le webhook, vous devez d'abord obtenir le "Deploy Hook" depuis Vercel :**

### Étape 2 : Obtenir le Deploy Hook depuis Vercel

**Option A : Via l'interface Vercel (méthode recommandée)**

1. Dans Vercel → votre projet → **Settings** → **Git**
2. Vérifiez que le dépôt est bien connecté : `ElroySTBN/desk-NEW`
3. Si ce n'est pas le cas, reconnectez-le (voir ci-dessous)

**Option B : Créer un Deploy Hook manuellement**

1. Dans Vercel → votre projet → **Settings** → **Git**
2. Si vous voyez une section **"Deploy Hooks"**, créez-en un nouveau
3. Sinon, utilisez l'API Vercel (voir ci-dessous)

### Étape 3 : Vérifier la Connexion GitHub dans Vercel

**Si le dépôt n'est pas connecté :**

1. Dans Vercel → **Settings** → **Git**
2. Cliquez sur **"Connect Git Repository"**
3. Sélectionnez **GitHub**
4. Autorisez Vercel si demandé
5. Sélectionnez le dépôt `ElroySTBN/desk-NEW`
6. Cliquez sur **"Connect"**

### Étape 4 : Créer le Webhook sur GitHub

1. Allez sur GitHub : https://github.com/ElroySTBN/desk-NEW/settings/hooks
2. Cliquez sur **"Add webhook"** (bouton en haut à droite)
3. Remplissez le formulaire :

#### Configuration du Webhook

**Payload URL :**
```
https://api.vercel.com/v1/integrations/deploy
```

**Content type :**
- Sélectionnez : `application/json`

**Secret :**
- Laissez vide (Vercel n'utilise pas de secret pour les webhooks GitHub standard)

**Which events would you like to trigger this webhook?**
- Sélectionnez : **"Just the push event"** (recommandé)
- Ou **"Let me select individual events"** et cochez uniquement :
  - ✅ `push`
  - ✅ `pull_request` (optionnel, pour déployer les PR)

**Active :**
- ✅ Cochez la case (le webhook doit être actif)

4. Cliquez sur **"Add webhook"**

### Étape 5 : Vérifier que le Webhook fonctionne

1. Après avoir créé le webhook, GitHub affichera une page de confirmation
2. Vous verrez le webhook dans la liste avec un statut **"Active"** (coche verte)
3. GitHub enverra automatiquement un "ping" pour tester le webhook
4. Vérifiez dans Vercel → **Deployments** qu'un déploiement a été déclenché

### Étape 6 : Tester le Webhook

1. Faites un petit changement dans votre code (ou laissez-moi créer un commit de test)
2. Poussez le changement sur GitHub
3. Vérifiez dans GitHub → **Settings** → **Webhooks** → votre webhook
4. Cliquez sur le webhook pour voir les **"Recent Deliveries"**
5. Vous devriez voir une nouvelle delivery avec le statut **"200 OK"**
6. Vérifiez dans Vercel → **Deployments** qu'un nouveau déploiement a été déclenché

---

## 🔍 Vérification du Webhook

### Dans GitHub

1. Allez sur : https://github.com/ElroySTBN/desk-NEW/settings/hooks
2. Vous devriez voir votre webhook avec :
   - ✅ Statut : **"Active"** (coche verte)
   - ✅ URL : `https://api.vercel.com/v1/integrations/deploy`
   - ✅ Événements : `push`

### Dans Vercel

1. Allez sur Vercel → votre projet → **Deployments**
2. Vous devriez voir les déploiements déclenchés automatiquement
3. Chaque push sur GitHub devrait créer un nouveau déploiement

---

## 🐛 Dépannage

### Le webhook ne fonctionne pas

**Vérifier les permissions GitHub :**

1. Allez sur GitHub → **Settings** → **Applications** → **Authorized GitHub Apps**
2. Vérifiez que **Vercel** est autorisé
3. Si ce n'est pas le cas, réautorisez Vercel :
   - Dans Vercel → **Settings** → **Git**
   - Déconnectez et reconnectez le dépôt
   - Autorisez Vercel quand demandé

**Vérifier les logs du webhook :**

1. Dans GitHub → **Settings** → **Webhooks** → votre webhook
2. Cliquez sur le webhook pour voir les **"Recent Deliveries"**
3. Cliquez sur une delivery pour voir les détails
4. Vérifiez le statut de la réponse :
   - ✅ **200 OK** = Le webhook fonctionne
   - ❌ **401 Unauthorized** = Problème d'authentification
   - ❌ **404 Not Found** = URL incorrecte
   - ❌ **500 Internal Server Error** = Problème côté Vercel

### Le déploiement ne se déclenche pas

**Vérifier que Vercel est connecté au bon dépôt :**

1. Dans Vercel → **Settings** → **Git**
2. Vérifiez que le dépôt est bien `ElroySTBN/desk-NEW`
3. Vérifiez que la branche est `main`

**Vérifier les variables d'environnement :**

1. Dans Vercel → **Settings** → **Environment Variables**
2. Vérifiez que toutes les variables sont configurées
3. Vérifiez qu'elles sont actives pour **Production**

### Le webhook retourne une erreur 401

**Cela signifie que Vercel ne reconnaît pas le webhook :**

1. Vérifiez que le dépôt est bien connecté dans Vercel
2. Vérifiez que vous utilisez la bonne URL : `https://api.vercel.com/v1/integrations/deploy`
3. Essayez de déconnecter et reconnecter le dépôt dans Vercel

---

## ✅ Checklist de Vérification

Après avoir créé le webhook, vérifiez :

- [ ] Le webhook est créé sur GitHub
- [ ] Le statut du webhook est **"Active"**
- [ ] L'URL du webhook est : `https://api.vercel.com/v1/integrations/deploy`
- [ ] Les événements déclenchés sont : `push`
- [ ] Le webhook a envoyé un "ping" de test avec succès (200 OK)
- [ ] Vercel est connecté au dépôt `ElroySTBN/desk-NEW`
- [ ] Un test de push déclenche un déploiement dans Vercel

---

## 🎯 Résultat Attendu

- ✅ Webhook GitHub créé et actif
- ✅ Chaque push sur `main` déclenche un déploiement Vercel
- ✅ Les déploiements apparaissent automatiquement dans Vercel
- ✅ Plus besoin de déployer manuellement

---

## 📝 Notes Importantes

- ⚠️ Le webhook doit être créé sur le dépôt GitHub, pas dans Vercel
- ✅ Vercel doit être autorisé sur votre compte GitHub
- 🔒 Le webhook utilise l'authentification OAuth de Vercel (pas de secret nécessaire)
- 🎯 Une fois créé, le webhook fonctionnera automatiquement pour tous les pushes

---

## 🆘 Si Rien Ne Fonctionne

Si après avoir créé le webhook manuellement, le déploiement automatique ne fonctionne toujours pas :

1. **Vérifiez les logs du webhook** dans GitHub pour voir les erreurs
2. **Vérifiez que Vercel est bien connecté** au dépôt dans les settings
3. **Essayez de recréer le projet Vercel** depuis zéro
4. **Contactez le support Vercel** si le problème persiste

---

## 🚀 Alternative : Utiliser l'API Vercel

Si la création manuelle du webhook ne fonctionne pas, vous pouvez utiliser l'API Vercel pour créer un Deploy Hook :

1. Allez sur Vercel → votre projet → **Settings** → **Git**
2. Cherchez la section **"Deploy Hooks"**
3. Créez un nouveau Deploy Hook
4. Utilisez l'URL du Deploy Hook comme Payload URL dans GitHub

Mais normalement, avec un dépôt GitHub connecté, Vercel devrait gérer les webhooks automatiquement via l'intégration GitHub.

