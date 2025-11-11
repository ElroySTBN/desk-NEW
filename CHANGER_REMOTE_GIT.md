# 🔄 Changer le Remote Git - Instructions

## ⚠️ IMPORTANT

**Ne faites PAS ces commandes maintenant !**

Attendez que j'aie l'URL de votre nouveau dépôt GitHub, puis je les exécuterai pour vous.

---

## 📋 Commandes à Exécuter (par moi)

Une fois que vous m'aurez donné l'URL du nouveau dépôt, j'exécuterai ces commandes :

```bash
# 1. Vérifier le remote actuel
git remote -v

# 2. Supprimer l'ancien remote
git remote remove origin

# 3. Ajouter le nouveau remote
git remote add origin https://github.com/VotreUsername/NouveauNomDepot.git

# 4. Vérifier que c'est bien configuré
git remote -v

# 5. Pousser tout le code vers le nouveau dépôt
git push -u origin main
```

---

## 🎯 Ce que Vous Devez Faire

1. **Créer le nouveau dépôt GitHub** (voir `MIGRATION_NOUVEAU_GITHUB.md`)
2. **Me donner l'URL du nouveau dépôt** (ex: `https://github.com/VotreUsername/raisedesk-tdah.git`)
3. **Attendre que j'exécute les commandes**
4. **Vérifier que le code est bien sur GitHub**

---

## ✅ Après la Migration

Une fois le code poussé, suivez les étapes dans `MIGRATION_NOUVEAU_GITHUB.md` pour reconnecter Vercel.

