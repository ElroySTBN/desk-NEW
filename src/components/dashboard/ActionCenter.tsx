import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ActionCenter = () => {
    const navigate = useNavigate();

    // Fetch clients who have validated onboarding but are still in 'onboarding' stage (implying next step is needed)
    const { data: readyClients, isLoading } = useQuery({
        queryKey: ["clients-ready-action"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("clients")
                .select("id, name, company, magic_link_token")
                .eq("onboarding_status", "validated")
                .eq("lifecycle_stage", "onboarding");

            if (error) throw error;
            return data;
        },
    });

    if (isLoading) return null;
    if (!readyClients || readyClients.length === 0) return null;

    return (
        <Card className="border-l-4 border-l-purple-500 bg-purple-50/10 dark:bg-purple-900/10">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Action Center
                </CardTitle>
                <CardDescription>
                    Actions requises pour faire avancer les clients.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {readyClients.map((client) => (
                    <Alert key={client.id} className="bg-background border-purple-200 dark:border-purple-800">
                        <FileText className="h-4 w-4 text-purple-500" />
                        <div className="flex-1">
                            <AlertTitle className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                                Onboarding Validé : {client.company || client.name}
                            </AlertTitle>
                            <AlertDescription className="text-xs text-muted-foreground mt-1">
                                Le client a validé son identité de marque. Prêt pour la génération de contenu/audit.
                            </AlertDescription>
                        </div>
                        <Button
                            size="sm"
                            className="ml-4 gap-1"
                            onClick={() => navigate(`/clients/${client.id}`)} // Or navigate to a specific generation page
                        >
                            Générer
                            <ArrowRight className="h-3 w-3" />
                        </Button>
                    </Alert>
                ))}
            </CardContent>
        </Card>
    );
};
