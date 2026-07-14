export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bachelier_profils: {
        Row: {
          ambition_internationale: boolean
          bachelier_id: string
          budget_annuel_fcfa: number | null
          created_at: string
          id: string
          interets: Json
          mobilite: Database["public"]["Enums"]["mobilite"]
          moyenne: number | null
          scores: Json
          serie_bac: Database["public"]["Enums"]["bac_serie"] | null
        }
        Insert: {
          ambition_internationale?: boolean
          bachelier_id: string
          budget_annuel_fcfa?: number | null
          created_at?: string
          id?: string
          interets?: Json
          mobilite?: Database["public"]["Enums"]["mobilite"]
          moyenne?: number | null
          scores?: Json
          serie_bac?: Database["public"]["Enums"]["bac_serie"] | null
        }
        Update: {
          ambition_internationale?: boolean
          bachelier_id?: string
          budget_annuel_fcfa?: number | null
          created_at?: string
          id?: string
          interets?: Json
          mobilite?: Database["public"]["Enums"]["mobilite"]
          moyenne?: number | null
          scores?: Json
          serie_bac?: Database["public"]["Enums"]["bac_serie"] | null
        }
        Relationships: [
          {
            foreignKeyName: "bachelier_profils_bachelier_id_fkey"
            columns: ["bachelier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bourses: {
        Row: {
          criteres: Json
          date_limite: string | null
          id: string
          lien: string | null
          montant: string | null
          nom: string
          organisme: string | null
          pays: string | null
          statut: Database["public"]["Enums"]["contenu_statut"]
          updated_at: string
        }
        Insert: {
          criteres?: Json
          date_limite?: string | null
          id?: string
          lien?: string | null
          montant?: string | null
          nom: string
          organisme?: string | null
          pays?: string | null
          statut?: Database["public"]["Enums"]["contenu_statut"]
          updated_at?: string
        }
        Update: {
          criteres?: Json
          date_limite?: string | null
          id?: string
          lien?: string | null
          montant?: string | null
          nom?: string
          organisme?: string | null
          pays?: string | null
          statut?: Database["public"]["Enums"]["contenu_statut"]
          updated_at?: string
        }
        Relationships: []
      }
      consultants: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          is_verified: boolean
          photo_url: string | null
          specialites: Json
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id: string
          is_verified?: boolean
          photo_url?: string | null
          specialites?: Json
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean
          photo_url?: string | null
          specialites?: Json
        }
        Relationships: [
          {
            foreignKeyName: "consultants_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_types: {
        Row: {
          code: string
          commission_pct: number
          duree_min: number
          id: string
          libelle: string
          tarif_fcfa: number
        }
        Insert: {
          code: string
          commission_pct?: number
          duree_min: number
          id?: string
          libelle: string
          tarif_fcfa?: number
        }
        Update: {
          code?: string
          commission_pct?: number
          duree_min?: number
          id?: string
          libelle?: string
          tarif_fcfa?: number
        }
        Relationships: []
      }
      consultations: {
        Row: {
          bachelier_id: string
          commission_fcfa: number
          consultant_id: string
          created_at: string
          id: string
          net_consultant_fcfa: number
          notes: string | null
          prix_fcfa: number
          scheduled_at: string | null
          slot_id: string | null
          statut: Database["public"]["Enums"]["consultation_statut"]
          type_id: string
        }
        Insert: {
          bachelier_id: string
          commission_fcfa?: number
          consultant_id: string
          created_at?: string
          id?: string
          net_consultant_fcfa?: number
          notes?: string | null
          prix_fcfa?: number
          scheduled_at?: string | null
          slot_id?: string | null
          statut?: Database["public"]["Enums"]["consultation_statut"]
          type_id: string
        }
        Update: {
          bachelier_id?: string
          commission_fcfa?: number
          consultant_id?: string
          created_at?: string
          id?: string
          net_consultant_fcfa?: number
          notes?: string | null
          prix_fcfa?: number
          scheduled_at?: string | null
          slot_id?: string | null
          statut?: Database["public"]["Enums"]["consultation_statut"]
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_bachelier_id_fkey"
            columns: ["bachelier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "disponibilites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "consultation_types"
            referencedColumns: ["id"]
          },
        ]
      }
      disponibilites: {
        Row: {
          consultant_id: string
          end_at: string
          id: string
          is_booked: boolean
          start_at: string
        }
        Insert: {
          consultant_id: string
          end_at: string
          id?: string
          is_booked?: boolean
          start_at: string
        }
        Update: {
          consultant_id?: string
          end_at?: string
          id?: string
          is_booked?: boolean
          start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disponibilites_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["id"]
          },
        ]
      }
      ecole_membres: {
        Row: {
          created_at: string
          ecole_id: string
          role_ecole: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ecole_id: string
          role_ecole?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ecole_id?: string
          role_ecole?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecole_membres_ecole_id_fkey"
            columns: ["ecole_id"]
            isOneToOne: false
            referencedRelation: "ecoles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecole_membres_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ecoles: {
        Row: {
          badge: string | null
          commission_max_fcfa: number | null
          commission_min_fcfa: number | null
          created_at: string
          description: string | null
          frais_max_fcfa: number | null
          frais_min_fcfa: number | null
          id: string
          logo_url: string | null
          nom: string
          partenariat: Database["public"]["Enums"]["partenariat_statut"]
          plafond_mensuel_fcfa: number | null
          slug: string
          statut: Database["public"]["Enums"]["contenu_statut"]
          type: Database["public"]["Enums"]["ecole_type"]
          updated_at: string
          ville: string | null
        }
        Insert: {
          badge?: string | null
          commission_max_fcfa?: number | null
          commission_min_fcfa?: number | null
          created_at?: string
          description?: string | null
          frais_max_fcfa?: number | null
          frais_min_fcfa?: number | null
          id?: string
          logo_url?: string | null
          nom: string
          partenariat?: Database["public"]["Enums"]["partenariat_statut"]
          plafond_mensuel_fcfa?: number | null
          slug: string
          statut?: Database["public"]["Enums"]["contenu_statut"]
          type: Database["public"]["Enums"]["ecole_type"]
          updated_at?: string
          ville?: string | null
        }
        Update: {
          badge?: string | null
          commission_max_fcfa?: number | null
          commission_min_fcfa?: number | null
          created_at?: string
          description?: string | null
          frais_max_fcfa?: number | null
          frais_min_fcfa?: number | null
          id?: string
          logo_url?: string | null
          nom?: string
          partenariat?: Database["public"]["Enums"]["partenariat_statut"]
          plafond_mensuel_fcfa?: number | null
          slug?: string
          statut?: Database["public"]["Enums"]["contenu_statut"]
          type?: Database["public"]["Enums"]["ecole_type"]
          updated_at?: string
          ville?: string | null
        }
        Relationships: []
      }
      inscriptions_ecole: {
        Row: {
          bachelier_id: string
          commission_fcfa: number | null
          confirmed_by: string | null
          ecole_id: string
          id: string
          inscrite_at: string | null
          orientee_at: string
          plan_id: string | null
          statut: Database["public"]["Enums"]["inscription_statut"]
        }
        Insert: {
          bachelier_id: string
          commission_fcfa?: number | null
          confirmed_by?: string | null
          ecole_id: string
          id?: string
          inscrite_at?: string | null
          orientee_at?: string
          plan_id?: string | null
          statut?: Database["public"]["Enums"]["inscription_statut"]
        }
        Update: {
          bachelier_id?: string
          commission_fcfa?: number | null
          confirmed_by?: string | null
          ecole_id?: string
          id?: string
          inscrite_at?: string | null
          orientee_at?: string
          plan_id?: string | null
          statut?: Database["public"]["Enums"]["inscription_statut"]
        }
        Relationships: [
          {
            foreignKeyName: "inscriptions_ecole_bachelier_id_fkey"
            columns: ["bachelier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_ecole_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_ecole_ecole_id_fkey"
            columns: ["ecole_id"]
            isOneToOne: false
            referencedRelation: "ecoles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_ecole_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans_parcours"
            referencedColumns: ["id"]
          },
        ]
      }
      parcours: {
        Row: {
          contenu: Json
          domaine: string
          id: string
          resume: string | null
          slug: string
          statut: Database["public"]["Enums"]["contenu_statut"]
          titre: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          contenu?: Json
          domaine: string
          id?: string
          resume?: string | null
          slug: string
          statut?: Database["public"]["Enums"]["contenu_statut"]
          titre: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          contenu?: Json
          domaine?: string
          id?: string
          resume?: string | null
          slug?: string
          statut?: Database["public"]["Enums"]["contenu_statut"]
          titre?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parcours_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_fcfa: number
          created_at: string
          fedapay_transaction_id: string | null
          id: string
          purpose: Database["public"]["Enums"]["payment_purpose"]
          related_id: string | null
          related_type: string | null
          statut: Database["public"]["Enums"]["payment_statut"]
          user_id: string
        }
        Insert: {
          amount_fcfa: number
          created_at?: string
          fedapay_transaction_id?: string | null
          id?: string
          purpose: Database["public"]["Enums"]["payment_purpose"]
          related_id?: string | null
          related_type?: string | null
          statut?: Database["public"]["Enums"]["payment_statut"]
          user_id: string
        }
        Update: {
          amount_fcfa?: number
          created_at?: string
          fedapay_transaction_id?: string | null
          id?: string
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          related_id?: string | null
          related_type?: string | null
          statut?: Database["public"]["Enums"]["payment_statut"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans_parcours: {
        Row: {
          bachelier_id: string
          created_at: string
          data: Json
          id: string
          is_paid: boolean
          paid_at: string | null
          parcours_principal_id: string | null
          pdf_url: string | null
          profil_id: string
          share_slug: string | null
          shared_at: string | null
        }
        Insert: {
          bachelier_id: string
          created_at?: string
          data?: Json
          id?: string
          is_paid?: boolean
          paid_at?: string | null
          parcours_principal_id?: string | null
          pdf_url?: string | null
          profil_id: string
          share_slug?: string | null
          shared_at?: string | null
        }
        Update: {
          bachelier_id?: string
          created_at?: string
          data?: Json
          id?: string
          is_paid?: boolean
          paid_at?: string | null
          parcours_principal_id?: string | null
          pdf_url?: string | null
          profil_id?: string
          share_slug?: string | null
          shared_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plans_parcours_bachelier_id_fkey"
            columns: ["bachelier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_parcours_parcours_principal_id_fkey"
            columns: ["parcours_principal_id"]
            isOneToOne: false
            referencedRelation: "parcours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_parcours_profil_id_fkey"
            columns: ["profil_id"]
            isOneToOne: false
            referencedRelation: "bachelier_profils"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_shared_plan: { Args: { _slug: string }; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      is_ecole_member: { Args: { _ecole: string }; Returns: boolean }
    }
    Enums: {
      bac_serie: "A1" | "A2" | "B" | "C" | "D" | "E" | "F" | "G" | "autre"
      consultation_statut:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      contenu_statut: "draft" | "published" | "archived"
      ecole_type:
        | "publique"
        | "privee_premium"
        | "privee_moyenne"
        | "privee_accessible"
        | "internationale"
      inscription_statut: "orientee" | "candidature" | "inscrite" | "annulee"
      mobilite: "cotonou" | "benin" | "uemoa" | "international"
      partenariat_statut: "non_partenaire" | "prospect" | "active" | "suspended"
      payment_purpose: "pdf_plan" | "consultation"
      payment_statut: "pending" | "succeeded" | "failed" | "refunded"
      user_role: "bachelier" | "ecole" | "consultant" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          remote_table_id: string | null
          shard_id: string | null
          shard_key: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      bac_serie: ["A1", "A2", "B", "C", "D", "E", "F", "G", "autre"],
      consultation_statut: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      contenu_statut: ["draft", "published", "archived"],
      ecole_type: [
        "publique",
        "privee_premium",
        "privee_moyenne",
        "privee_accessible",
        "internationale",
      ],
      inscription_statut: ["orientee", "candidature", "inscrite", "annulee"],
      mobilite: ["cotonou", "benin", "uemoa", "international"],
      partenariat_statut: ["non_partenaire", "prospect", "active", "suspended"],
      payment_purpose: ["pdf_plan", "consultation"],
      payment_statut: ["pending", "succeeded", "failed", "refunded"],
      user_role: ["bachelier", "ecole", "consultant", "admin"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const

