import { supabase } from "./supabase-client";
import type {
  Product,
  PriceRecord,
  ProductInsert,
  PriceRecordInsert,
} from "./database.types";

export type ProductWithLatestPrice = Product & {
  latest_price: number | null;
  latest_store: string | null;
  price_count: number;
};

export type ProductWithPriceHistory = Product & {
  price_records: PriceRecord[];
};

export async function findProductByBarcode(
  barcode: string,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProductWithPriceHistory(
  productId: string,
): Promise<ProductWithPriceHistory | null> {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (productError) throw productError;
  if (!product) return null;

  const { data: priceRecords, error: priceError } = await supabase
    .from("price_records")
    .select("*")
    .eq("product_id", productId)
    .order("recorded_at", { ascending: true });

  if (priceError) throw priceError;

  return { ...product, price_records: priceRecords ?? [] };
}

export async function getAllProductsWithLatestPrice(): Promise<
  ProductWithLatestPrice[]
> {
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  if (productsError) throw productsError;
  if (!products || products.length === 0) return [];

  const productIds = products.map((p) => p.id);
  const { data: priceRecords, error: priceError } = await supabase
    .from("price_records")
    .select("*")
    .in("product_id", productIds)
    .order("recorded_at", { ascending: false });

  if (priceError) throw priceError;

  const priceMap = new Map<
    string,
    { price: number; store: string | null; count: number }
  >();
  for (const record of priceRecords ?? []) {
    const existing = priceMap.get(record.product_id);
    if (existing) {
      existing.count += 1;
    } else {
      priceMap.set(record.product_id, {
        price: record.price,
        store: record.store,
        count: 1,
      });
    }
  }

  return products.map((product) => {
    const priceInfo = priceMap.get(product.id);
    return {
      ...product,
      latest_price: priceInfo?.price ?? null,
      latest_store: priceInfo?.store ?? null,
      price_count: priceInfo?.count ?? 0,
    };
  });
}

export async function createProduct(product: ProductInsert): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addPriceRecord(
  record: PriceRecordInsert,
): Promise<PriceRecord> {
  const { data, error } = await supabase
    .from("price_records")
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function searchProducts(
  query: string,
): Promise<ProductWithLatestPrice[]> {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .or(`name.ilike.%${query}%,barcode.ilike.%${query}%,brand.ilike.%${query}%`)
    .order("name", { ascending: true })
    .limit(20);

  if (error) throw error;
  if (!products || products.length === 0) return [];

  const productIds = products.map((p) => p.id);
  const { data: priceRecords, error: priceError } = await supabase
    .from("price_records")
    .select("*")
    .in("product_id", productIds)
    .order("recorded_at", { ascending: false });

  if (priceError) throw priceError;

  const priceMap = new Map<
    string,
    { price: number; store: string | null; count: number }
  >();
  for (const record of priceRecords ?? []) {
    const existing = priceMap.get(record.product_id);
    if (existing) {
      existing.count += 1;
    } else {
      priceMap.set(record.product_id, {
        price: record.price,
        store: record.store,
        count: 1,
      });
    }
  }

  return products.map((product) => {
    const priceInfo = priceMap.get(product.id);
    return {
      ...product,
      latest_price: priceInfo?.price ?? null,
      latest_store: priceInfo?.store ?? null,
      price_count: priceInfo?.count ?? 0,
    };
  });
}
