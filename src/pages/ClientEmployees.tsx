import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Employee, EmployeeFormData } from '@/types/review-system';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { toast } from 'sonner';
import { 
  UserPlus, 
  QrCode, 
  Download, 
  Edit, 
  Trash2, 
  BarChart3,
  Copy,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';

export default function ClientEmployees() {
  const { id: clientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    position: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [employeeToReassign, setEmployeeToReassign] = useState<Employee | null>(null);
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>('');

  useEffect(() => {
    if (clientId) {
      fetchEmployees();
    }
  }, [clientId]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des employés');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Le nom est obligatoire');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (editingEmployee) {
        // Mise à jour
        const { error } = await supabase
          .from('employees')
          .update({
            name: formData.name,
            position: formData.position,
            email: formData.email,
            phone: formData.phone,
            notes: formData.notes,
          })
          .eq('id', editingEmployee.id);

        if (error) throw error;
        toast.success('Employé modifié avec succès');
      } else {
        // Création
        const { error } = await supabase
          .from('employees')
          .insert({
            client_id: clientId,
            name: formData.name,
            position: formData.position,
            email: formData.email,
            phone: formData.phone,
            notes: formData.notes,
            created_by: user?.id,
          });

        if (error) throw error;
        toast.success('Employé créé avec succès');
      }

      setDialogOpen(false);
      resetForm();
      fetchEmployees();
    } catch (error: any) {
      toast.error('Erreur lors de l\'enregistrement');
      console.error(error);
    }
  };

  const handleDelete = async (employeeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) return;

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;
      toast.success('Employé supprimé');
      fetchEmployees();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  const toggleActive = async (employee: Employee) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: !employee.is_active })
        .eq('id', employee.id);

      if (error) throw error;
      toast.success(employee.is_active ? 'Employé désactivé' : 'Employé activé');
      fetchEmployees();
    } catch (error: any) {
      toast.error('Erreur lors de la modification');
      console.error(error);
    }
  };

  const generateQRCode = async (employee: Employee) => {
    const scanUrl = `${window.location.origin}/scan/${employee.unique_link_id}`;
    
    try {
      const qrDataUrl = await QRCode.toDataURL(scanUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrCodeUrl(qrDataUrl);
      setSelectedEmployee(employee);
      setQrDialogOpen(true);
    } catch (error) {
      toast.error('Erreur lors de la génération du QR code');
      console.error(error);
    }
  };

  const downloadQRCode = () => {
    if (!selectedEmployee || !qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `qr-${selectedEmployee.name.replace(/\s+/g, '-')}.png`;
    link.href = qrCodeUrl;
    link.click();
    toast.success('QR code téléchargé');
  };

  const copyLink = (linkId: string) => {
    const scanUrl = `${window.location.origin}/scan/${linkId}`;
    navigator.clipboard.writeText(scanUrl);
    toast.success('Lien copié dans le presse-papiers');
  };

  const openReassignDialog = (employee: Employee) => {
    setEmployeeToReassign(employee);
    setTargetEmployeeId('');
    setReassignDialogOpen(true);
  };

  const handleReassign = async () => {
    if (!employeeToReassign || !targetEmployeeId) {
      toast.error('Sélectionnez un employé de destination');
      return;
    }

    try {
      // Get target employee's unique_link_id
      const targetEmployee = employees.find(e => e.id === targetEmployeeId);
      if (!targetEmployee) {
        toast.error('Employé de destination non trouvé');
        return;
      }

      // Transfer the unique_link_id from old to new employee
      const { error: updateError } = await supabase
        .from('employees')
        .update({ unique_link_id: employeeToReassign.unique_link_id })
        .eq('id', targetEmployeeId);

      if (updateError) throw updateError;

      // Generate new unique_link_id for the old employee
      const { data: { user } } = await supabase.auth.getUser();
      const { error: newLinkError } = await supabase
        .from('employees')
        .update({ unique_link_id: crypto.randomUUID() })
        .eq('id', employeeToReassign.id);

      if (newLinkError) throw newLinkError;

      toast.success('Lien réattribué avec succès');
      setReassignDialogOpen(false);
      fetchEmployees();
    } catch (error: any) {
      toast.error('Erreur lors de la réattribution');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      email: '',
      phone: '',
      notes: '',
    });
    setEditingEmployee(null);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      position: employee.position || '',
      email: employee.email || '',
      phone: employee.phone || '',
      notes: employee.notes || '',
    });
    setDialogOpen(true);
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
          onClick={() => navigate(`/clients/${clientId}`)}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Équipe</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les membres de votre équipe, leurs liens uniques et QR codes
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un membre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? 'Modifier' : 'Ajouter'} un membre de l'équipe
                </DialogTitle>
                <DialogDescription>
                  Un lien unique et un QR code seront générés automatiquement
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jean Dupont"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Poste</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Commercial, Technicien..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean.dupont@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="06 12 34 56 78"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes internes..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingEmployee ? 'Modifier' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Membres</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter((e) => e.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter((e) => !e.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste de l'Équipe</CardTitle>
          <CardDescription>
            Cliquez sur les icônes pour générer les QR codes et copier les liens
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucun membre</h3>
              <p className="text-muted-foreground mt-2">
                Commencez par ajouter votre premier membre d'équipe
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.position || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {employee.email && <div>{employee.email}</div>}
                        {employee.phone && <div className="text-muted-foreground">{employee.phone}</div>}
                        {!employee.email && !employee.phone && '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={employee.is_active}
                          onCheckedChange={() => toggleActive(employee)}
                        />
                        <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                          {employee.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => generateQRCode(employee)}
                          title="Générer QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyLink(employee.unique_link_id)}
                          title="Copier le lien"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openReassignDialog(employee)}
                          title="Réattribuer le lien"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Link to={`/clients/${clientId}/scan-reports?employee=${employee.id}`}>
                          <Button variant="ghost" size="icon" title="Voir les statistiques">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(employee)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(employee.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code - {selectedEmployee?.name}</DialogTitle>
            <DialogDescription>
              Scannez ce code pour accéder au lien de tracking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center bg-white p-4 rounded-lg">
              {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />}
            </div>

            <div className="space-y-2">
              <Label>Lien de scan</Label>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/scan/${selectedEmployee?.unique_link_id}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => selectedEmployee && copyLink(selectedEmployee.unique_link_id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setQrDialogOpen(false)}>
              Fermer
            </Button>
            <Button onClick={downloadQRCode}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Réattribution Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réattribuer le lien</DialogTitle>
            <DialogDescription>
              Transférer le lien de {employeeToReassign?.name} à un autre employé
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Employé actuel :</p>
              <p className="text-lg">{employeeToReassign?.name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                Lien : {employeeToReassign?.unique_link_id.substring(0, 8)}...
              </p>
            </div>

            <div className="space-y-2">
              <Label>Nouvel employé *</Label>
              <Select value={targetEmployeeId} onValueChange={setTargetEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter(e => e.id !== employeeToReassign?.id)
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Le lien sera transféré à cet employé, et un nouveau lien sera généré pour l'ancien
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleReassign}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Réattribuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

