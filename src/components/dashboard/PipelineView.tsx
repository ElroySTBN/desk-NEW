import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, User, FileText, Rocket, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stages = [
    { id: 'lead', label: 'Leads', icon: User, color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    { id: 'audit', label: 'Audit', icon: FileText, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { id: 'onboarding', label: 'Onboarding', icon: Rocket, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { id: 'production', label: 'Production', icon: CheckCircle, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
];

export const PipelineView = () => {
    const navigate = useNavigate();
    const { data: clients, isLoading } = useQuery({
        queryKey: ["clients-pipeline"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("clients")
                .select("id, name, company, lifecycle_stage, onboarding_status")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    if (isLoading) {
        return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }

    const getClientsByStage = (stage: string) => {
        return clients?.filter(c => c.lifecycle_stage === stage) || [];
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stages.map((stage) => {
                const stageClients = getClientsByStage(stage.id);
                const Icon = stage.icon;

                return (
                    <Card key={stage.id} className="border-t-4" style={{ borderTopColor: 'currentColor' }}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-md ${stage.color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    {stage.label}
                                </div>
                                <Badge variant="secondary">{stageClients.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px] pr-4">
                                <div className="space-y-3">
                                    {stageClients.map((client) => (
                                        <div
                                            key={client.id}
                                            className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors shadow-sm"
                                            onClick={() => navigate(`/clients/${client.id}`)}
                                        >
                                            <div className="font-medium text-sm truncate">{client.company || client.name}</div>
                                            <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                                                <span>{client.name}</span>
                                                {client.onboarding_status === 'validated' && stage.id === 'onboarding' && (
                                                    <Badge variant="default" className="h-5 text-[10px] px-1">Validé</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {stageClients.length === 0 && (
                                        <div className="text-center py-8 text-xs text-muted-foreground border-dashed border-2 rounded-lg">
                                            Aucun client
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
