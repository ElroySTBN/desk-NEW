import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Package, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductsManager } from "@/components/settings/ProductsManager";

interface CompanySettings {
  id?: string;
  company_name: string;
  legal_form: string;
  siret: string;
  siren: string;
  tva_number: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  website: string;
  bank_name: string;
  iban: string;
  bic: string;
}

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    company_name: "RaiseMed.IA",
    legal_form: "Auto-Entrepreneur",
    siret: "",
    siren: "",
    tva_number: "",
    address: "",
    postal_code: "",
    city: "",
    country: "France",
    email: "",
    phone: "",
    website: "",
    bank_name: "",
    iban: "",
    bic: "",
  });

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setCompanySettings(data);
      }
    } catch (error: any) {
      console.error("Error fetching company settings:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanySettings = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const settingsData = {
        ...companySettings,
        user_id: user.id,
      };

      if (companySettings.id) {
        const { error } = await supabase
          .from("company_settings")
          .update(settingsData)
          .eq("id", companySettings.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("company_settings")
          .insert(settingsData)
          .select()
          .single();

        if (error) throw error;
        if (data) setCompanySettings(data);
      }

      toast({
        title: "✅ Paramètres enregistrés",
        description: "Les informations de l'entreprise ont été mises à jour.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CompanySettings, value: string) => {
    setCompanySettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Configurez les informations de votre entreprise et votre catalogue de produits
        </p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            Entreprise
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Produits & Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos factures et documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Nom de l'entreprise *</Label>
                  <Input
                    id="company_name"
                    value={companySettings.company_name}
                    onChange={(e) => handleInputChange("company_name", e.target.value)}
                    placeholder="RaiseMed.IA"
                  />
                </div>
                <div>
                  <Label htmlFor="legal_form">Forme juridique</Label>
                  <Input
                    id="legal_form"
                    value={companySettings.legal_form}
                    onChange={(e) => handleInputChange("legal_form", e.target.value)}
                    placeholder="Micro-entreprise"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="siret">SIRET</Label>
                  <Input
                    id="siret"
                    value={companySettings.siret}
                    onChange={(e) => handleInputChange("siret", e.target.value)}
                    placeholder="123 456 789 00012"
                  />
                </div>
                <div>
                  <Label htmlFor="siren">SIREN</Label>
                  <Input
                    id="siren"
                    value={companySettings.siren}
                    onChange={(e) => handleInputChange("siren", e.target.value)}
                    placeholder="123 456 789"
                  />
                </div>
                <div>
                  <Label htmlFor="tva_number">Numéro de TVA</Label>
                  <Input
                    id="tva_number"
                    value={companySettings.tva_number}
                    onChange={(e) => handleInputChange("tva_number", e.target.value)}
                    placeholder="FR12345678901"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adresse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={companySettings.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 rue Example"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input
                    id="postal_code"
                    value={companySettings.postal_code}
                    onChange={(e) => handleInputChange("postal_code", e.target.value)}
                    placeholder="75001"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={companySettings.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={companySettings.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="France"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="contact@raisemed.ia"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  value={companySettings.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://raisemed.ia"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations bancaires</CardTitle>
              <CardDescription>
                Pour les virements bancaires (optionnel)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bank_name">Nom de la banque</Label>
                <Input
                  id="bank_name"
                  value={companySettings.bank_name}
                  onChange={(e) => handleInputChange("bank_name", e.target.value)}
                  placeholder="Banque Example"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={companySettings.iban}
                    onChange={(e) => handleInputChange("iban", e.target.value)}
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                  />
                </div>
                <div>
                  <Label htmlFor="bic">BIC</Label>
                  <Input
                    id="bic"
                    value={companySettings.bic}
                    onChange={(e) => handleInputChange("bic", e.target.value)}
                    placeholder="BNPAFRPPXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveCompanySettings}
              disabled={saving}
              size="lg"
              className="gap-2"
            >
              <Save className="h-5 w-5" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <ProductsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;


