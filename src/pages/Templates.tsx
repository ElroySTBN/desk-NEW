import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Mail, FileText, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Templates = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "✅ Copié !",
      description: `Template "${title}" copié dans le presse-papier`,
    });
  };

  // EMAIL TEMPLATES
  const emailTemplates = {
    facturation: [
      {
        id: "nouvelle-facture",
        name: "Nouvelle Facture",
        category: "Facturation",
        subject: "Facture {invoice_number} - {month} {year}",
        variables: ["{client_name}", "{invoice_number}", "{month}", "{year}", "{amount}"],
        body: `Bonjour {client_name},

J'espère que tout se passe bien de votre côté.

Vous trouverez ci-joint la facture {invoice_number} pour nos services du mois de {month} {year} d'un montant de {amount}€ TTC.

Le règlement est attendu sous 15 jours par virement bancaire.

Restant à votre disposition pour toute question.

Cordialement,
Elroy SITBON
RaiseMed.IA`,
      },
      {
        id: "rappel-j7",
        name: "Rappel Paiement J+7",
        category: "Facturation",
        subject: "Rappel facture {invoice_number}",
        variables: ["{client_name}", "{invoice_number}", "{amount}", "{date}"],
        body: `Bonjour {client_name},

J'espère que vous allez bien.

Je me permets de vous envoyer un petit rappel concernant la facture {invoice_number} d'un montant de {amount}€ TTC, émise le {date}.

Si le règlement a déjà été effectué, merci de ne pas tenir compte de ce message.

Belle journée à vous,
Elroy SITBON
RaiseMed.IA`,
      },
      {
        id: "relance-j15",
        name: "Relance Ferme J+15",
        category: "Facturation",
        subject: "URGENT - Facture {invoice_number} impayée",
        variables: ["{client_name}", "{invoice_number}", "{amount}", "{date}"],
        body: `Bonjour {client_name},

Je constate que la facture {invoice_number} de {amount}€ TTC, émise le {date}, n'a toujours pas été réglée.

Merci de bien vouloir procéder au règlement dans les plus brefs délais.

Je reste disponible pour échanger si besoin.

Cordialement,
Elroy SITBON
RaiseMed.IA`,
      },
    ],
    onboarding: [
      {
        id: "bienvenue-client",
        name: "Bienvenue Nouveau Client",
        category: "Onboarding",
        subject: "Bienvenue chez RaiseMed.IA 🚀",
        variables: ["{client_name}", "{start_date}"],
        body: `Bonjour {client_name},

Bienvenue chez RaiseMed.IA ! 🎉

Je suis ravi de débuter notre collaboration à partir du {start_date}.

Pour bien démarrer, j'aurais besoin de quelques informations de votre part :

📋 **Formulaire d'onboarding** : [lien Tally]
Merci de remplir ce formulaire qui me permettra de mieux comprendre votre entreprise, vos services, et votre clientèle cible.

📁 **Espace de dépôt des visuels** : [lien Google Drive]
Merci de déposer 15 images/visuels représentatifs de votre activité que j'utiliserai pour vos publications.

📄 **Document d'identité d'entreprise** : Je vais créer un document centralisé avec toutes les informations clés de votre entreprise.

Je vous recontacte d'ici 48h pour planifier notre première session de travail.

Au plaisir de travailler ensemble !

Cordialement,
Elroy SITBON
RaiseMed.IA`,
      },
      {
        id: "demande-infos",
        name: "Demande Informations Complémentaires",
        category: "Onboarding",
        subject: "Besoin d'informations pour démarrer",
        variables: ["{client_name}"],
        body: `Bonjour {client_name},

Pour optimiser votre présence en ligne et démarrer efficacement, j'aurais besoin des informations suivantes :

✅ Horaires d'ouverture complets
✅ Liste complète des produits/services
✅ Description détaillée de votre clientèle cible (ICP)
✅ 15 visuels/photos de qualité
✅ Accès à votre fiche Google Business Profile (si existante)

Pouvez-vous me transmettre ces éléments d'ici {deadline} ?

Merci d'avance !

Cordialement,
Elroy SITBON
RaiseMed.IA`,
      },
    ],
    reporting: [
      {
        id: "rapport-mensuel",
        name: "Rapport Mensuel Client",
        category: "Reporting",
        subject: "Rapport mensuel {month} {year} - RaiseMed.IA",
        variables: ["{client_name}", "{month}", "{year}"],
        body: `Bonjour {client_name},

Voici votre rapport mensuel pour {month} {year}.

📊 **Résultats du mois :**
• [Métrique 1] : [Valeur]
• [Métrique 2] : [Valeur]
• [Métrique 3] : [Valeur]

🎯 **Actions réalisées :**
• [Action 1]
• [Action 2]
• [Action 3]

⭐ **Avis Google :**
• Nombre d'avis reçus : [X]
• Note moyenne : [X]/5
• Évolution : [+X%]

📈 **Performance Google Business Profile :**
• Vues : [X] ([+X%])
• Recherches : [X] ([+X%])
• Actions : [X] ([+X%])

💡 **Recommandations pour le mois prochain :**
• [Recommandation 1]
• [Recommandation 2]

Le rapport complet PDF est en pièce jointe.

N'hésitez pas si vous avez des questions !

Cordialement,
Elroy SITBON
RaiseMed.IA`,
      },
      {
        id: "anniversaire-abonnement",
        name: "Anniversaire Abonnement",
        category: "Reporting",
        subject: "🎉 Joyeux anniversaire d'abonnement !",
        variables: ["{client_name}", "{months_count}"],
        body: `Bonjour {client_name},

Cela fait maintenant {months_count} mois que nous travaillons ensemble ! 🎉

Je tenais à vous remercier pour votre confiance.

📊 **Votre progression depuis le début :**
• [Métrique clé 1] : [Progression]
• [Métrique clé 2] : [Progression]
• [Métrique clé 3] : [Progression]

Je vous envoie votre facture mensuelle ci-joint.

Au plaisir de continuer cette belle collaboration !

Cordialement,
Elroy SITBON
RaiseMed.IA`,
      },
    ],
    prospection: [
      {
        id: "cold-outreach-1",
        name: "Cold Outreach - Version 1",
        category: "Prospection",
        subject: "Boostez votre visibilité locale sur Google",
        variables: ["{prospect_name}", "{business_name}"],
        body: `Bonjour {prospect_name},

Je suis tombé sur {business_name} et j'ai remarqué que votre fiche Google Business Profile pourrait être mieux optimisée pour attirer plus de clients locaux.

Je m'appelle Elroy, je suis spécialisé dans l'optimisation Google Business Profile pour les entreprises locales.

Seriez-vous intéressé par un audit GRATUIT de votre présence en ligne ?

Cet audit vous montrera :
✅ Vos points d'amélioration
✅ Comment vos concurrents vous dépassent
✅ Les opportunités de croissance manquées

Sans engagement, juste pour vous apporter de la valeur.

Disponible pour un échange cette semaine ?

Cordialement,
Elroy SITBON
RaiseMed.IA`,
      },
      {
        id: "follow-up-audit",
        name: "Follow-up Après Audit",
        category: "Prospection",
        subject: "Votre audit gratuit est prêt 📊",
        variables: ["{prospect_name}"],
        body: `Bonjour {prospect_name},

Suite à notre échange, j'ai terminé votre audit gratuit !

Vous trouverez en pièce jointe un document détaillant :

🔍 L'état actuel de votre présence en ligne
📊 Votre positionnement vs concurrents
⚠️ Les points d'amélioration critiques
🚀 Les opportunités de croissance

Seriez-vous disponible pour un appel de 20 minutes cette semaine pour en discuter ?

Je peux vous montrer comment augmenter significativement votre visibilité locale.

Cordialement,
Elroy SITBON
RaiseMed.IA`,
      },
    ],
  };

  const auditTemplate = {
    sections: [
      {
        title: "Présentation RaiseMed.IA",
        content: `RaiseMed.IA est une agence spécialisée dans l'optimisation de la visibilité locale des entreprises via Google Business Profile.

Notre mission : Augmenter votre visibilité, générer plus d'avis clients, et attirer plus de prospects qualifiés.`,
      },
      {
        title: "Analyse de votre fiche Google Business Profile",
        fields: [
          "Nom de l'entreprise : {business_name}",
          "Secteur d'activité : {industry}",
          "Localisation : {location}",
          "",
          "📊 **État actuel :**",
          "• Vues mensuelles : {views}",
          "• Nombre d'avis : {reviews_count}",
          "• Note moyenne : {rating}/5",
          "• Photos : {photos_count}",
          "• Posts récents : {posts_count}",
        ],
      },
      {
        title: "Analyse de la concurrence",
        fields: [
          "🔍 **Top 3 concurrents locaux :**",
          "",
          "1. {competitor_1}",
          "   • Avis : {comp1_reviews}",
          "   • Note : {comp1_rating}/5",
          "",
          "2. {competitor_2}",
          "   • Avis : {comp2_reviews}",
          "   • Note : {comp2_rating}/5",
          "",
          "3. {competitor_3}",
          "   • Avis : {comp3_reviews}",
          "   • Note : {comp3_rating}/5",
        ],
      },
      {
        title: "E-réputation",
        fields: [
          "⭐ **Analyse des avis :**",
          "• Pourcentage d'avis positifs : {positive_percent}%",
          "• Taux de réponse aux avis : {response_rate}%",
          "• Temps de réponse moyen : {response_time}",
          "",
          "🚨 **Points d'attention :**",
          "• {alert_1}",
          "• {alert_2}",
        ],
      },
      {
        title: "Recommandations",
        fields: [
          "💡 **Actions prioritaires :**",
          "",
          "1. **Optimisation de la fiche**",
          "   → {recommendation_1}",
          "",
          "2. **Génération d'avis**",
          "   → {recommendation_2}",
          "",
          "3. **Création de contenu**",
          "   → {recommendation_3}",
          "",
          "4. **Engagement communauté**",
          "   → {recommendation_4}",
        ],
      },
      {
        title: "Proposition Commerciale",
        content: `🎯 **Offre RaiseMed.IA**

Formule Standard : {price}€/mois

✅ Ce qui est inclus :
• Optimisation complète de votre fiche Google
• Génération de contenu régulier (posts, photos)
• Stratégie de génération d'avis clients
• Réponses aux avis
• Rapport mensuel détaillé
• Support dédié

📞 Prêt à booster votre visibilité locale ?

Contactez-moi : elroy@raisemed.ia`,
      },
    ],
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground mt-2">
          Bibliothèque de templates pour emails et audits
        </p>
      </div>

      <Tabs defaultValue="emails" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="emails">
            <Mail className="h-4 w-4 mr-2" />
            Templates Emails
          </TabsTrigger>
          <TabsTrigger value="audits">
            <FileText className="h-4 w-4 mr-2" />
            Templates Audits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-6">
          {/* Facturation */}
          <div>
            <h2 className="text-2xl font-bold mb-4">📧 Facturation</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {emailTemplates.facturation.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription className="mt-2">
                          <strong>Sujet :</strong> {template.subject}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Variables disponibles :</p>
                      <div className="flex flex-wrap gap-2">
                        {template.variables.map((v) => (
                          <Badge key={v} variant="outline" className="text-xs">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {template.body}
                      </pre>
                    </div>
                    <Button
                      className="w-full gap-2"
                      onClick={() => copyToClipboard(template.body, template.name)}
                    >
                      <Copy className="h-4 w-4" />
                      Copier le template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Onboarding */}
          <div>
            <h2 className="text-2xl font-bold mb-4">🚀 Onboarding</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {emailTemplates.onboarding.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription className="mt-2">
                          <strong>Sujet :</strong> {template.subject}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Variables disponibles :</p>
                      <div className="flex flex-wrap gap-2">
                        {template.variables.map((v) => (
                          <Badge key={v} variant="outline" className="text-xs">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {template.body}
                      </pre>
                    </div>
                    <Button
                      className="w-full gap-2"
                      onClick={() => copyToClipboard(template.body, template.name)}
                    >
                      <Copy className="h-4 w-4" />
                      Copier le template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Reporting */}
          <div>
            <h2 className="text-2xl font-bold mb-4">📊 Reporting</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {emailTemplates.reporting.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription className="mt-2">
                          <strong>Sujet :</strong> {template.subject}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Variables disponibles :</p>
                      <div className="flex flex-wrap gap-2">
                        {template.variables.map((v) => (
                          <Badge key={v} variant="outline" className="text-xs">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {template.body}
                      </pre>
                    </div>
                    <Button
                      className="w-full gap-2"
                      onClick={() => copyToClipboard(template.body, template.name)}
                    >
                      <Copy className="h-4 w-4" />
                      Copier le template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Prospection */}
          <div>
            <h2 className="text-2xl font-bold mb-4">🎯 Prospection</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {emailTemplates.prospection.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription className="mt-2">
                          <strong>Sujet :</strong> {template.subject}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Variables disponibles :</p>
                      <div className="flex flex-wrap gap-2">
                        {template.variables.map((v) => (
                          <Badge key={v} variant="outline" className="text-xs">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {template.body}
                      </pre>
                    </div>
                    <Button
                      className="w-full gap-2"
                      onClick={() => copyToClipboard(template.body, template.name)}
                    >
                      <Copy className="h-4 w-4" />
                      Copier le template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Audit Gratuit</CardTitle>
              <CardDescription>
                Structure complète pour vos audits prospects/clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {auditTemplate.sections.map((section, idx) => (
                <div key={idx} className="border-l-4 border-primary pl-4">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {section.title}
                  </h3>
                  {section.content && (
                    <div className="bg-muted p-4 rounded-lg mb-3">
                      <pre className="text-sm whitespace-pre-wrap">{section.content}</pre>
                    </div>
                  )}
                  {section.fields && (
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {section.fields.join("\n")}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
              <Button
                className="w-full gap-2"
                onClick={() => {
                  const fullTemplate = auditTemplate.sections
                    .map(
                      (s) =>
                        `${s.title}\n\n${s.content || ""}${
                          s.fields ? "\n" + s.fields.join("\n") : ""
                        }`
                    )
                    .join("\n\n---\n\n");
                  copyToClipboard(fullTemplate, "Template Audit Complet");
                }}
              >
                <Copy className="h-4 w-4" />
                Copier le template complet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Templates;
