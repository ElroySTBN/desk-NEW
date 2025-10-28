import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id?: string;
  reference: string;
  name: string;
  description: string;
  price_ht: number;
  tva_rate: number;
  subscription_type: "mensuel" | "trimestriel" | "semestriel" | "annuel" | "ponctuel";
  is_active: boolean;
}

export const ProductsManager = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>({
    reference: "",
    name: "",
    description: "",
    price_ht: 0,
    tva_rate: 20,
    subscription_type: "mensuel",
    is_active: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        reference: "",
        name: "",
        description: "",
        price_ht: 0,
        tva_rate: 20,
        subscription_type: "mensuel",
        is_active: true,
      });
    }
    setShowDialog(true);
  };

  const handleSaveProduct = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const productData = {
        ...formData,
        user_id: user.id,
      };

      if (editingProduct?.id) {
        // Update
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;

        toast({
          title: "Produit modifié",
          description: `${formData.name} a été mis à jour.`,
        });
      } else {
        // Insert
        const { error } = await supabase
          .from("products")
          .insert(productData);

        if (error) throw error;

        toast({
          title: "Produit ajouté",
          description: `${formData.name} a été ajouté au catalogue.`,
        });
      }

      setShowDialog(false);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Produit supprimé",
        description: "Le produit a été retiré du catalogue.",
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getSubscriptionLabel = (type: string) => {
    const labels: Record<string, string> = {
      mensuel: "Mensuel",
      trimestriel: "Trimestriel",
      semestriel: "Semestriel",
      annuel: "Annuel",
      ponctuel: "Ponctuel",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Catalogue de produits & services</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {products.length} produit(s) au catalogue
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau produit
          </Button>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Aucun produit dans votre catalogue
              </p>
              <Button onClick={() => handleOpenDialog()} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter votre premier produit
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prix HT</TableHead>
                  <TableHead>TVA</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.reference}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.price_ht.toLocaleString("fr-FR")} €</TableCell>
                    <TableCell>{product.tva_rate}%</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getSubscriptionLabel(product.subscription_type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog for add/edit product */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Modifier le produit" : "Nouveau produit"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reference">Référence *</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="GBP-MENSUEL"
                />
              </div>
              <div>
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Google Business Profile - Abonnement Mensuel"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Gestion complète de votre profil Google Business..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price_ht">Prix HT *</Label>
                <Input
                  id="price_ht"
                  type="number"
                  step="0.01"
                  value={formData.price_ht}
                  onChange={(e) => setFormData({ ...formData, price_ht: parseFloat(e.target.value) })}
                  placeholder="150.00"
                />
              </div>
              <div>
                <Label htmlFor="tva_rate">TVA (%)</Label>
                <Input
                  id="tva_rate"
                  type="number"
                  step="0.01"
                  value={formData.tva_rate}
                  onChange={(e) => setFormData({ ...formData, tva_rate: parseFloat(e.target.value) })}
                  placeholder="20"
                />
              </div>
              <div>
                <Label htmlFor="subscription_type">Type d'abonnement</Label>
                <Select
                  value={formData.subscription_type}
                  onValueChange={(value: any) => setFormData({ ...formData, subscription_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensuel">Mensuel</SelectItem>
                    <SelectItem value="trimestriel">Trimestriel</SelectItem>
                    <SelectItem value="semestriel">Semestriel</SelectItem>
                    <SelectItem value="annuel">Annuel</SelectItem>
                    <SelectItem value="ponctuel">Ponctuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Produit actif (visible dans le catalogue)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveProduct}>
              {editingProduct ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};


