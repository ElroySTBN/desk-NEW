# 🔗 Guide Simple : Créer le Webhook GitHub pour Vercel

## 🎯 Objectif
Créer manuellement le webhook GitHub qui déclenchera les déploiements Vercel automatiques.

---

## 📋 Étapes (5 minutes)

### 1. Vérifier que Vercel est connecté au dépôt

1. Allez sur [vercel.com](https://vercel.com) → votre projet
2. **Settings** → **Git**
3. Vérifiez que le dépôt est bien `ElroySTBN/desk-NEW`
4. Si ce n'est pas le cas, cliquez sur **"Connect Git Repository"** et reconnectez-le

### 2. Aller sur les Webhooks GitHub

1. Allez sur : https://github.com/ElroySTBN/desk-NEW/settings/hooks
2. Vous verrez la liste des webhooks (probablement vide)

### 3. Créer le Webhook

1. Cliquez sur **"Add webhook"** (bouton en haut à droite)

### 4. Configurer le Webhook

Remplissez le formulaire avec ces valeurs exactes :

**Payload URL :**
```
https://api.vercel.com/v1/integrations/deploy
```

**Content type :**
- Sélectionnez : `application/json`

**Secret :**
- Laissez vide (pas de secret nécessaire)

**Which events would you like to trigger this webhook?**
- Sélectionnez : **"Just the push event"**

**Active :**
- ✅ Cochez la case

### 5. Créer le Webhook

1. Cliquez sur **"Add webhook"** (bouton vert en bas)
2. GitHub créera le webhook et enverra un test "ping"
3. Vous verrez le webhook dans la liste avec un statut **"Active"** ✅

### 6. Vérifier que ça fonctionne

1. Dans la liste des webhooks, cliquez sur votre webhook
2. Vous verrez les **"Recent Deliveries"**
3. Vous devriez voir un "ping" avec le statut **"200 OK"** ✅
4. Si vous voyez **"200 OK"**, le webhook fonctionne !

### 7. Tester avec un Push

1. Je vais créer un commit de test et le pousser
2. Après le push, allez dans GitHub → **Settings** → **Webhooks** → votre webhook
3. Vous devriez voir une nouvelle delivery avec le push
4. Vérifiez dans Vercel → **Deployments** qu'un nouveau déploiement a été déclenché

---

## ✅ Vérifications

- [ ] Le webhook est créé sur GitHub
- [ ] Le statut est **"Active"** (coche verte)
- [ ] Le test "ping" retourne **"200 OK"**
- [ ] Un push déclenche un déploiement dans Vercel

---

## 🐛 Si ça ne marche pas

### Le webhook retourne 401 Unauthorized

**Solution :**
1. Dans Vercel → **Settings** → **Git**
2. Déconnectez le dépôt
3. Reconnectez-le en autorisant Vercel sur GitHub
4. Réessayez

### Le webhook retourne 404 Not Found

**Solution :**
- Vérifiez que l'URL est exactement : `https://api.vercel.com/v1/integrations/deploy`
- Pas d'espace, pas de slash à la fin

### Le déploiement ne se déclenche pas

**Solution :**
1. Vérifiez dans Vercel → **Settings** → **Git** que le dépôt est bien connecté
2. Vérifiez que vous poussez sur la branche `main`
3. Vérifiez les logs du webhook dans GitHub pour voir les erreurs

---

## 🎯 C'est tout !

Une fois le webhook créé, chaque push sur `main` déclenchera automatiquement un déploiement Vercel.

