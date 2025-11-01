import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useEntityType(entityId: string | undefined) {
  const [isOrganization, setIsOrganization] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) {
      setLoading(false);
      return;
    }

    const checkType = async () => {
      // Try organizations first
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('id', entityId)
        .single();

      if (!orgError && orgData) {
        setIsOrganization(true);
      } else {
        setIsOrganization(false);
      }
      
      setLoading(false);
    };

    checkType();
  }, [entityId]);

  return { isOrganization, loading };
}

