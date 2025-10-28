import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

// Configuration des identifiants autorisés
// Pour ajouter un utilisateur, ajoutez une entrée ici avec identifiant + email Supabase
const AUTHORIZED_USERS = [
  {
    username: "elroy",
    email: "elroy@raisemed.ia",
    displayName: "Elroy SITBON"
  },
  {
    username: "admin",
    email: "admin@raisemed.ia", 
    displayName: "Administrateur"
  }
];

const Auth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Vérifier si l'identifiant est autorisé
      const authorizedUser = AUTHORIZED_USERS.find(u => u.username === username);
      
      if (!authorizedUser) {
        throw new Error("Identifiant non reconnu");
      }

      // Tentative de connexion avec l'email correspondant
      const { error } = await supabase.auth.signInWithPassword({
        email: authorizedUser.email,
        password,
      });

      if (error) {
        // Si le compte n'existe pas, proposer de le créer automatiquement
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Mot de passe incorrect");
        }
        throw error;
      }

      // Stocker l'identifiant dans localStorage pour affichage
      localStorage.setItem("raisemed_username", username);
      localStorage.setItem("raisemed_displayName", authorizedUser.displayName);

      toast({ 
        title: "Connexion réussie",
        description: `Bienvenue ${authorizedUser.displayName}`
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center py-8">
          <div className="flex justify-center">
            <BrandLogo className="h-40 w-auto" />
          </div>
          <CardDescription className="text-base">
            Connectez-vous à votre espace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Identifiant</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre identifiant"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              🔒 Espace réservé aux utilisateurs autorisés
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
