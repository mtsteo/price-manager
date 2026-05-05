import { supabase } from "./supabase-client";
import type {
  Purchase,
  PurchaseItem,
  PurchaseInsert,
  PurchaseItemInsert,
} from "./database.types";

export type PurchaseItemWithProduct = PurchaseItem & {
  product: { id: string; name: string; barcode: string; brand: string | null };
};

export type PurchaseWithItems = Purchase & {
  items: PurchaseItemWithProduct[];
  total: number;
};

export type PurchaseSummary = {
  id: string;
  store: string;
  purchased_at: string;
  notes: string | null;
  total: number;
  item_count: number;
};

export async function createPurchase(
  purchase: PurchaseInsert,
): Promise<Purchase> {
  const { data, error } = await supabase
    .from("purchases")
    .insert(purchase)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function addPurchaseItem(
  item: PurchaseItemInsert,
  store: string | null,
): Promise<PurchaseItem> {
  const { data, error } = await supabase
    .from("purchase_items")
    .insert(item)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Also create a price_record to feed the price history
  await supabase.from("price_records").insert({
    product_id: item.product_id,
    price: item.price,
    store,
  });

  return data;
}

export async function removePurchaseItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from("purchase_items")
    .delete()
    .eq("id", itemId);

  if (error) throw new Error(error.message);
}

export async function getPurchaseWithItems(
  purchaseId: string,
): Promise<PurchaseWithItems> {
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", purchaseId)
    .single();

  if (purchaseError) throw new Error(purchaseError.message);

  const { data: items, error: itemsError } = await supabase
    .from("purchase_items")
    .select("*, product:products(id, name, barcode, brand)")
    .eq("purchase_id", purchaseId)
    .order("created_at", { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  const typedItems = (items ?? []) as unknown as PurchaseItemWithProduct[];
  const total = typedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return { ...purchase, items: typedItems, total };
}

export async function getAllPurchasesSummary(): Promise<PurchaseSummary[]> {
  const { data: purchases, error: purchasesError } = await supabase
    .from("purchases")
    .select("*")
    .order("purchased_at", { ascending: false });

  if (purchasesError) throw new Error(purchasesError.message);

  const summaries: PurchaseSummary[] = [];

  for (const purchase of purchases ?? []) {
    const { data: items } = await supabase
      .from("purchase_items")
      .select("price, quantity")
      .eq("purchase_id", purchase.id);

    const total = (items ?? []).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    summaries.push({
      id: purchase.id,
      store: purchase.store,
      purchased_at: purchase.purchased_at,
      notes: purchase.notes,
      total,
      item_count: (items ?? []).length,
    });
  }

  return summaries;
}

export async function deletePurchase(purchaseId: string): Promise<void> {
  const { error } = await supabase
    .from("purchases")
    .delete()
    .eq("id", purchaseId);

  if (error) throw new Error(error.message);
}
