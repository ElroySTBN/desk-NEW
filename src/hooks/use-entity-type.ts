import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useEntityType(entityId: string | undefined) {
  // Dans le nouveau schéma TDAH, tout est un client
  // Ce hook est conservé pour compatibilité mais retourne toujours false
  const [isOrganization, setIsOrganization] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) {
      setLoading(false);
      return;
    }

    // Vérifier si c'est un client
    const checkType = async () => {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', entityId)
        .single();

      // Dans le nouveau schéma, tout est un client, pas d'organizations
      setIsOrganization(false);
      setLoading(false);
    };

    checkType();
  }, [entityId]);

  return { isOrganization, loading };
}

