import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Employee,
  ScanStats,
  EmployeeScanStatsDaily,
  EmployeeScanStatsHourly,
} from '@/types/review-system';
import { useEntityType } from '@/hooks/use-entity-type';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  Download,
  Users,
  Target,
  Award,
  ArrowLeft
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ClientScanReports() {
  const { id: clientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isOrganization } = useEntityType(clientId);
  const [searchParams] = useSearchParams();
  const selectedEmployeeId = searchParams.get('employee');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>(selectedEmployeeId || 'all');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [dailyStats, setDailyStats] = useState<EmployeeScanStatsDaily[]>([]);
  const [hourlyStats, setHourlyStats] = useState<EmployeeScanStatsHourly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      fetchEmployees();
    }
  }, [clientId]);

  useEffect(() => {
    if (selectedEmployee && selectedMonth) {
      fetchStats();
      fetchDailyStats();
      fetchHourlyStats();
    }
  }, [selectedEmployee, selectedMonth]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des employés');
      console.error(error);
    }
  };

  const fetchStats = async () => {
    if (selectedEmployee === 'all') return;

    try {
      const monthStart = startOfMonth(new Date(selectedMonth));
      const monthEnd = endOfMonth(new Date(selectedMonth));

      const { data, error } = await supabase.rpc('get_employee_stats', {
        employee_uuid: selectedEmployee,
        start_date: format(monthStart, 'yyyy-MM-dd'),
        end_date: format(monthEnd, 'yyyy-MM-dd'),
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDailyStats = async () => {
    try {
      const monthStart = startOfMonth(new Date(selectedMonth));
      const monthEnd = endOfMonth(new Date(selectedMonth));

      let query = supabase
        .from('employee_scan_stats_daily')
        .select('*')
        .gte('scan_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('scan_date', format(monthEnd, 'yyyy-MM-dd'));

      if (selectedEmployee !== 'all') {
        query = query.eq('employee_id', selectedEmployee);
      } else {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query.order('scan_date', { ascending: false });

      if (error) throw error;
      setDailyStats(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des stats quotidiennes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHourlyStats = async () => {
    if (selectedEmployee === 'all') return;

    try {
      const monthStart = startOfMonth(new Date(selectedMonth));
      const monthEnd = endOfMonth(new Date(selectedMonth));

      const { data, error } = await supabase
        .from('employee_scan_stats_hourly')
        .select('*')
        .eq('employee_id', selectedEmployee)
        .gte('scan_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('scan_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('scan_date', { ascending: false })
        .order('scan_hour', { ascending: true });

      if (error) throw error;
      setHourlyStats(data || []);
    } catch (error: any) {
      console.error('Error fetching hourly stats:', error);
    }
  };

  const exportToPDF = async () => {
    toast.info('Génération du PDF en cours...');
    // TODO: Implémenter l'export PDF
    setTimeout(() => {
      toast.success('PDF généré (fonctionnalité à implémenter)');
    }, 1000);
  };

  const getMonthOptions = () => {
    const options = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      options.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy', { locale: fr }),
      });
    }
    return options;
  };

  const calculateTotalScans = () => {
    return dailyStats.reduce((sum, day) => sum + (day.total_scans || 0), 0);
  };

  const getTopPerformers = () => {
    const employeeScans: Record<string, { name: string; count: number }> = {};

    dailyStats.forEach((stat) => {
      if (!employeeScans[stat.employee_id]) {
        employeeScans[stat.employee_id] = {
          name: stat.employee_name,
          count: 0,
        };
      }
      employeeScans[stat.employee_id].count += stat.total_scans || 0;
    });

    return Object.entries(employeeScans)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getHourlyDistribution = () => {
    const hourlyCount: Record<number, number> = {};
    
    for (let i = 0; i < 24; i++) {
      hourlyCount[i] = 0;
    }

    hourlyStats.forEach((stat) => {
      hourlyCount[stat.scan_hour] = (hourlyCount[stat.scan_hour] || 0) + (stat.total_scans || 0);
    });

    return hourlyCount;
  };

  const getMostActiveHour = () => {
    const distribution = getHourlyDistribution();
    const maxEntry = Object.entries(distribution).reduce((max, entry) => 
      entry[1] > max[1] ? entry : max
    );
    return { hour: parseInt(maxEntry[0]), count: maxEntry[1] };
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

  const totalScans = calculateTotalScans();
  const topPerformers = selectedEmployee === 'all' ? getTopPerformers() : [];
  const mostActiveHour = selectedEmployee !== 'all' && hourlyStats.length > 0 
    ? getMostActiveHour() 
    : null;

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
          <h1 className="text-3xl font-bold">Rapports de Scans</h1>
          <p className="text-muted-foreground mt-1">
            Statistiques et analyses des scans NFC/QR codes
          </p>
        </div>
        <Button onClick={exportToPDF}>
          <Download className="mr-2 h-4 w-4" />
          Exporter en PDF
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employé</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les employés</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} {emp.position && `(${emp.position})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mois</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats globales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScans}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedEmployee === 'all' ? 'Tous employés' : 'Ce mois'}
            </p>
          </CardContent>
        </Card>

        {stats && selectedEmployee !== 'all' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moyenne / Jour</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.average_scans_per_day?.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sur {dailyStats.length} jour(s)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jour le + actif</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {stats.most_active_day 
                    ? format(new Date(stats.most_active_day), 'dd MMM', { locale: fr })
                    : '-'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Meilleure journée
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heure la + active</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mostActiveHour ? `${mostActiveHour.hour}h` : '-'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mostActiveHour ? `${mostActiveHour.count} scans` : 'Aucune donnée'}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {selectedEmployee === 'all' && employees.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employés actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ce mois
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Performers */}
      {selectedEmployee === 'all' && topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Performers</CardTitle>
            <CardDescription>
              Classement des employés par nombre de scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((performer, index) => (
                <div key={performer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="text-sm font-bold">{index + 1}</span>}
                    </div>
                    <span className="font-medium">{performer.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {performer.count} scans
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats quotidiennes */}
      <Card>
        <CardHeader>
          <CardTitle>Détails par Jour</CardTitle>
          <CardDescription>
            Nombre de scans pour chaque jour du mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyStats.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucune donnée</h3>
              <p className="text-muted-foreground mt-2">
                Aucun scan enregistré pour cette période
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {selectedEmployee === 'all' && <TableHead>Employé</TableHead>}
                  <TableHead className="text-right">Scans</TableHead>
                  <TableHead>Heures actives</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyStats.map((stat) => (
                  <TableRow key={`${stat.scan_date}-${stat.employee_id}`}>
                    <TableCell className="font-medium">
                      {format(new Date(stat.scan_date), 'EEEE dd MMMM', { locale: fr })}
                    </TableCell>
                    {selectedEmployee === 'all' && (
                      <TableCell>{stat.employee_name}</TableCell>
                    )}
                    <TableCell className="text-right">
                      <Badge>{stat.total_scans}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {stat.hours_with_scans?.slice(0, 5).map((hour) => (
                          <Badge key={hour} variant="outline" className="text-xs">
                            {hour}h
                          </Badge>
                        ))}
                        {stat.hours_with_scans?.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{stat.hours_with_scans.length - 5}
                          </Badge>
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

      {/* Distribution horaire */}
      {selectedEmployee !== 'all' && hourlyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribution Horaire</CardTitle>
            <CardDescription>
              Nombre de scans par tranche horaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {Object.entries(getHourlyDistribution()).map(([hour, count]) => (
                <div key={hour} className="flex flex-col items-center p-2 border rounded-lg">
                  <span className="text-xs text-muted-foreground">{hour}h</span>
                  <span className="text-lg font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

