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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_user_id_fkey"
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
          description: string | null
          discount_months: number | null
          discount_percent: number | null
          grants_lifetime: boolean | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          times_used: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_months?: number | null
          discount_percent?: number | null
          grants_lifetime?: boolean | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          times_used?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_months?: number | null
          discount_percent?: number | null
          grants_lifetime?: boolean | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          times_used?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      exercise_sets: {
        Row: {
          created_at: string
          id: string
          rest_seconds: number | null
          set_number: number
          target_distance_meters: number | null
          target_duration_seconds: number | null
          target_reps: number
          target_weight: number | null
          workout_exercise_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rest_seconds?: number | null
          set_number: number
          target_distance_meters?: number | null
          target_duration_seconds?: number | null
          target_reps: number
          target_weight?: number | null
          workout_exercise_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rest_seconds?: number | null
          set_number?: number
          target_distance_meters?: number | null
          target_duration_seconds?: number | null
          target_reps?: number
          target_weight?: number | null
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          equipment: Database["public"]["Enums"]["equipment_type"][]
          exercise_type: Database["public"]["Enums"]["exercise_type"]
          id: string
          instructions: string[] | null
          is_custom: boolean | null
          muscle_groups: Database["public"]["Enums"]["muscle_group"][]
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          equipment?: Database["public"]["Enums"]["equipment_type"][]
          exercise_type?: Database["public"]["Enums"]["exercise_type"]
          id?: string
          instructions?: string[] | null
          is_custom?: boolean | null
          muscle_groups?: Database["public"]["Enums"]["muscle_group"][]
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          equipment?: Database["public"]["Enums"]["equipment_type"][]
          exercise_type?: Database["public"]["Enums"]["exercise_type"]
          id?: string
          instructions?: string[] | null
          is_custom?: boolean | null
          muscle_groups?: Database["public"]["Enums"]["muscle_group"][]
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          onboarding_completed: boolean | null
          onboarding_data: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          onboarding_completed?: boolean | null
          onboarding_data?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          onboarding_completed?: boolean | null
          onboarding_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          days_per_week: number
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_weeks: number
          equipment: Database["public"]["Enums"]["equipment_type"][]
          goal: Database["public"]["Enums"]["program_goal"]
          id: string
          is_premium: boolean
          is_public: boolean | null
          is_template: boolean | null
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          days_per_week: number
          description?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_weeks: number
          equipment?: Database["public"]["Enums"]["equipment_type"][]
          goal: Database["public"]["Enums"]["program_goal"]
          id?: string
          is_premium?: boolean
          is_public?: boolean | null
          is_template?: boolean | null
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          days_per_week?: number
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration_weeks?: number
          equipment?: Database["public"]["Enums"]["equipment_type"][]
          goal?: Database["public"]["Enums"]["program_goal"]
          id?: string
          is_premium?: boolean
          is_public?: boolean | null
          is_template?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      set_logs: {
        Row: {
          actual_distance_meters: number | null
          actual_duration_seconds: number | null
          actual_reps: number
          actual_weight: number
          completed_at: string
          exercise_id: string
          exercise_set_id: string
          id: string
          rpe: number | null
          workout_log_id: string
        }
        Insert: {
          actual_distance_meters?: number | null
          actual_duration_seconds?: number | null
          actual_reps: number
          actual_weight?: number
          completed_at?: string
          exercise_id: string
          exercise_set_id: string
          id?: string
          rpe?: number | null
          workout_log_id: string
        }
        Update: {
          actual_distance_meters?: number | null
          actual_duration_seconds?: number | null
          actual_reps?: number
          actual_weight?: number
          completed_at?: string
          exercise_id?: string
          exercise_set_id?: string
          id?: string
          rpe?: number | null
          workout_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "set_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_logs_exercise_set_id_fkey"
            columns: ["exercise_set_id"]
            isOneToOne: false
            referencedRelation: "exercise_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_logs_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          provider: Database["public"]["Enums"]["subscription_provider"]
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          provider: Database["public"]["Enums"]["subscription_provider"]
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          provider?: Database["public"]["Enums"]["subscription_provider"]
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_programs: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          program_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["program_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          program_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          program_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_programs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          sort_order: number
          workout_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          sort_order?: number
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          sort_order?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          notes: string | null
          program_id: string | null
          started_at: string
          user_id: string
          workout_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          program_id?: string | null
          started_at?: string
          user_id: string
          workout_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          program_id?: string | null
          started_at?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          name: string
          program_id: string
          updated_at: string
          week_number: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          name: string
          program_id: string
          updated_at?: string
          week_number: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          name?: string
          program_id?: string
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "workouts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_active_program: { Args: never; Returns: Json }
      copy_program_to_user: {
        Args: { template_program_id: string }
        Returns: string
      }
      get_active_program: { Args: never; Returns: Json }
      has_premium_access: { Args: { check_user_id: string }; Returns: boolean }
      redeem_coupon: { Args: { coupon_code: string }; Returns: Json }
      start_program: { Args: { p_program_id: string }; Returns: Json }
      start_program_workout: { Args: { p_program_id: string }; Returns: Json }
    }
    Enums: {
      difficulty_level: "beginner" | "intermediate" | "advanced"
      equipment_type:
        | "barbell"
        | "dumbbell"
        | "kettlebell"
        | "cable"
        | "machine"
        | "bodyweight"
        | "resistance_band"
        | "bench"
        | "pull_up_bar"
        | "none"
      exercise_type: "strength" | "cardio" | "flexibility" | "other"
      muscle_group:
        | "chest"
        | "back"
        | "shoulders"
        | "biceps"
        | "triceps"
        | "forearms"
        | "abs"
        | "obliques"
        | "quads"
        | "hamstrings"
        | "glutes"
        | "calves"
        | "traps"
        | "lats"
      program_goal: "strength" | "hypertrophy" | "endurance" | "general"
      program_status: "active" | "paused" | "completed"
      subscription_plan: "free" | "premium" | "lifetime"
      subscription_provider: "apple" | "google" | "stripe" | "manual"
      subscription_status: "active" | "cancelled" | "expired" | "trial"
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
    Enums: {
      difficulty_level: ["beginner", "intermediate", "advanced"],
      equipment_type: [
        "barbell",
        "dumbbell",
        "kettlebell",
        "cable",
        "machine",
        "bodyweight",
        "resistance_band",
        "bench",
        "pull_up_bar",
        "none",
      ],
      exercise_type: ["strength", "cardio", "flexibility", "other"],
      muscle_group: [
        "chest",
        "back",
        "shoulders",
        "biceps",
        "triceps",
        "forearms",
        "abs",
        "obliques",
        "quads",
        "hamstrings",
        "glutes",
        "calves",
        "traps",
        "lats",
      ],
      program_goal: ["strength", "hypertrophy", "endurance", "general"],
      program_status: ["active", "paused", "completed"],
      subscription_plan: ["free", "premium", "lifetime"],
      subscription_provider: ["apple", "google", "stripe", "manual"],
      subscription_status: ["active", "cancelled", "expired", "trial"],
    },
  },
} as const
A new version of Supabase CLI is available: v2.72.7 (currently installed v1.226.4)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
