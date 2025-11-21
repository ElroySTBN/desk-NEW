import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { injectPrompt, PROMPT_TEMPLATES } from "@/lib/prompt-injector";
import { toast } from "sonner";

export const ContentFactory = () => {
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [contentType, setContentType] = useState<keyof typeof PROMPT_TEMPLATES>("LINKEDIN_POST");
    const [generatedContent, setGeneratedContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    // Fetch Clients with validated DNA
    const { data: clients } = useQuery({
        queryKey: ["clients-with-dna"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("clients")
                .select("id, name, company")
                .eq("onboarding_status", "validated"); // Only those ready
            if (error) throw error;
            return data;
        },
    });

    // Fetch DNA for selected client
    const { data: selectedClientDna } = useQuery({
        queryKey: ["client-dna", selectedClientId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("brand_dna")
                .select("*")
                .eq("client_id", selectedClientId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!selectedClientId,
    });

    const handleGenerate = async () => {
        if (!selectedClientId || !selectedClientDna) return;

        setIsGenerating(true);
        try {
            // 1. Prepare the prompt
            const client = clients?.find(c => c.id === selectedClientId);
            if (!client) throw new Error("Client not found");

            const prompt = injectPrompt(PROMPT_TEMPLATES[contentType], {
                client: client as any, // Type assertion for simplicity here
                dna: selectedClientDna
            });

            // 2. Call AI (Simulated for now, or use Edge Function)
            // In a real app, we would send 'prompt' to an Edge Function wrapping OpenAI

            // SIMULATION
            await new Promise(resolve => setTimeout(resolve, 2000));
            const simulatedResponse = `[CONTENU GÉNÉRÉ PAR L'IA POUR ${client.company || client.name}]\n\n` +
                `Type: ${contentType}\n` +
                `Ton: ${(selectedClientDna.tone_of_voice as any)?.style}\n\n` +
                `Voici une proposition de contenu engageant qui respecte votre identité de marque...\n\n` +
                `#Marketing #Croissance #${(client.company || 'Business').replace(/\s/g, '')}`;

            setGeneratedContent(simulatedResponse);
            toast.success("Contenu généré avec succès !");

        } catch (error) {
            toast.error("Erreur lors de la génération");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Copié dans le presse-papier");
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-purple-500" />
                        Content Factory
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        L'IA génère du contenu ultra-personnalisé basé sur le Brand DNA de vos clients.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>Sélectionnez le contexte</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Client (Validé)</label>
                            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir un client..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients?.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.company || client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type de Contenu</label>
                            <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LINKEDIN_POST">Post LinkedIn</SelectItem>
                                    <SelectItem value="GMB_POST">Post Google Business</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                            size="lg"
                            onClick={handleGenerate}
                            disabled={!selectedClientId || isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Génération en cours...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Générer le Contenu
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Result Panel */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Résultat</CardTitle>
                        {generatedContent && (
                            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                                {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                                {copied ? "Copié !" : "Copier"}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            className="min-h-[400px] font-mono text-sm bg-slate-50 dark:bg-slate-900 resize-none p-4"
                            value={generatedContent}
                            readOnly
                            placeholder="Le contenu généré apparaîtra ici..."
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ContentFactory;
