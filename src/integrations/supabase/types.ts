export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      category_limits: {
        Row: {
          category: Database["public"]["Enums"]["expense_category"] | null
          created_at: string
          custom_category_id: string | null
          id: string
          limit_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string
          custom_category_id?: string | null
          id?: string
          limit_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string
          custom_category_id?: string | null
          id?: string
          limit_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_limits_custom_category_id_fkey"
            columns: ["custom_category_id"]
            isOneToOne: false
            referencedRelation: "custom_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usages: {
        Row: {
          coupon_id: string
          id: string
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usages_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          days_granted: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          plan_granted: Database["public"]["Enums"]["user_plan"]
          times_used: number | null
          updated_at: string
          usage_limit: number | null
        }
        Insert: {
          code: string
          created_at?: string
          days_granted: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          plan_granted: Database["public"]["Enums"]["user_plan"]
          times_used?: number | null
          updated_at?: string
          usage_limit?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          days_granted?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          plan_granted?: Database["public"]["Enums"]["user_plan"]
          times_used?: number | null
          updated_at?: string
          usage_limit?: number | null
        }
        Relationships: []
      }
      custom_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"] | null
          created_at: string
          custom_category_id: string | null
          description: string
          expense_date: string
          id: string
          payment_method: string | null
          updated_at: string
          user_id: string
          whatsapp_message_id: string | null
        }
        Insert: {
          amount: number
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string
          custom_category_id?: string | null
          description: string
          expense_date?: string
          id?: string
          payment_method?: string | null
          updated_at?: string
          user_id: string
          whatsapp_message_id?: string | null
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string
          custom_category_id?: string | null
          description?: string
          expense_date?: string
          id?: string
          payment_method?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_custom_category_id_fkey"
            columns: ["custom_category_id"]
            isOneToOne: false
            referencedRelation: "custom_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          plan: Database["public"]["Enums"]["user_plan"]
          trial_ends_at: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["user_plan"]
          trial_ends_at?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["user_plan"]
          trial_ends_at?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["user_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: Database["public"]["Enums"]["user_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["user_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          alert_percentage: number | null
          assistant_name: string | null
          assistant_tone: string | null
          created_at: string
          id: string
          total_budget_limit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_percentage?: number | null
          assistant_name?: string | null
          assistant_tone?: string | null
          created_at?: string
          id?: string
          total_budget_limit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_percentage?: number | null
          assistant_name?: string | null
          assistant_tone?: string | null
          created_at?: string
          id?: string
          total_budget_limit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      expense_category:
        | "alimentacao"
        | "transporte"
        | "moradia"
        | "saude"
        | "educacao"
        | "lazer"
        | "vestuario"
        | "contas"
        | "investimentos"
        | "salario"
        | "diversos"
        | "assinaturas"
      subscription_status: "active" | "canceled" | "trial" | "expired"
      user_plan: "FREE" | "STANDARD" | "TOP"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      expense_category: [
        "alimentacao",
        "transporte",
        "moradia",
        "saude",
        "educacao",
        "lazer",
        "vestuario",
        "contas",
        "investimentos",
        "salario",
        "diversos",
        "assinaturas",
      ],
      subscription_status: ["active", "canceled", "trial", "expired"],
      user_plan: ["FREE", "STANDARD", "TOP"],
    },
  },
} as const
