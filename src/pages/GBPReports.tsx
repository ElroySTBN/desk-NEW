import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Mail, FileText, Plus, Eye, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, subMonths } from 'date-fns';
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

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const GBPReports = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<GBPReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generatingMonthly, setGeneratingMonthly] = useState(false);

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

  const handleDownload = async (pdfUrl: string, clientName: string, mois: string, annee: number) => {
    try {
      // Vérifier que l'URL est accessible
      const response = await fetch(pdfUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Le fichier n'est pas accessible (${response.status})`);
      }

      // Télécharger le fichier
      const blob = await fetch(pdfUrl).then(r => r.blob());
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-gbp-${clientName}-${mois}-${annee}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: 'Erreur de téléchargement',
        description: error.message || 'Impossible de télécharger le rapport. Vérifiez que le bucket est public.',
        variant: 'destructive',
      });
    }
  };

  const handleView = async (pdfUrl: string) => {
    try {
      // Vérifier que l'URL est accessible
      const response = await fetch(pdfUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Le fichier n'est pas accessible (${response.status})`);
      }
      window.open(pdfUrl, '_blank');
    } catch (error: any) {
      toast({
        title: 'Erreur de visualisation',
        description: error.message || 'Impossible d\'afficher le rapport. Vérifiez que le bucket est public.',
        variant: 'destructive',
      });
    }
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

  const handleGenerateMonthlyReports = async () => {
    setGeneratingMonthly(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculer le mois précédent
      const now = new Date();
      const previousMonth = subMonths(now, 1);
      const monthIndex = previousMonth.getMonth();
      const month = MONTHS[monthIndex];
      const year = previousMonth.getFullYear();

      // Récupérer tous les clients actifs
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, company, email, logo_url')
        .eq('user_id', user.id)
        .eq('statut', 'actif');

      if (clientsError) throw clientsError;

      if (!clients || clients.length === 0) {
        toast({
          title: 'Aucun client actif',
          description: 'Aucun client actif trouvé pour générer les rapports',
        });
        return;
      }

      // Vérifier quels rapports existent déjà
      const { data: existingReports } = await supabase
        .from('rapports_gbp')
        .select('client_id')
        .eq('user_id', user.id)
        .eq('mois', month)
        .eq('annee', year)
        .eq('type', 'mensuel');

      const existingClientIds = new Set(existingReports?.map(r => r.client_id) || []);

      // Filtrer les clients qui n'ont pas encore de rapport pour ce mois
      const clientsToProcess = clients.filter(c => !existingClientIds.has(c.id));

      if (clientsToProcess.length === 0) {
        toast({
          title: 'Rapports déjà générés',
          description: `Tous les rapports mensuels pour ${month} ${year} ont déjà été générés`,
        });
        return;
      }

      toast({
        title: 'Génération en cours',
        description: `Génération des rapports mensuels pour ${clientsToProcess.length} client(s)...`,
      });

      // Note: Pour générer les rapports, l'utilisateur devra uploader les captures d'écran manuellement
      // On ouvre simplement le modal pour chaque client
      // Dans une implémentation complète, on pourrait automatiser si les captures sont déjà stockées
      
      toast({
        title: '⚠️ Action manuelle requise',
        description: `Veuillez générer manuellement les rapports pour ${clientsToProcess.length} client(s) pour ${month} ${year}. Les captures d'écran doivent être uploadées.`,
      });

      // Rafraîchir la liste
      fetchReports();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setGeneratingMonthly(false);
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
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateMonthlyReports} 
            size="lg" 
            variant="outline"
            className="gap-2"
            disabled={generatingMonthly}
          >
            <Calendar className="h-5 w-5" />
            {generatingMonthly ? 'Génération...' : 'Générer rapports mensuels'}
          </Button>
          <Button onClick={() => setShowCreateModal(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Générer un nouveau rapport
          </Button>
        </div>
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
                          onClick={() => handleView(report.pdf_url)}
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



