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
      conversation_summaries: {
        Row: {
          actions_to_take: string
          conversation_id: string
          created_at: string
          id: string
          key_advice: string
        }
        Insert: {
          actions_to_take: string
          conversation_id: string
          created_at?: string
          id?: string
          key_advice: string
        }
        Update: {
          actions_to_take?: string
          conversation_id?: string
          created_at?: string
          id?: string
          key_advice?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      legal_documents: {
        Row: {
          client_id: string | null
          content: string
          created_at: string
          document_type: string | null
          embedding: string | null
          id: string
          jurisdiction: string | null
          metadata: Json
          title: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          content: string
          created_at?: string
          document_type?: string | null
          embedding?: string | null
          id?: string
          jurisdiction?: string | null
          metadata?: Json
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          content?: string
          created_at?: string
          document_type?: string | null
          embedding?: string | null
          id?: string
          jurisdiction?: string | null
          metadata?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_legal_documents: {
        Args: {
          query_text: string
          query_embedding: string
          client_id: string
          jurisdiction?: string
          document_type?: string
          match_count?: number
          k_rrf?: number
        }
        Returns: {
          id: string
          title: string
          content: string
          metadata: Json
          score: number
          similarity_score: number
          keyword_score: number
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

export type Tables<PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never)
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never)
    : never

export type TablesInsert<PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never)
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never)
    : never

export type TablesUpdate<PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never)
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never)
    : never

export type Enums<PublicEnumNameOrOptions extends
  | keyof (Database["public"]["Enums"])
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicEnumNameOrOptions["schema"]]["Enums"])
    : never = never,> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof (Database["public"]["Enums"])
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never