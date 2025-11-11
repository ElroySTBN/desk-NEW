import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Mail, FileText, Plus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CreateReportModal } from '@/components/reports/gbp/CreateReportModal';
import { sendGBPReportEmail } from '@/lib/emailService';

interface GBPReport {
  id: string;
  client_id: string;
  type: '5_mois' | 'mensuel' | 'complet';
  mois: string;
  annee: number;
  pdf_url: string;
  date_generation: string;
  date_envoi?: string;
  email_envoye: boolean;
  client?: {
    id: string;
    name: string;
    company?: string;
    email?: string;
  };
}

const GBPReports = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<GBPReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('rapports_gbp')
        .select(`
          *,
          clients!inner(id, name, company, email)
        `)
        .eq('user_id', user.id)
        .order('date_generation', { ascending: false });

      if (error) throw error;

      const formattedReports: GBPReport[] = (data || []).map(report => ({
        id: report.id,
        client_id: report.client_id,
        type: report.type,
        mois: report.mois,
        annee: report.annee,
        pdf_url: report.pdf_url,
        date_generation: report.date_generation,
        date_envoi: report.date_envoi,
        email_envoye: report.email_envoye,
        client: report.clients ? {
          id: report.clients.id,
          name: report.clients.name,
          company: report.clients.company,
          email: report.clients.email,
        } : undefined,
      }));

      setReports(formattedReports);
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

  const handleDownload = (pdfUrl: string, clientName: string, mois: string, annee: number) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `rapport-gbp-${clientName}-${mois}-${annee}.pdf`;
    link.click();
  };

  const handleResendEmail = async (report: GBPReport) => {
    if (!report.client?.email) {
      toast({
        title: 'Erreur',
        description: 'Email du client non disponible',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sendGBPReportEmail(
        report.client.email,
        report.pdf_url,
        {
          clientName: report.client.company || report.client.name,
          month: report.mois,
          year: report.annee,
        },
        report.client_id
      );

      // Mettre à jour le rapport
      const { error } = await supabase
        .from('rapports_gbp')
        .update({
          email_envoye: true,
          date_envoi: new Date().toISOString(),
          destinataire_email: report.client.email,
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">📊 Rapports GBP</h1>
          <p className="text-muted-foreground mt-2">
            Rapports mensuels Google Business Profile
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Générer un nouveau rapport
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapports générés</CardTitle>
          <CardDescription>
            Liste de tous les rapports GBP générés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun rapport généré pour le moment</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="mt-4"
                variant="outline"
              >
                Créer votre premier rapport
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date de génération</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.client?.company || report.client?.name || 'Client inconnu'}
                    </TableCell>
                    <TableCell>
                      {report.mois} {report.annee}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {report.type === '5_mois' ? '5 mois' : report.type === 'mensuel' ? 'Mensuel' : 'Complet'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(report.date_generation), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {report.email_envoye ? (
                        <Badge variant="default" className="gap-1">
                          <Mail className="h-3 w-3" />
                          Envoyé
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Brouillon</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(report.pdf_url, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(
                            report.pdf_url,
                            report.client?.company || report.client?.name || 'client',
                            report.mois,
                            report.annee
                          )}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                        {report.client?.email && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendEmail(report)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Renvoyer
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateReportModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={fetchReports}
      />
    </div>
  );
};

export default GBPReports;



