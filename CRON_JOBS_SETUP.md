# 🔄 Configuration des Cron Jobs - RaiseDesk TDAH

## 📋 Vue d'ensemble

Les cron jobs sont configurés via **Vercel Cron** et appellent automatiquement vos Edge Functions Supabase pour exécuter les tâches automatisées.

## ✅ Ce qui est déjà configuré

1. **Fichier `vercel.json`** : Contient la configuration des 2 cron jobs
2. **Routes API** : `api/cron/check-deadlines.ts` et `api/cron/auto-invoice.ts`
3. **Edge Functions Supabase** : `check-deadlines` et `auto-invoice`

## 🎯 Cron Jobs configurés

### 1. Vérification des deadlines (9h00 UTC quotidien)

**Route** : `/api/cron/check-deadlines`  
**Schedule** : `0 9 * * *` (tous les jours à 9h00 UTC)

**Fonctions** :
- Vérifie les rapports mensuels à générer (3 jours avant fin de mois)
- Vérifie les factures à générer (3 jours avant anniversaire d'abonnement)
- Détecte les tâches urgentes en retard
- Envoie des notifications Telegram si nécessaire

### 2. Génération automatique des factures (8h00 UTC quotidien)

**Route** : `/api/cron/auto-invoice`  
**Schedule** : `0 8 * * *` (tous les jours à 8h00 UTC)

**Fonctions** :
- Identifie les clients dont la date d'anniversaire d'abonnement est aujourd'hui
- Génère automatiquement la facture PDF
- Envoie la facture par email au client
- Met à jour la base de données

## 🚀 Activation automatique

Une fois votre projet déployé sur Vercel, les cron jobs sont **automatiquement activés**. Aucune configuration supplémentaire n'est nécessaire !

## 🔍 Vérification

1. Allez dans votre projet Vercel
2. Ouvrez **Settings** → **Cron Jobs**
3. Vous devriez voir les 2 cron jobs listés :
   - `check-deadlines-daily` (9h00 UTC)
   - `auto-invoice-daily` (8h00 UTC)

## 📊 Historique d'exécution

Dans Vercel → Settings → Cron Jobs, vous pouvez :
- Voir l'historique des exécutions
- Voir les logs de chaque exécution
- Vérifier si les jobs ont réussi ou échoué

## ⚙️ Variables d'environnement requises

Assurez-vous que ces variables sont configurées sur Vercel :

- `VITE_SUPABASE_URL` ou `SUPABASE_URL` : URL de votre projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role (pour appeler les Edge Functions)
- `TELEGRAM_BOT_TOKEN` : Token de votre bot Telegram (déjà configuré dans Supabase Edge Functions)
- `TELEGRAM_CHAT_ID` : Votre Chat ID Telegram (déjà configuré dans Supabase Edge Functions)
- `RESEND_API_KEY` : Clé API Resend pour l'envoi d'emails (déjà configuré dans Supabase Edge Functions)

## 🔧 Comment ça fonctionne

```
Vercel Cron (planifié)
    ↓
Route API (/api/cron/check-deadlines)
    ↓
Edge Function Supabase (check-deadlines)
    ↓
Base de données Supabase + Notifications Telegram
```

## 🐛 Dépannage

### Les cron jobs ne s'exécutent pas

1. Vérifiez que le projet est bien déployé sur Vercel
2. Vérifiez les variables d'environnement dans Vercel Settings
3. Consultez les logs dans Vercel → Settings → Cron Jobs

### Erreur "Unauthorized"

- Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est bien configurée sur Vercel
- Vérifiez que les Edge Functions Supabase sont bien déployées

### Les notifications Telegram ne fonctionnent pas

- Vérifiez que `TELEGRAM_BOT_TOKEN` et `TELEGRAM_CHAT_ID` sont configurés dans Supabase Edge Functions Secrets
- Testez manuellement l'Edge Function `send-telegram-notification`

## 📝 Modification des horaires

Pour modifier les horaires d'exécution, éditez le fichier `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/check-deadlines",
      "schedule": "0 9 * * *"  // Modifiez ici (format cron)
    }
  ]
}
```

**Format cron** : `minute heure jour mois jour-semaine`
- `0 9 * * *` = Tous les jours à 9h00 UTC
- `0 8 * * 1` = Tous les lundis à 8h00 UTC
- `*/30 * * * *` = Toutes les 30 minutes

## ✅ Checklist de vérification

- [ ] Projet déployé sur Vercel
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Edge Functions Supabase déployées
- [ ] Secrets Edge Functions configurés (Telegram, Resend)
- [ ] Cron jobs visibles dans Vercel → Settings → Cron Jobs
- [ ] Test manuel d'une route API réussie

## 🎉 C'est tout !

Les cron jobs sont maintenant configurés et fonctionnent automatiquement. Vous n'avez plus rien à faire !

