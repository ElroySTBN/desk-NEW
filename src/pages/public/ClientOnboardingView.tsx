import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types (simplified for this view)
interface ClientData {
    id: string;
    name: string;
    onboarding_status: string;
}

interface BrandDna {
    id?: string;
    visual_identity: any;
    tone_of_voice: any;
    target_avatar: any;
    services_focus: any;
    key_info: any;
}

const ClientOnboardingView = () => {
    const { token } = useParams<{ token: string }>();
    const [dnaForm, setDnaForm] = useState<BrandDna>({
        visual_identity: {},
        tone_of_voice: {},
        target_avatar: {},
        services_focus: {},
        key_info: {}
    });

    // Fetch Client Data via Edge Function
    const { data, isLoading, error } = useQuery({
        queryKey: ["client-onboarding", token],
        queryFn: async () => {
            const { data, error } = await supabase.functions.invoke('get_client_by_token', {
                body: { token }
            });
            if (error) throw error;
            if (data.error) throw new Error(data.error);
            return data as { client: ClientData; brandDna: BrandDna };
        },
        enabled: !!token,
        retry: false
    });

    // Update local state when data loads
    useEffect(() => {
        if (data?.brandDna) {
            setDnaForm({
                ...dnaForm,
                ...data.brandDna
            });
        }
    }, [data]);

    // Mutation to save changes
    const saveMutation = useMutation({
        mutationFn: async (updatedDna: BrandDna) => {
            // In a real scenario, we'd use another Edge Function or RLS policy to allow update via token
            // For now, we'll assume an Edge Function 'update_client_dna' exists or we use the same one with a different method
            // BUT, since we are in "Public View" without auth, we MUST use an Edge Function to write securely using the token.

            const { data, error } = await supabase.functions.invoke('update_client_dna', {
                body: { token, dna: updatedDna }
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast.success("Sauvegardé avec succès");
        },
        onError: (err) => {
            toast.error("Erreur lors de la sauvegarde: " + err.message);
        }
    });

    const validateMutation = useMutation({
        mutationFn: async () => {
            const { data, error } = await supabase.functions.invoke('validate_onboarding', {
                body: { token }
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast.success("Onboarding validé ! L'équipe a été notifiée.");
            // Refresh data to show locked state
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Accès Refusé</CardTitle>
                        <CardDescription>Le lien est invalide ou a expiré.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const isLocked = data.client.onboarding_status === 'validated' || data.client.onboarding_status === 'completed';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Bienvenue, {data.client.name}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Validez votre identité de marque pour nous permettre de générer votre contenu.
                    </p>
                </div>

                {isLocked && (
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle>Onboarding Validé</AlertTitle>
                        <AlertDescription>
                            Merci ! Vos informations ont été transmises à l'équipe. Vous ne pouvez plus les modifier.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Brand Identity Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Identité Visuelle & Ton</CardTitle>
                        <CardDescription>Définissez comment votre marque s'exprime.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Couleurs Principales (Hex)</label>
                                <Input
                                    disabled={isLocked}
                                    placeholder="#000000, #FFFFFF"
                                    value={dnaForm.visual_identity?.colors || ''}
                                    onChange={(e) => setDnaForm({ ...dnaForm, visual_identity: { ...dnaForm.visual_identity, colors: e.target.value } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ton de Voix (Adjectifs)</label>
                                <Input
                                    disabled={isLocked}
                                    placeholder="Professionnel, Amical, Expert..."
                                    value={dnaForm.tone_of_voice?.style || ''}
                                    onChange={(e) => setDnaForm({ ...dnaForm, tone_of_voice: { ...dnaForm.tone_of_voice, style: e.target.value } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description du Client Idéal (Avatar)</label>
                                <Textarea
                                    disabled={isLocked}
                                    placeholder="Propriétaire de maison, 40-60 ans, soucieux de la qualité..."
                                    className="min-h-[100px]"
                                    value={dnaForm.target_avatar?.description || ''}
                                    onChange={(e) => setDnaForm({ ...dnaForm, target_avatar: { ...dnaForm.target_avatar, description: e.target.value } })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    {!isLocked && (
                        <>
                            <Button variant="outline" onClick={() => saveMutation.mutate(dnaForm)} disabled={saveMutation.isPending}>
                                Sauvegarder le brouillon
                            </Button>
                            <Button onClick={() => validateMutation.mutate()} disabled={validateMutation.isPending}>
                                Valider mon Identité de Marque
                            </Button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ClientOnboardingView;
