# 📋 Guide du Formulaire d'Onboarding Client

## 🎯 Vue d'ensemble

Le formulaire d'onboarding est maintenant organisé en **2 grandes parties** :

### 1️⃣ **Document d'Identité d'Entreprise**
Toutes les informations pour créer le document d'identité complet de votre client.

### 2️⃣ **Fiche Google Business Profile**
Formulaire complet pour créer la fiche Google Business Profile.

---

## 📝 Section 1 : Document d'Identité d'Entreprise

Cette section collecte toutes les informations essentielles sur l'entreprise :

### ✅ Informations légales
- Raison sociale (pré-remplie)
- Nom commercial (pré-rempli)
- SIRET (pré-rempli)

### ✅ Activité et services
- Description du métier
- Services proposés (liste séparée par virgules)

### ✅ Points forts et différenciation
- Points forts (liste)
- Certifications et labels
- Valeurs d'entreprise

### ✅ Garanties et SAV
- Garantie pièces (années)
- Garantie main d'œuvre (années)
- Description du SAV

### ✅ Historique et expérience
- Année de création
- Nombre d'interventions
- Nombre d'employés

### ✅ Contact principal
- Nom (pré-rempli)
- Fonction
- Téléphone (pré-rempli)
- Email (pré-rempli)

---

## 🏢 Section 2 : Google Business Profile

### **Nom de l'entreprise**
Champ pré-rempli en orange si vous l'avez saisi lors de la création.

---

### **Catégorie d'activité principale** ⭐

**Interface** : Boutons cliquables

Catégories disponibles :
- Plombier
- Électricien
- Chauffagiste
- Installation de climatisation
- Rénovation générale
- Menuisier
- Peintre en bâtiment
- Serrurier
- **Autre** (avec champ de saisie libre)

Le client clique simplement sur le bouton correspondant à son activité. S'il choisit "Autre", un champ apparaît pour qu'il précise.

---

### **Lieu physique** 📍

**Question** : Souhaitez-vous ajouter un lieu que vos clients peuvent visiter ?

**Interface** : Switch OUI/NON

Si **OUI**, le formulaire d'adresse apparaît :
- Pays/Région (France par défaut)
- Adresse postale (pré-remplie en orange)
- Code postal (pré-rempli en orange)
- Ville (pré-remplie en orange)

💡 **Note** : Cette adresse s'affichera sur Google Maps

---

### **Livraisons et visites à domicile** 🚗

**Question** : Proposez-vous des livraisons ou des visites à domicile ?

**Interface** : Switch OUI/NON

Si **OUI**, section "Zones desservies" apparaît :

**Ajout de zones** avec bouton **+** :
1. Le client tape une zone (département, ville, région...)
2. Clique sur le bouton **+** (ou appuie sur Entrée)
3. La zone s'ajoute comme un badge
4. Il peut en ajouter autant qu'il veut

**Exemples de zones** :
- "Île-de-France"
- "Paris"
- "75, 92, 93, 94"
- "Toute la France"
- "Seine-et-Marne"

Chaque zone ajoutée apparaît sous forme de badge avec un bouton **X** pour la supprimer.

---

### **Coordonnées** 📞

**Numéro de téléphone** (obligatoire, pré-rempli en orange)
**Site Web** (facultatif, pré-rempli en orange)

---

### **Horaires d'ouverture** 🕐

Interface simple et intuitive :

Pour chaque jour de la semaine :
- **Switch** pour activer/désactiver le jour
- **Champ horaires** qui s'active uniquement si le switch est ON

**Format libre** : Le client peut écrire comme il veut
- "9h-12h, 14h-18h"
- "8h30-17h"
- "24h/24"
- "Sur rendez-vous"

**Jours** :
- Lundi
- Mardi
- Mercredi
- Jeudi
- Vendredi
- Samedi
- Dimanche

---

### **Description de l'établissement** 📝

**Grande zone de texte** pour décrire l'activité

**Limite** : 750 caractères (avec compteur)

**Conseils pour le client** :
- Décrivez votre activité principale
- Mentionnez vos services
- Parlez de votre expertise
- Évoquez vos valeurs

