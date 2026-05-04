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
