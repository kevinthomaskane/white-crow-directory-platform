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
      business_categories: {
        Row: {
          business_id: string
          category_id: string
        }
        Insert: {
          business_id: string
          category_id: string
        }
        Update: {
          business_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      business_review_sources: {
        Row: {
          business_id: string
          id: string
          last_synced_at: string | null
          provider: string
          rating: number | null
          review_count: number | null
          url: string | null
        }
        Insert: {
          business_id: string
          id?: string
          last_synced_at?: string | null
          provider: string
          rating?: number | null
          review_count?: number | null
          url?: string | null
        }
        Update: {
          business_id?: string
          id?: string
          last_synced_at?: string | null
          provider?: string
          rating?: number | null
          review_count?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_review_sources_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_reviews: {
        Row: {
          author_id: string | null
          author_image_url: string | null
          author_name: string | null
          author_url: string | null
          business_id: string
          created_at: string | null
          id: string
          rating: number | null
          raw: Json | null
          review_id: string
          source: string
          text: string | null
          time: string | null
        }
        Insert: {
          author_id?: string | null
          author_image_url?: string | null
          author_name?: string | null
          author_url?: string | null
          business_id: string
          created_at?: string | null
          id?: string
          rating?: number | null
          raw?: Json | null
          review_id: string
          source: string
          text?: string | null
          time?: string | null
        }
        Update: {
          author_id?: string | null
          author_image_url?: string | null
          author_name?: string | null
          author_url?: string | null
          business_id?: string
          created_at?: string | null
          id?: string
          rating?: number | null
          raw?: Json | null
          review_id?: string
          source?: string
          text?: string | null
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_submissions: {
        Row: {
          admin_notes: string | null
          business_email: string
          business_id: string | null
          business_name: string
          business_website: string | null
          category_id: string
          city_id: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          site_id: string
          status: string
          submitted_at: string
        }
        Insert: {
          admin_notes?: string | null
          business_email: string
          business_id?: string | null
          business_name: string
          business_website?: string | null
          category_id: string
          city_id: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          site_id: string
          status?: string
          submitted_at?: string
        }
        Update: {
          admin_notes?: string | null
          business_email?: string
          business_id?: string | null
          business_name?: string
          business_website?: string | null
          category_id?: string
          city_id?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          site_id?: string
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_submissions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_submissions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_submissions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_submissions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          city: string | null
          city_id: string | null
          created_at: string | null
          description: string | null
          editorial_summary: string | null
          formatted_address: string | null
          hours: Json | null
          id: string
          latitude: number | null
          longitude: number | null
          main_photo_name: string | null
          name: string
          phone: string | null
          place_id: string | null
          postal_code: string | null
          raw: Json
          state: string | null
          street_address: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          city?: string | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          editorial_summary?: string | null
          formatted_address?: string | null
          hours?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          main_photo_name?: string | null
          name: string
          phone?: string | null
          place_id?: string | null
          postal_code?: string | null
          raw: Json
          state?: string | null
          street_address?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          city?: string | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          editorial_summary?: string | null
          formatted_address?: string | null
          hours?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          main_photo_name?: string | null
          name?: string
          phone?: string | null
          place_id?: string | null
          postal_code?: string | null
          raw?: Json
          state?: string | null
          street_address?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
          vertical_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
          vertical_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
          vertical_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          id: string
          latitude: number
          longitude: number
          name: string
          population: number | null
          state_id: string
        }
        Insert: {
          id?: string
          latitude: number
          longitude: number
          name: string
          population?: number | null
          state_id: string
        }
        Update: {
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          population?: number | null
          state_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          attempt_count: number
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          job_type: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          meta: Json | null
          payload: Json
          progress: number
          run_id: string | null
          started_at: string | null
          status: string
          updated_at: string
          worker_id: string | null
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          job_type: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          meta?: Json | null
          payload: Json
          progress?: number
          run_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          worker_id?: string | null
        }
        Update: {
          attempt_count?: number
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          job_type?: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          meta?: Json | null
          payload?: Json
          progress?: number
          run_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          worker_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          has_password: boolean
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string
          email?: string | null
          has_password?: boolean
          id?: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          has_password?: boolean
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_businesses: {
        Row: {
          business_id: string
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          id: string
          is_claimed: boolean | null
          overrides: Json | null
          plan: string | null
          site_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_subscription_status: string | null
          updated_at: string
          verification_email: string | null
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          business_id: string
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          id?: string
          is_claimed?: boolean | null
          overrides?: Json | null
          plan?: string | null
          site_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_status?: string | null
          updated_at?: string
          verification_email?: string | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          business_id?: string
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          id?: string
          is_claimed?: boolean | null
          overrides?: Json | null
          plan?: string | null
          site_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_status?: string | null
          updated_at?: string
          verification_email?: string | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_businesses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_businesses_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_businesses_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_categories: {
        Row: {
          category_id: string
          site_id: string
        }
        Insert: {
          category_id: string
          site_id: string
        }
        Update: {
          category_id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_categories_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_cities: {
        Row: {
          city_id: string
          site_id: string
        }
        Insert: {
          city_id: string
          site_id: string
        }
        Update: {
          city_id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_cities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_cities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          created_at: string
          domain: string
          favicon_path: string | null
          hero_path: string | null
          id: string
          logo_path: string | null
          name: string
          state_id: string
          updated_at: string
          vertical_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          favicon_path?: string | null
          hero_path?: string | null
          id?: string
          logo_path?: string | null
          name: string
          state_id: string
          updated_at?: string
          vertical_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          favicon_path?: string | null
          hero_path?: string | null
          id?: string
          logo_path?: string | null
          name?: string
          state_id?: string
          updated_at?: string
          vertical_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          code: string
          id: string
          name: string
        }
        Insert: {
          code: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      verticals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          term_business: string | null
          term_businesses: string | null
          term_categories: string | null
          term_category: string | null
          term_cta: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          term_business?: string | null
          term_businesses?: string | null
          term_categories?: string | null
          term_category?: string | null
          term_cta?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          term_business?: string | null
          term_businesses?: string | null
          term_categories?: string | null
          term_category?: string | null
          term_cta?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_next_job: {
        Args: { p_worker_id: string }
        Returns: {
          attempt_count: number
          id: string
          job_type: string
          payload: Json
          run_id: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
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
