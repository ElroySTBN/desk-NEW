import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Mail, Eye, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CreateReportModal } from '@/components/reports/gbp/CreateReportModal';
import { sendGBPReportEmail } from '@/lib/emailService';

interface ClientGBPReportsTabProps {
  clientId: string;
}

interface GBPReport {
  id: string;
  type: '5_mois' | 'mensuel' | 'complet';
  mois: string;
  annee: number;
  pdf_url: string;
  date_generation: string;
  date_envoi?: string;
  email_envoye: boolean;
  kpis?: any;
}

export function ClientGBPReportsTab({ clientId }: ClientGBPReportsTabProps) {
  const { toast } = useToast();
  const [reports, setReports] = useState<GBPReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [clientId]);

  const fetchReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('rapports_gbp')
        .select('*')
        .eq('user_id', user.id)
        .eq('client_id', clientId)
        .order('date_generation', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (pdfUrl: string, mois: string, annee: number) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `rapport-gbp-${mois}-${annee}.pdf`;
    link.click();
  };

  const handleResendEmail = async (report: GBPReport) => {
    try {
      // Récupérer l'email du client
      const { data: client } = await supabase
        .from('clients')
        .select('email, name, company')
        .eq('id', clientId)
        .single();

      if (!client?.email) {
        toast({
          title: 'Erreur',
          description: 'Email du client non disponible',
          variant: 'destructive',
        });
        return;
      }

      await sendGBPReportEmail(
        client.email,
        report.pdf_url,
        {
          clientName: client.company || client.name,
          month: report.mois,
          year: report.annee,
        },
        clientId
      );

      // Mettre à jour le rapport
      const { error } = await supabase
        .from('rapports_gbp')
        .update({
          email_envoye: true,
          date_envoi: new Date().toISOString(),
          destinataire_email: client.email,
        })
        .eq('id', report.id);

      if (error) throw error;

      toast({
        title: '📧 Email envoyé',
        description: 'Le rapport a été renvoyé au client',
      });

      fetchReports();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Rapports GBP</h2>
          <p className="text-muted-foreground">
            Historique des rapports Google Business Profile
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Générer un rapport
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Aucun rapport généré pour ce client
            </p>
            <Button onClick={() => setShowCreateModal(true)} variant="outline">
              Créer le premier rapport
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Rapport {report.mois} {report.annee}</span>
                  <Badge variant={report.email_envoye ? 'default' : 'secondary'}>
                    {report.email_envoye ? 'Envoyé' : 'Brouillon'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Type: {report.type === '5_mois' ? '5 mois' : report.type === 'mensuel' ? 'Mensuel' : 'Complet'}</p>
                  <p>Généré le: {format(new Date(report.date_generation), 'dd MMM yyyy', { locale: fr })}</p>
                  {report.email_envoye && report.date_envoi && (
                    <p>Envoyé le: {format(new Date(report.date_envoi), 'dd MMM yyyy', { locale: fr })}</p>
                  )}
                </div>

                {report.kpis && (
                  <div className="text-sm space-y-1">
                    <p className="font-medium">KPIs clés :</p>
                    <p>• Interactions: {report.kpis.vue_ensemble?.current?.toLocaleString('fr-FR') || 'N/A'}</p>
                    <p>• Appels: {report.kpis.appels?.current?.toLocaleString('fr-FR') || 'N/A'}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(report.pdf_url, '_blank')}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report.pdf_url, report.mois, report.annee)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResendEmail(report)}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Renvoyer par email
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateReportModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        clientId={clientId}
        onSuccess={fetchReports}
      />
    </div>
  );
}


