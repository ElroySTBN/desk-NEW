// Types pour le système de gestion des avis et tracking

// ============================================================================
// EMPLOYEE MANAGEMENT
// ============================================================================

export interface Employee {
  id: string;
  client_id: string;
  organization_id?: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  unique_link_id: string;
  qr_code_data?: string;
  delivery_type?: 'physical' | 'digital' | 'both';
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface EmployeeFormData {
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  delivery_type?: 'physical' | 'digital' | 'both';
  notes?: string;
}

// ============================================================================
// SCAN TRACKING
// ============================================================================

export interface ScanTracking {
  id: string;
  employee_id: string;
  client_id: string;
  scanned_at: string;
  scan_date: string;
  scan_hour: number;
  user_agent?: string;
  ip_address?: string;
  referer?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ScanStats {
  total_scans: number;
  scans_today: number;
  scans_this_week: number;
  scans_this_month: number;
  average_scans_per_day: number;
  most_active_hour: number;
  most_active_day: string;
}

export interface EmployeeScanStatsMonthly {
  employee_id: string;
  employee_name: string;
  client_id: string;
  month: string;
  total_scans: number;
  days_with_scans: number;
}

export interface EmployeeScanStatsDaily {
  employee_id: string;
  employee_name: string;
  client_id: string;
  scan_date: string;
  total_scans: number;
  hours_with_scans: number[];
}

export interface EmployeeScanStatsHourly {
  employee_id: string;
  employee_name: string;
  client_id: string;
  scan_date: string;
  scan_hour: number;
  total_scans: number;
}

// ============================================================================
// REVIEW SETTINGS
// ============================================================================

export interface ReviewPlatform {
  enabled: boolean;
  url: string;
  name?: string;
}

export interface ReviewPlatforms {
  google: ReviewPlatform;
  pages_jaunes: ReviewPlatform;
  trustpilot: ReviewPlatform;
  tripadvisor: ReviewPlatform;
  custom: ReviewPlatform & { name: string };
}

export interface ReviewSettings {
  id: string;
  client_id: string;
  review_platforms: ReviewPlatforms;
  threshold_score: number; // 1-5
  redirect_platform: 'google' | 'pages_jaunes' | 'trustpilot' | 'tripadvisor' | 'custom';
  email_notifications: string[];
  slack_webhook?: string;
  positive_message: string;
  negative_message: string;
  collect_customer_info: boolean;
  require_email: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewSettingsFormData {
  review_platforms: ReviewPlatforms;
  threshold_score: number;
  redirect_platform: ReviewSettings['redirect_platform'];
  email_notifications: string[];
  slack_webhook?: string;
  positive_message: string;
  negative_message: string;
  collect_customer_info: boolean;
  require_email: boolean;
  is_active: boolean;
}

// ============================================================================
// NEGATIVE REVIEWS
// ============================================================================

export interface NegativeReview {
  id: string;
  client_id: string;
  employee_id?: string;
  rating: number; // 1-5
  comment?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  source: 'web' | 'qr' | 'nfc';
  user_agent?: string;
  ip_address?: string;
  status: 'new' | 'read' | 'in_progress' | 'resolved' | 'archived';
  assigned_to?: string;
  response?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NegativeReviewFormData {
  rating: number;
  comment?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface NegativeReviewResponse {
  response: string;
  status: 'in_progress' | 'resolved';
}

// ============================================================================
// POSITIVE REVIEW REDIRECTS
// ============================================================================

export interface PositiveReviewRedirect {
  id: string;
  client_id: string;
  employee_id?: string;
  rating: number;
  platform: string;
  redirected_at: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

// ============================================================================
// FUNNEL D'AVIS
// ============================================================================

export interface ReviewFunnelStep {
  step: 'rating' | 'negative_feedback' | 'redirect' | 'thank_you';
  rating?: number;
}

export interface ReviewSubmission {
  rating: number;
  comment?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  employee_id?: string;
  client_id: string;
}

// ============================================================================
// RAPPORTS
// ============================================================================

export interface MonthlyReport {
  client_id: string;
  client_name: string;
  period: {
    start: string;
    end: string;
    month: string;
  };
  summary: {
    total_scans: number;
    total_employees: number;
    active_employees: number;
    average_scans_per_employee: number;
    total_reviews_collected: number;
    negative_reviews: number;
    positive_redirects: number;
  };
  employees: {
    id: string;
    name: string;
    position?: string;
    total_scans: number;
    scans_by_day: { date: string; count: number }[];
    scans_by_hour: { hour: number; count: number }[];
    rank: number;
  }[];
  top_performers: {
    id: string;
    name: string;
    total_scans: number;
    improvement: number; // % vs mois précédent
  }[];
}

export interface DailyReportData {
  date: string;
  total_scans: number;
  scans_by_employee: {
    employee_id: string;
    employee_name: string;
    count: number;
  }[];
  scans_by_hour: {
    hour: number;
    count: number;
  }[];
}

// ============================================================================
// HELPERS
// ============================================================================

export const RATING_LABELS: Record<number, string> = {
  1: 'Très insatisfait',
  2: 'Insatisfait',
  3: 'Neutre',
  4: 'Satisfait',
  5: 'Très satisfait',
};

export const REVIEW_STATUS_LABELS: Record<NegativeReview['status'], string> = {
  new: 'Nouveau',
  read: 'Lu',
  in_progress: 'En cours',
  resolved: 'Résolu',
  archived: 'Archivé',
};

export const DEVICE_TYPE_ICONS: Record<string, string> = {
  mobile: '📱',
  tablet: '💻',
  desktop: '🖥️',
};

