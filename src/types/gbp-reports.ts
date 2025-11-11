export interface GBPReportData {
  client: {
    id: string;
    name: string;
    company?: string;
    logo_url?: string;
  };
  period: {
    startMonth: string; // "Juin"
    endMonth: string; // "Octobre"
    year: number;
  };
  kpis: {
    vue_ensemble: {
      current: number;
      previous: number;
      analysis: string;
    };
    appels: {
      current: number;
      previous: number;
      analysis: string;
    };
    clics_web: {
      current: number;
      previous: number;
      analysis: string;
    };
    itineraire: {
      current: number;
      previous: number;
      analysis: string;
    };
  };
  monthlyKpis?: {
    month: string; // "Octobre"
    vue_ensemble: {
      current: number;
      previous: number;
      analysis: string;
    };
    appels: {
      current: number;
      previous: number;
      analysis: string;
    };
    clics_web: {
      current: number;
      previous: number;
      analysis: string;
    };
    itineraire: {
      current: number;
      previous: number;
      analysis: string;
    };
  };
  screenshots: {
    vue_ensemble: string; // base64 ou URL
    appels: string;
    clics_web: string;
    itineraire: string;
  };
}

export interface ReportTextTemplate {
  id: string;
  user_id: string;
  category: 'vue_ensemble' | 'appels' | 'clics_web' | 'itineraire';
  context: 'positive_high' | 'positive_moderate' | 'stable' | 'negative';
  template: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Evolution {
  difference: number;
  percentage: number;
  direction: 'up' | 'down' | 'stable';
}


