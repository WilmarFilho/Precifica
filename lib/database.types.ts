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
      clientes: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      insumos_base: {
        Row: {
          categoria: string | null
          created_at: string | null
          id: string
          nome: string
          unidade_medida: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          id?: string
          nome: string
          unidade_medida?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          unidade_medida?: string | null
        }
        Relationships: []
      }
      orcamento_colunas: {
        Row: {
          id: string
          orcamento_id: string | null
          ordem: number | null
          quantidade: number
        }
        Insert: {
          id?: string
          orcamento_id?: string | null
          ordem?: number | null
          quantidade: number
        }
        Update: {
          id?: string
          orcamento_id?: string | null
          ordem?: number | null
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_colunas_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_versao_valores: {
        Row: {
          id: string
          insumo_id: string
          quantidade_referencia: number | null
          valor_custo_unitario_base: number
          versao_id: string
        }
        Insert: {
          id?: string
          insumo_id: string
          quantidade_referencia?: number | null
          valor_custo_unitario_base: number
          versao_id: string
        }
        Update: {
          id?: string
          insumo_id?: string
          quantidade_referencia?: number | null
          valor_custo_unitario_base?: number
          versao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_versao_valores_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos_base"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_versao_valores_versao_id_fkey"
            columns: ["versao_id"]
            isOneToOne: false
            referencedRelation: "orcamento_versoes"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_versoes: {
        Row: {
          created_at: string | null
          custo_total_calculado: number | null
          descricao_alteracao: string | null
          id: string
          orcamento_id: string
          versao_numero: number
        }
        Insert: {
          created_at?: string | null
          custo_total_calculado?: number | null
          descricao_alteracao?: string | null
          id?: string
          orcamento_id: string
          versao_numero: number
        }
        Update: {
          created_at?: string | null
          custo_total_calculado?: number | null
          descricao_alteracao?: string | null
          id?: string
          orcamento_id?: string
          versao_numero?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_versoes_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente_id: string
          created_at: string | null
          id: string
          titulo: string
          user_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          id?: string
          titulo: string
          user_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          id?: string
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_papel: {
        Row: {
          created_at: string | null
          f1: number | null
          f2: number | null
          f3: number | null
          f4: number | null
          f6: number | null
          f8: number | null
          f9: number | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          f1?: number | null
          f2?: number | null
          f3?: number | null
          f4?: number | null
          f6?: number | null
          f8?: number | null
          f9?: number | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          f1?: number | null
          f2?: number | null
          f3?: number | null
          f4?: number | null
          f6?: number | null
          f8?: number | null
          f9?: number | null
          id?: string
          nome?: string
        }
        Relationships: []
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
