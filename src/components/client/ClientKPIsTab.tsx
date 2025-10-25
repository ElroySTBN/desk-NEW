import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientKPIsTabProps {
  clientId: string;
}

interface KPI {
  name: string;
  value: string;
}

export const ClientKPIsTab = ({ clientId }: ClientKPIsTabProps) => {
  const { toast } = useToast();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState({
    actions: "",
    results: "",
    problems: "",
    improvements: "",
    kpis: [] as KPI[],
  });
  const [kpiId, setKpiId] = useState<string | null>(null);

  useEffect(() => {
    fetchKPIs();
  }, [month, year]);

  const fetchKPIs = async () => {
    const { data: kpiData } = await supabase
      .from("client_kpis")
      .select("*")
      .eq("client_id", clientId)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

    if (kpiData) {
      setKpiId(kpiData.id);
      setData({
        actions: kpiData.actions || "",
        results: kpiData.results || "",
        problems: kpiData.problems || "",
        improvements: kpiData.improvements || "",
        kpis: Array.isArray(kpiData.kpis_data) ? kpiData.kpis_data as unknown as KPI[] : [],
      });
    } else {
      setKpiId(null);
      setData({
        actions: "",
        results: "",
        problems: "",
        improvements: "",
        kpis: [],
      });
    }
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      client_id: clientId,
      user_id: user.id,
      month,
      year,
      actions: data.actions,
      results: data.results,
      problems: data.problems,
      improvements: data.improvements,
      kpis_data: data.kpis as any,
    };

    if (kpiId) {
      const { error } = await supabase
        .from("client_kpis")
        .update(payload)
        .eq("id", kpiId);

      if (error) {
        toast({ title: "Erreur", description: "Impossible de mettre à jour", variant: "destructive" });
      } else {
        toast({ title: "Succès", description: "KPIs mis à jour" });
      }
    } else {
      const { error } = await supabase.from("client_kpis").insert(payload);

      if (error) {
        toast({ title: "Erreur", description: "Impossible de créer", variant: "destructive" });
      } else {
        toast({ title: "Succès", description: "KPIs créés" });
        fetchKPIs();
      }
    }
  };

  const addKPI = () => {
    setData({ ...data, kpis: [...data.kpis, { name: "", value: "" }] });
  };

  const removeKPI = (index: number) => {
    setData({ ...data, kpis: data.kpis.filter((_, i) => i !== index) });
  };

  const updateKPI = (index: number, field: "name" | "value", value: string) => {
    const newKPIs = [...data.kpis];
    newKPIs[index][field] = value;
    setData({ ...data, kpis: newKPIs });
  };

  const months = [
    { value: 1, label: "Janvier" },
    { value: 2, label: "Février" },
    { value: 3, label: "Mars" },
    { value: 4, label: "Avril" },
    { value: 5, label: "Mai" },
    { value: 6, label: "Juin" },
    { value: 7, label: "Juillet" },
    { value: 8, label: "Août" },
    { value: 9, label: "Septembre" },
    { value: 10, label: "Octobre" },
    { value: 11, label: "Novembre" },
    { value: 12, label: "Décembre" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sélectionner le mois</CardTitle>
          <div className="flex gap-3">
            <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions réalisées</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={data.actions}
            onChange={(e) => setData({ ...data, actions: e.target.value })}
            placeholder="Décrivez les actions réalisées ce mois-ci..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résultats obtenus</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={data.results}
            onChange={(e) => setData({ ...data, results: e.target.value })}
            placeholder="Décrivez les résultats obtenus..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>KPIs personnalisés</CardTitle>
          <Button onClick={addKPI} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter KPI
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.kpis.map((kpi, index) => (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <Label>Nom du KPI</Label>
                <Input
                  value={kpi.name}
                  onChange={(e) => updateKPI(index, "name", e.target.value)}
                  placeholder="Ex: Leads générés"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Valeur</Label>
                <Input
                  value={kpi.value}
                  onChange={(e) => updateKPI(index, "value", e.target.value)}
                  placeholder="Ex: 50"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeKPI(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Problèmes & solutions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={data.problems}
            onChange={(e) => setData({ ...data, problems: e.target.value })}
            placeholder="Décrivez les problèmes rencontrés et leurs solutions..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plans d'amélioration</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={data.improvements}
            onChange={(e) => setData({ ...data, improvements: e.target.value })}
            placeholder="Décrivez les plans d'amélioration..."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Enregistrer le mois
        </Button>
      </div>
    </div>
  );
};
