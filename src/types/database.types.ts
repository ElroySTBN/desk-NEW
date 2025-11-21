export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          name: string
          email: string | null
          phone: string | null
          status: string | null
          magic_link_token: string
          onboarding_status: 'pending' | 'sent_to_client' | 'validated' | 'completed'
          lifecycle_stage: 'lead' | 'audit' | 'onboarding' | 'production' | 'churn'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          name: string
          email?: string | null
          phone?: string | null
          status?: string | null
          magic_link_token?: string
          onboarding_status?: 'pending' | 'sent_to_client' | 'validated' | 'completed'
          lifecycle_stage?: 'lead' | 'audit' | 'onboarding' | 'production' | 'churn'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          status?: string | null
          magic_link_token?: string
          onboarding_status?: 'pending' | 'sent_to_client' | 'validated' | 'completed'
          lifecycle_stage?: 'lead' | 'audit' | 'onboarding' | 'production' | 'churn'
        }
      }
      brand_dna: {
        Row: {
          id: string
          client_id: string | null
          visual_identity: Json
          tone_of_voice: Json
          target_avatar: Json
          services_focus: Json
          key_info: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          visual_identity?: Json
          tone_of_voice?: Json
          target_avatar?: Json
          services_focus?: Json
          key_info?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          visual_identity?: Json
          tone_of_voice?: Json
          target_avatar?: Json
          services_focus?: Json
          key_info?: Json
          created_at?: string
          updated_at?: string
        }
      }
      audits: {
        Row: {
          id: string
          created_at: string
          client_id: string | null
          url: string | null
          status: string | null
          overall_score: number | null
          details: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          client_id?: string | null
          url?: string | null
          status?: string | null
          overall_score?: number | null
          details?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          client_id?: string | null
          url?: string | null
          status?: string | null
          overall_score?: number | null
          details?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
