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
      blood_requests: {
        Row: {
          additional_notes: string | null
          blood_type: string
          city: string
          contact_number: string
          created_at: string | null
          hospital_name: string
          id: string
          patient_name: string
          state: string
          status: string | null
          units_needed: number
          updated_at: string | null
          urgency_level: string
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          blood_type: string
          city: string
          contact_number: string
          created_at?: string | null
          hospital_name: string
          id?: string
          patient_name: string
          state: string
          status?: string | null
          units_needed: number
          updated_at?: string | null
          urgency_level: string
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          blood_type?: string
          city?: string
          contact_number?: string
          created_at?: string | null
          hospital_name?: string
          id?: string
          patient_name?: string
          state?: string
          status?: string | null
          units_needed?: number
          updated_at?: string | null
          urgency_level?: string
          user_id?: string
        }
        Relationships: []
      }
      donors: {
        Row: {
          address: string
          blood_type: string
          city: string
          created_at: string | null
          date_of_birth: string
          id: string
          is_available: boolean | null
          last_donation_date: string | null
          state: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          blood_type: string
          city: string
          created_at?: string | null
          date_of_birth: string
          id?: string
          is_available?: boolean | null
          last_donation_date?: string | null
          state: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          blood_type?: string
          city?: string
          created_at?: string | null
          date_of_birth?: string
          id?: string
          is_available?: boolean | null
          last_donation_date?: string | null
          state?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      donor_directory: {
        Row: {
          blood_type: string | null
          city: string | null
          created_at: string | null
          id: string | null
          is_available: boolean | null
          state: string | null
        }
        Insert: {
          blood_type?: string | null
          city?: string | null
          created_at?: string | null
          id?: string | null
          is_available?: boolean | null
          state?: string | null
        }
        Update: {
          blood_type?: string | null
          city?: string | null
          created_at?: string | null
          id?: string | null
          is_available?: boolean | null
          state?: string | null
        }
        Relationships: []
      }
      public_blood_requests: {
        Row: {
          blood_type: string | null
          city: string | null
          contact_info: string | null
          created_at: string | null
          hospital_name: string | null
          id: string | null
          patient_initial: string | null
          state: string | null
          status: string | null
          units_needed: number | null
          urgency_level: string | null
        }
        Insert: {
          blood_type?: string | null
          city?: string | null
          contact_info?: never
          created_at?: string | null
          hospital_name?: string | null
          id?: string | null
          patient_initial?: never
          state?: string | null
          status?: string | null
          units_needed?: number | null
          urgency_level?: string | null
        }
        Update: {
          blood_type?: string | null
          city?: string | null
          contact_info?: never
          created_at?: string | null
          hospital_name?: string | null
          id?: string | null
          patient_initial?: never
          state?: string | null
          status?: string | null
          units_needed?: number | null
          urgency_level?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_donor_contact_info: {
        Args: { p_donor_id: string }
        Returns: {
          blood_type: string
          city: string
          full_name: string
          id: string
          phone: string
          state: string
        }[]
      }
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
