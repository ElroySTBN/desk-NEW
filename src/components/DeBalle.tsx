import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeBalleProps {
  companyName: string;
  employeeName: string;
}

const DEBALLE_TEMPLATES = {
  general: `Bonjour ! Avez-vous été satisfait(e) de votre expérience avec ${'{company}'} aujourd'hui ?

Si c'est le cas, j'aurais une petite faveur à vous demander : votre avis sur Google m'aiderait énormément à développer notre activité.

C'est très simple et prend moins d'une minute :
1️⃣ Scannez le QR code ou approchez votre téléphone de la carte
2️⃣ Donnez 5 étoiles
3️⃣ Partagez votre avis sur Google

Votre retour est vraiment précieux pour nous ! Merci beaucoup 🙏`,

  service: `Bonjour ! J'espère que l'intervention de ${'{employee}'} de ${'{company}'} vous a plu.

Si vous êtes satisfait(e), nous serions ravis de recevoir votre avis ! Votre retour nous aide à nous améliorer et aide également d'autres clients à nous faire confiance.

Voici comment procéder :
📱 Scannez le QR code sur la carte
⭐ Donnez votre note
🗣️ Partagez votre expérience sur Google

Un grand merci d'avance ! 😊`,

  physical: `Bonjour ! Merci de votre visite chez ${'{company}'} !

Votre avis nous tient à cœur. Si vous avez été satisfait(e), n'hésitez pas à le dire sur Google :
1️⃣ Scannez ce QR code avec votre téléphone
2️⃣ Choisissez vos étoiles
3️⃣ Laissez un avis (c'est rapide !)

Merci pour votre soutien ! 🙌`,
};

export default function DeBalle({ companyName, employeeName }: DeBalleProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof DEBALLE_TEMPLATES>('general');
  const [copied, setCopied] = useState(false);

  const getTemplate = () => {
    const template = DEBALLE_TEMPLATES[selectedTemplate];
    return template
      .replace(/\{company\}/g, companyName)
      .replace(/\{employee\}/g, employeeName);
  };

  const copyToClipboard = () => {
    const text = getTemplate();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "✅ Déballe copiée dans le presse-papiers" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Déballe (Script de Communication)</CardTitle>
        <CardDescription>
          Scripts prêts à utiliser pour vos commerciaux
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Contexte</label>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(DEBALLE_TEMPLATES).map((key) => (
              <Button
                key={key}
                variant={selectedTemplate === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTemplate(key as keyof typeof DEBALLE_TEMPLATES)}
              >
                {key === 'general' && 'Général'}
                {key === 'service' && 'Service'}
                {key === 'physical' && 'Point de vente'}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <pre className="whitespace-pre-wrap text-sm font-sans">
            {getTemplate()}
          </pre>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={copyToClipboard}
            className="flex-1"
            variant={copied ? "default" : "outline"}
          >
            {copied ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copier
              </>
            )}
          </Button>
        </div>

        <div className="pt-4 border-t space-y-2">
          <p className="text-xs text-muted-foreground font-semibold">💡 Conseils d'utilisation</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Adaptez le script selon le type de contact</li>
            <li>• Soyez authentique et bienveillant</li>
            <li>• Montrez la carte NFC/QR code en même temps</li>
            <li>• Reformulez si nécessaire pour rester naturel</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

