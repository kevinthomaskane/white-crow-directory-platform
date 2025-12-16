export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      business_categories: {
        Row: {
          business_id: string;
          category_id: string;
        };
        Insert: {
          business_id: string;
          category_id: string;
        };
        Update: {
          business_id?: string;
          category_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'business_categories_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'business_categories_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      business_review_sources: {
        Row: {
          business_id: string;
          id: string;
          last_synced_at: string | null;
          provider: string;
          rating: number | null;
          review_count: number | null;
          url: string | null;
        };
        Insert: {
          business_id: string;
          id?: string;
          last_synced_at?: string | null;
          provider: string;
          rating?: number | null;
          review_count?: number | null;
          url?: string | null;
        };
        Update: {
          business_id?: string;
          id?: string;
          last_synced_at?: string | null;
          provider?: string;
          rating?: number | null;
          review_count?: number | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'business_review_sources_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
        ];
      };
      business_reviews: {
        Row: {
          author_image_url: string | null;
          author_name: string | null;
          author_url: string | null;
          business_id: string;
          created_at: string | null;
          id: string;
          rating: number | null;
          raw: Json | null;
          review_id: string | null;
          source: string;
          text: string | null;
          time: string | null;
        };
        Insert: {
          author_image_url?: string | null;
          author_name?: string | null;
          author_url?: string | null;
          business_id: string;
          created_at?: string | null;
          id?: string;
          rating?: number | null;
          raw?: Json | null;
          review_id?: string | null;
          source: string;
          text?: string | null;
          time?: string | null;
        };
        Update: {
          author_image_url?: string | null;
          author_name?: string | null;
          author_url?: string | null;
          business_id?: string;
          created_at?: string | null;
          id?: string;
          rating?: number | null;
          raw?: Json | null;
          review_id?: string | null;
          source?: string;
          text?: string | null;
          time?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'business_reviews_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
        ];
      };
      businesses: {
        Row: {
          city: string | null;
          created_at: string | null;
          description: string | null;
          editorial_summary: string | null;
          formatted_address: string | null;
          hours: Json | null;
          id: string;
          latitude: number | null;
          longitude: number | null;
          main_photo_name: string | null;
          name: string;
          phone: string | null;
          place_id: string;
          postal_code: string | null;
          raw: Json;
          state: string | null;
          street_address: string | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          city?: string | null;
          created_at?: string | null;
          description?: string | null;
          editorial_summary?: string | null;
          formatted_address?: string | null;
          hours?: Json | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          main_photo_name?: string | null;
          name: string;
          phone?: string | null;
          place_id: string;
          postal_code?: string | null;
          raw: Json;
          state?: string | null;
          street_address?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          city?: string | null;
          created_at?: string | null;
          description?: string | null;
          editorial_summary?: string | null;
          formatted_address?: string | null;
          hours?: Json | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          main_photo_name?: string | null;
          name?: string;
          phone?: string | null;
          place_id?: string;
          postal_code?: string | null;
          raw?: Json;
          state?: string | null;
          street_address?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
          vertical_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
          vertical_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
          vertical_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_vertical_id_fkey';
            columns: ['vertical_id'];
            isOneToOne: false;
            referencedRelation: 'verticals';
            referencedColumns: ['id'];
          },
        ];
      };
      cities: {
        Row: {
          id: string;
          latitude: number;
          longitude: number;
          name: string;
          population: number | null;
          state_id: string;
        };
        Insert: {
          id?: string;
          latitude: number;
          longitude: number;
          name: string;
          population?: number | null;
          state_id: string;
        };
        Update: {
          id?: string;
          latitude?: number;
          longitude?: number;
          name?: string;
          population?: number | null;
          state_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cities_state_id_fkey';
            columns: ['state_id'];
            isOneToOne: false;
            referencedRelation: 'states';
            referencedColumns: ['id'];
          },
        ];
      };
      jobs: {
        Row: {
          created_at: string;
          error: string | null;
          finished_at: string | null;
          id: string;
          meta: Json | null;
          payload: Json;
          progress: number;
          started_at: string | null;
          status: string;
          type: string;
          worker_id: string | null;
        };
        Insert: {
          created_at?: string;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          meta?: Json | null;
          payload: Json;
          progress?: number;
          started_at?: string | null;
          status?: string;
          type: string;
          worker_id?: string | null;
        };
        Update: {
          created_at?: string;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          meta?: Json | null;
          payload?: Json;
          progress?: number;
          started_at?: string | null;
          status?: string;
          type?: string;
          worker_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string;
          id: string;
          role: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string;
          id?: string;
          role?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          id?: string;
          role?: string;
        };
        Relationships: [];
      };
      states: {
        Row: {
          code: string;
          id: string;
          name: string;
        };
        Insert: {
          code: string;
          id?: string;
          name: string;
        };
        Update: {
          code?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      verticals: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
