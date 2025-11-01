import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { NegativeReview, REVIEW_STATUS_LABELS, RATING_LABELS } from '@/types/review-system';
import { useEntityType } from '@/hooks/use-entity-type';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  MessageSquare,
  Star,
  Mail,
  Phone,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Archive,
  Eye,
  Send,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ClientNegativeReviews() {
  const { id: clientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isOrganization } = useEntityType(clientId);
  const [reviews, setReviews] = useState<NegativeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<NegativeReview | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (clientId) {
      fetchReviews();
    }
  }, [clientId, filterStatus]);

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from('negative_reviews')
        .select(`
          *,
          employees (name)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des avis');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reviewId: string, status: NegativeReview['status']) => {
    try {
      const { error } = await supabase
        .from('negative_reviews')
        .update({ status })
        .eq('id', reviewId);

      if (error) throw error;
      toast.success('Statut mis à jour');
      fetchReviews();
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    }
  };

  const submitResponse = async () => {
    if (!selectedReview || !responseText.trim()) {
      toast.error('Veuillez saisir une réponse');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('negative_reviews')
        .update({
          response: responseText,
          responded_at: new Date().toISOString(),
          assigned_to: user?.id,
          status: 'resolved',
        })
        .eq('id', selectedReview.id);

      if (error) throw error;
      toast.success('Réponse enregistrée');
      setDialogOpen(false);
      setResponseText('');
      setSelectedReview(null);
      fetchReviews();
    } catch (error: any) {
      toast.error('Erreur lors de l\'enregistrement');
      console.error(error);
    }
  };

  const openReviewDialog = (review: NegativeReview) => {
    setSelectedReview(review);
    setResponseText(review.response || '');
    setDialogOpen(true);

    // Marquer comme lu si c'est nouveau
    if (review.status === 'new') {
      updateStatus(review.id, 'read');
    }
  };

  const getStatusIcon = (status: NegativeReview['status']) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'read':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: NegativeReview['status']) => {
    switch (status) {
      case 'new':
        return 'destructive';
      case 'read':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'default';
      case 'archived':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const statsData = {
    total: reviews.length,
    new: reviews.filter((r) => r.status === 'new').length,
    inProgress: reviews.filter((r) => r.status === 'in_progress').length,
    resolved: reviews.filter((r) => r.status === 'resolved').length,
    averageRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(isOrganization ? `/organizations/${clientId}` : `/clients/${clientId}`)}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Avis Négatifs</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les avis négatifs collectés en privé
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{statsData.new}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{statsData.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolus</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{statsData.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.averageRating} / 5</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtre */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label>Filtrer par statut :</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="new">Nouveaux</SelectItem>
                <SelectItem value="read">Lus</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="resolved">Résolus</SelectItem>
                <SelectItem value="archived">Archivés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Avis</CardTitle>
          <CardDescription>
            Cliquez sur un avis pour voir les détails et répondre
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucun avis</h3>
              <p className="text-muted-foreground mt-2">
                {filterStatus === 'all'
                  ? 'Aucun avis négatif collecté'
                  : `Aucun avis avec le statut "${REVIEW_STATUS_LABELS[filterStatus as NegativeReview['status']]}"`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Commentaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow 
                    key={review.id} 
                    className={review.status === 'new' ? 'bg-red-50' : ''}
                  >
                    <TableCell className="font-medium">
                      {format(new Date(review.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getRatingStars(review.rating)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {review.customer_name && <div className="font-medium">{review.customer_name}</div>}
                        {review.customer_email && <div className="text-muted-foreground">{review.customer_email}</div>}
                        {review.customer_phone && <div className="text-muted-foreground">{review.customer_phone}</div>}
                        {!review.customer_name && !review.customer_email && !review.customer_phone && (
                          <span className="text-muted-foreground">Anonyme</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(review as any).employees?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm">
                        {review.comment || <span className="text-muted-foreground italic">Aucun commentaire</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(review.status)}
                        <Badge variant={getStatusBadgeVariant(review.status)}>
                          {REVIEW_STATUS_LABELS[review.status]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openReviewDialog(review)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
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

      {/* Dialog de détails */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'avis</DialogTitle>
            <DialogDescription>
              {selectedReview && format(new Date(selectedReview.created_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-6">
              {/* Note */}
              <div>
                <Label>Évaluation</Label>
                <div className="flex items-center gap-2 mt-1">
                  {getRatingStars(selectedReview.rating)}
                  <span className="text-sm text-muted-foreground">
                    {RATING_LABELS[selectedReview.rating]}
                  </span>
                </div>
              </div>

              {/* Commentaire */}
              {selectedReview.comment && (
                <div>
                  <Label>Commentaire</Label>
                  <div className="mt-1 p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedReview.comment}</p>
                  </div>
                </div>
              )}

              {/* Informations client */}
              <div className="grid gap-4 md:grid-cols-2">
                {selectedReview.customer_name && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nom
                    </Label>
                    <p className="mt-1 text-sm">{selectedReview.customer_name}</p>
                  </div>
                )}

                {selectedReview.customer_email && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="mt-1 text-sm">{selectedReview.customer_email}</p>
                  </div>
                )}

                {selectedReview.customer_phone && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </Label>
                    <p className="mt-1 text-sm">{selectedReview.customer_phone}</p>
                  </div>
                )}
              </div>

              {/* Statut */}
              <div>
                <Label>Statut actuel</Label>
                <div className="flex gap-2 mt-2">
                  <Select
                    value={selectedReview.status}
                    onValueChange={(value: NegativeReview['status']) => 
                      updateStatus(selectedReview.id, value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nouveau</SelectItem>
                      <SelectItem value="read">Lu</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="resolved">Résolu</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Réponse */}
              <div>
                <Label>Votre réponse</Label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Rédigez une réponse au client..."
                  rows={4}
                  className="mt-1"
                />
                {selectedReview.responded_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Répondu le {format(new Date(selectedReview.responded_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Fermer
            </Button>
            <Button onClick={submitResponse}>
              <Send className="mr-2 h-4 w-4" />
              Enregistrer la réponse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

