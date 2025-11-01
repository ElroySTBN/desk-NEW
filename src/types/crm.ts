export interface Organization {
  id: string;
  user_id: string;
  legal_name: string;
  commercial_name?: string;
  siret?: string;
  tva_number?: string;
  email?: string;
  phone?: string;
  website?: string;
  billing_address?: string;
  billing_postal_code?: string;
  billing_city?: string;
  billing_country?: string;
  status: 'prospect' | 'client' | 'archived';
  type: 'professional';
  monthly_amount?: number;
  start_date?: string;
  next_invoice_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  organization_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  job_title?: string;
  department?: string;
  is_main_contact: boolean;
  is_billing_contact: boolean;
  is_technical_contact: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactWithOrganization extends Contact {
  organization_name?: string;
  organization_commercial_name?: string;
  organization_status?: 'prospect' | 'client' | 'archived';
}

