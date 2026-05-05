import { useState, useCallback } from "react";
import {
  createPurchase,
  addPurchaseItem,
  removePurchaseItem,
  getPurchaseWithItems,
  getAllPurchasesSummary,
  deletePurchase,
} from "../infra/purchase-gateway";
import type {
  PurchaseSummary,
  PurchaseWithItems,
} from "../infra/purchase-gateway";
import type {
  PurchaseInsert,
  PurchaseItemInsert,
} from "../infra/database.types";

export function usePurchases() {
  const [purchases, setPurchases] = useState<PurchaseSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPurchasesSummary();
      setPurchases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar compras");
    } finally {
      setLoading(false);
    }
  }, []);

  return { purchases, loading, error, loadPurchases };
}

export function usePurchaseDetail() {
  const [purchaseDetail, setPurchaseDetail] =
    useState<PurchaseWithItems | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async (purchaseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPurchaseWithItems(purchaseId);
      setPurchaseDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar compra");
    } finally {
      setLoading(false);
    }
  }, []);

  return { purchaseDetail, loading, error, loadDetail };
}

export function useCreatePurchase() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (purchase: PurchaseInsert) => {
    setLoading(true);
    try {
      const created = await createPurchase(purchase);
      return created;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading };
}

export function useAddPurchaseItem() {
  const [loading, setLoading] = useState(false);

  const addItem = useCallback(
    async (item: PurchaseItemInsert, store: string | null) => {
      setLoading(true);
      try {
        const created = await addPurchaseItem(item, store);
        return created;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { addItem, loading };
}

export function useRemovePurchaseItem() {
  const [loading, setLoading] = useState(false);

  const removeItem = useCallback(async (itemId: string) => {
    setLoading(true);
    try {
      await removePurchaseItem(itemId);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { removeItem, loading };
}

export function useDeletePurchase() {
  const [loading, setLoading] = useState(false);

  const remove = useCallback(async (purchaseId: string) => {
    setLoading(true);
    try {
      await deletePurchase(purchaseId);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { remove, loading };
}
