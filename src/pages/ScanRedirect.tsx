import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/review-system';
import { Loader2 } from 'lucide-react';

export default function ScanRedirect() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (employeeId) {
      trackScanAndRedirect();
    }
  }, [employeeId]);

  const trackScanAndRedirect = async () => {
    try {
      // 1. Récupérer l'employé
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*, clients(id), organizations(id)')
        .eq('unique_link_id', employeeId)
        .eq('is_active', true)
        .single();

      if (employeeError || !employee) {
        setError('Lien invalide ou inactif');
        return;
      }

      // Determine the appropriate client/organization ID
      const targetId = employee.organization_id || employee.client_id;

      // 2. Tracker le scan
      const userAgent = navigator.userAgent;
      const deviceType = getDeviceType(userAgent);

      const { error: trackError } = await supabase
        .from('scan_tracking')
        .insert({
          employee_id: employee.id,
          client_id: employee.client_id || targetId, // Keep for compatibility
          user_agent: userAgent,
          device_type: deviceType,
          referer: document.referrer || null,
        });

      if (trackError) {
        console.error('Error tracking scan:', trackError);
      }

      // 3. Rediriger vers le funnel d'avis
      // On passe l'ID de l'employé en paramètre pour le tracker dans le funnel
      navigate(`/review/${targetId}?employee=${employee.id}`);
    } catch (error: any) {
      console.error('Error in scan redirect:', error);
      setError('Une erreur est survenue');
    }
  };

  const getDeviceType = (userAgent: string): 'mobile' | 'tablet' | 'desktop' => {
    const ua = userAgent.toLowerCase();
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      return 'mobile';
    }
    
    return 'desktop';
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirection...</h1>
        <p className="text-gray-600">Veuillez patienter</p>
      </div>
    </div>
  );
}