**Exemple** :
> "Spécialistes de la climatisation depuis 2010, nous intervenons auprès des particuliers et professionnels pour l'installation, la maintenance et le dépannage de systèmes de climatisation. Notre équipe certifiée QualiPAC garantit des interventions rapides et de qualité. Devis gratuit sous 24h."

---

## 🎨 Éléments visuels

### Champs pré-remplis
- **Fond orange clair**
- **Bordure orange**
- **Icône ℹ️** avec texte "Pré-rempli - À vérifier"

### Cartes de section
- **Bleu** : Lieu physique
- **Vert** : Livraisons/visites
- **Blanc** : Sections normales

### Boutons de catégorie
- **Gris** : Non sélectionné
- **Bleu** : Sélectionné

### Badges de zones
- **Gris** : Zones ajoutées
- **Bouton X** rouge au survol pour supprimer

---

## 📊 Sections supplémentaires

Le formulaire contient aussi :

3. **Clientèle cible** - Types de clients, persona
4. **Communication** - Ton, valeurs
5. **Visuels & Photos** - Upload de fichiers
6. **Cartes NFC & Équipe** - Techniciens, formation
7. **Communication & Suivi** - Fréquence, canal
8. **Validation finale** - Accords, dates

---

## 💾 Fonctionnalités automatiques

### Sauvegarde automatique
- Toutes les **30 secondes**
- Icône de sauvegarde qui apparaît
- Pas besoin de cliquer sur "Sauvegarder"

### Barre de progression
- En haut du formulaire
- Se met à jour en temps réel
- Affiche le **% complété**

### Responsive
- Fonctionne parfaitement sur **mobile**
- Interface adaptée **tablette**
- Optimisé **desktop**

---

## 🎯 Workflow complet

### Côté Admin (vous)

1. **Créer l'onboarding**
   - Allez sur `/onboarding`
   - Cliquez "Nouveau Onboarding"
   - Entrez le nom du client
   - **Pré-remplissez** tout ce que vous trouvez en ligne :
     - SIRET (trouvé sur societe.com)
     - Adresse (Google Maps)
     - Téléphone (site web)
     - Site web
     - Catégorie d'activité

2. **Partager le lien**
   - Copiez le lien généré
   - Envoyez-le au client (WhatsApp, Email, SMS)

### Côté Client

1. **Ouvrir le lien**
   - Sur mobile ou ordinateur
   - Formulaire responsive

2. **Vérifier les infos pré-remplies**
   - Tous les champs orange doivent être vérifiés
   - Le client peut modifier s'il y a des erreurs

3. **Compléter les sections**
   - Document d'identité : description, services, etc.
   - Google Business Profile : catégorie, horaires, etc.
   - Sauvegarde automatique toutes les 30s

4. **Terminer**
   - Quand tout est rempli (100%)
   - Cliquer sur "Terminer"

### Résultat

- **PDF professionnel** généré
- Contient toutes les informations
- Prêt pour créer la fiche Google Business Profile
- Document d'identité d'entreprise complet

---

## ✨ Améliorations apportées

### Par rapport à la version précédente :

✅ **Catégories cliquables** au lieu d'un champ texte
✅ **Zones multiples** avec bouton + au lieu d'une liste fixe
✅ **Interface horaires** simplifiée avec switch
✅ **Organisation claire** en 2 grandes parties
✅ **Champs pré-remplis** bien visibles en orange
✅ **Description** de chaque section
✅ **Switch OUI/NON** pour lieu physique et livraisons
✅ **Formulaires conditionnels** qui n'apparaissent que si nécessaire

---

## 🚀 Tester le formulaire

1. Allez sur `http://localhost:8080/onboarding`
2. Créez un onboarding test
3. Ouvrez le lien dans un nouvel onglet
4. Testez toutes les fonctionnalités :
   - Catégories cliquables
   - Switch lieu physique
   - Ajout de zones avec +
   - Horaires avec switch
   - Champs pré-remplis en orange

---

**Le formulaire est maintenant parfaitement adapté à votre workflow ! 🎉**

