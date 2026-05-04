import { useState, useCallback } from "react";
import {
  findProductByBarcode,
  getProductWithPriceHistory,
  getAllProductsWithLatestPrice,
  createProduct,
  addPriceRecord,
  searchProducts,
} from "../infra/product-gateway";
import type {
  ProductWithLatestPrice,
  ProductWithPriceHistory,
} from "../infra/product-gateway";
import type {
  Product,
  ProductInsert,
  PriceRecordInsert,
} from "../infra/database.types";

export function useProducts() {
  const [products, setProducts] = useState<ProductWithLatestPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProductsWithLatestPrice();
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar produtos",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { products, loading, error, loadProducts };
}

export function useProductSearch() {
  const [results, setResults] = useState<ProductWithLatestPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchProducts(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na busca");
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}

export function useBarcodeSearch() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const searchByBarcode = useCallback(async (barcode: string) => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    setProduct(null);
    try {
      const found = await findProductByBarcode(barcode);
      if (found) {
        setProduct(found);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar produto");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProduct(null);
    setNotFound(false);
    setError(null);
  }, []);

  return { product, loading, error, notFound, searchByBarcode, reset };
}

export function useProductDetail() {
  const [productDetail, setProductDetail] =
    useState<ProductWithPriceHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductWithPriceHistory(productId);
      setProductDetail(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar detalhes",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { productDetail, loading, error, loadDetail };
}

export function useCreateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (product: ProductInsert) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createProduct(product);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar produto");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, create };
}

export function useAddPrice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPrice = useCallback(async (record: PriceRecordInsert) => {
    setLoading(true);
    setError(null);
    try {
      const created = await addPriceRecord(record);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar preço");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, addPrice };
}
