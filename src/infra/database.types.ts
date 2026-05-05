export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          barcode: string;
          name: string;
          brand: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          barcode: string;
          name: string;
          brand?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          barcode?: string;
          name?: string;
          brand?: string | null;
          category?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      price_records: {
        Row: {
          id: string;
          product_id: string;
          price: number;
          store: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          price: number;
          store?: string | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          price?: number;
          store?: string | null;
          recorded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "price_records_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      purchases: {
        Row: {
          id: string;
          store: string;
          purchased_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store: string;
          purchased_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store?: string;
          purchased_at?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      purchase_items: {
        Row: {
          id: string;
          purchase_id: string;
          product_id: string;
          price: number;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_id: string;
          product_id: string;
          price: number;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          purchase_id?: string;
          product_id?: string;
          price?: number;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_items_purchase_id_fkey";
            columns: ["purchase_id"];
            referencedRelation: "purchases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type PriceRecord = Database["public"]["Tables"]["price_records"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type PriceRecordInsert =
  Database["public"]["Tables"]["price_records"]["Insert"];
export type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
export type PurchaseItem =
  Database["public"]["Tables"]["purchase_items"]["Row"];
export type PurchaseInsert =
  Database["public"]["Tables"]["purchases"]["Insert"];
export type PurchaseItemInsert =
  Database["public"]["Tables"]["purchase_items"]["Insert"];
