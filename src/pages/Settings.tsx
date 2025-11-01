import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Package, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductsManager } from "@/components/settings/ProductsManager";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";

const Settings = () => {
  const { toast } = useToast();
  const { company, updateCompany, resetToDefaults } = useCompanyConfig();

  const handleSaveCompanySettings = () => {
    toast({
      title: "✅ Paramètres enregistrés",
      description: "Les informations de l'entreprise ont été mises à jour localement.",
    });
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    toast({
      title: "🔄 Réinitialisation effectuée",
      description: "Les paramètres ont été restaurés aux valeurs par défaut.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    updateCompany({ [field]: value });
  };


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
                    value={company.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="RaiseMed.IA"
                  />
                </div>
                <div>
                  <Label htmlFor="legal_form">Forme juridique</Label>
                  <Input
                    id="legal_form"
                    value={company.legalForm}
                    onChange={(e) => handleInputChange("legalForm", e.target.value)}
                    placeholder="Micro-entreprise"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="siret">SIRET</Label>
                  <Input
                    id="siret"
                    value={company.siret}
                    onChange={(e) => handleInputChange("siret", e.target.value)}
                    placeholder="123 456 789 00012"
                  />
                </div>
                <div>
                  <Label htmlFor="siren">SIREN</Label>
                  <Input
                    id="siren"
                    value={company.siren}
                    onChange={(e) => handleInputChange("siren", e.target.value)}
                    placeholder="123 456 789"
                  />
                </div>
                <div>
                  <Label htmlFor="tva_number">Numéro de TVA</Label>
                  <Input
                    id="tva_number"
                    value={company.tvaNumber}
                    onChange={(e) => handleInputChange("tvaNumber", e.target.value)}
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
                  value={company.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 rue Example"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input
                    id="postal_code"
                    value={company.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    placeholder="75001"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={company.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={company.country}
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
                    value={company.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="contact@raisemed.ia"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={company.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  value={company.website}
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
                  value={company.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                  placeholder="Banque Example"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={company.iban}
                    onChange={(e) => handleInputChange("iban", e.target.value)}
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                  />
                </div>
                <div>
                  <Label htmlFor="bic">BIC</Label>
                  <Input
                    id="bic"
                    value={company.bic}
                    onChange={(e) => handleInputChange("bic", e.target.value)}
                    placeholder="BNPAFRPPXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <Button
              onClick={handleResetToDefaults}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Réinitialiser
            </Button>
            <Button
              onClick={handleSaveCompanySettings}
              size="lg"
              className="gap-2"
            >
              <Save className="h-5 w-5" />
              Enregistrer (local)
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


