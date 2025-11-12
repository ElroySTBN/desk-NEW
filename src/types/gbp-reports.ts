export interface GBPReportData {
  client: {
    id: string;
    name: string;
    company?: string;
    logo_url?: string;
  };
  period: {
    month: string; // "Octobre" - mois du rapport (N)
    year: number; // Année du rapport (N)
    // Comparaison avec l'année précédente (N-1)
  };
  kpis: {
    vue_ensemble: {
      current: number; // Valeur du mois N année N
      previous: number; // Valeur du mois N année N-1
      analysis: string; // Analyse générée automatiquement
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



