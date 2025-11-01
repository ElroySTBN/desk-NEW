export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      client_communications: {
        Row: {
          client_id: string
          communication_date: string | null
          content: string
          created_at: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          client_id: string
          communication_date?: string | null
          content: string
          created_at?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          client_id?: string
          communication_date?: string | null
          content?: string
          created_at?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_communications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_kpis: {
        Row: {
          actions: string | null
          client_id: string
          created_at: string | null
          id: string
          improvements: string | null
          kpis_data: Json | null
          month: number
          problems: string | null
          results: string | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          actions?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          improvements?: string | null
          kpis_data?: Json | null
          month: number
          problems?: string | null
          results?: string | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          actions?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          improvements?: string | null
          kpis_data?: Json | null
          month?: number
          problems?: string | null
          results?: string | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_kpis_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          contract_type: string | null
          created_at: string | null
          email: string | null
          id: string
          monthly_amount: number | null
          name: string
          notes: string | null
          phone: string | null
          start_date: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          contract_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          monthly_amount?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          contract_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          monthly_amount?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string | null
          id: string
          name: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_ht: number
          amount_ttc: number
          client_id: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          invoice_number: string
          status: string
          tva_rate: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_ht: number
          amount_ttc: number
          client_id: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          invoice_number: string
          status?: string
          tva_rate?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_ht?: number
          amount_ttc?: number
          client_id?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          invoice_number?: string
          status?: string
          tva_rate?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          id: string
          user_id: string
          company_name: string
          legal_form: string | null
          siret: string | null
          siren: string | null
          tva_number: string | null
          address: string | null
          postal_code: string | null
          city: string | null
          country: string | null
          email: string | null
          phone: string | null
          website: string | null
          logo_url: string | null
          bank_name: string | null
          iban: string | null
          bic: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          company_name?: string
          legal_form?: string | null
          siret?: string | null
          siren?: string | null
          tva_number?: string | null
          address?: string | null
          postal_code?: string | null
          city?: string | null
          country?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          logo_url?: string | null
          bank_name?: string | null
          iban?: string | null
          bic?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          legal_form?: string | null
          siret?: string | null
          siren?: string | null
          tva_number?: string | null
          address?: string | null
          postal_code?: string | null
          city?: string | null
          country?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          logo_url?: string | null
          bank_name?: string | null
          iban?: string | null
          bic?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          user_id: string
          reference: string
          name: string
          description: string | null
          price_ht: number
          tva_rate: number
          subscription_type: string
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          reference: string
          name: string
          description?: string | null
          price_ht: number
          tva_rate?: number
          subscription_type?: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          reference?: string
          name?: string
          description?: string | null
          price_ht?: number
          tva_rate?: number
          subscription_type?: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          user_id: string
          legal_name: string
          commercial_name: string | null
          siret: string | null
          tva_number: string | null
          email: string | null
          phone: string | null
          website: string | null
          billing_address: string | null
          billing_postal_code: string | null
          billing_city: string | null
          billing_country: string | null
          status: string
          type: string
          monthly_amount: number | null
          start_date: string | null
          next_invoice_date: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          legal_name: string
          commercial_name?: string | null
          siret?: string | null
          tva_number?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          billing_address?: string | null
          billing_postal_code?: string | null
          billing_city?: string | null
          billing_country?: string | null
          status?: string
          type?: string
          monthly_amount?: number | null
          start_date?: string | null
          next_invoice_date?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          legal_name?: string
          commercial_name?: string | null
          siret?: string | null
          tva_number?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          billing_address?: string | null
          billing_postal_code?: string | null
          billing_city?: string | null
          billing_country?: string | null
          status?: string
          type?: string
          monthly_amount?: number | null
          start_date?: string | null
          next_invoice_date?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          mobile: string | null
          job_title: string | null
          department: string | null
          is_main_contact: boolean
          is_billing_contact: boolean
          is_technical_contact: boolean
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          mobile?: string | null
          job_title?: string | null
          department?: string | null
          is_main_contact?: boolean
          is_billing_contact?: boolean
          is_technical_contact?: boolean
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          mobile?: string | null
          job_title?: string | null
          department?: string | null
          is_main_contact?: boolean
          is_billing_contact?: boolean
          is_technical_contact?: boolean
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      contacts_with_organization: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          mobile: string | null
          job_title: string | null
          department: string | null
          is_main_contact: boolean
          is_billing_contact: boolean
          is_technical_contact: boolean
          notes: string | null
          created_at: string | null
          updated_at: string | null
          organization_name: string | null
          organization_commercial_name: string | null
          organization_status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
