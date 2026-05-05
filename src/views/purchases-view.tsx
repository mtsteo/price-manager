import { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Title1,
  Title3,
  Text2,
  Text3,
  Box,
  Boxed,
  ButtonPrimary,
  ButtonSecondary,
  ButtonDanger,
  TextField,
  Spinner,
  Inline,
  Tag,
  Divider,
  IconInformationUserRegular,
} from "@telefonica/mistica";
import {
  usePurchases,
  usePurchaseDetail,
  useCreatePurchase,
  useAddPurchaseItem,
  useRemovePurchaseItem,
  useDeletePurchase,
} from "../hooks/use-purchases";
import { searchProducts, findProductByBarcode } from "../infra/product-gateway";
import type { ProductWithLatestPrice } from "../infra/product-gateway";
import { useBarcodeScanner } from "../hooks/use-barcode-scanner";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr));
}

function getMonthLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

type ViewState =
  | { type: "list" }
  | { type: "create" }
  | { type: "detail"; purchaseId: string }
  | { type: "add-item"; purchaseId: string; store: string };

export function PurchasesView() {
  const [viewState, setViewState] = useState<ViewState>({ type: "list" });

  if (viewState.type === "list") {
    return (
      <PurchaseListPanel
        onCreateNew={() => setViewState({ type: "create" })}
        onSelectPurchase={(id) =>
          setViewState({ type: "detail", purchaseId: id })
        }
      />
    );
  }

  if (viewState.type === "create") {
    return (
      <CreatePurchasePanel
        onBack={() => setViewState({ type: "list" })}
        onCreated={(id, store) =>
          setViewState({ type: "add-item", purchaseId: id, store })
        }
      />
    );
  }

  if (viewState.type === "detail") {
    return (
      <PurchaseDetailPanel
        purchaseId={viewState.purchaseId}
        onBack={() => setViewState({ type: "list" })}
        onAddItem={(store) =>
          setViewState({
            type: "add-item",
            purchaseId: viewState.purchaseId,
            store,
          })
        }
      />
    );
  }

  if (viewState.type === "add-item") {
    return (
      <AddItemPanel
        purchaseId={viewState.purchaseId}
        store={viewState.store}
        onBack={() =>
          setViewState({ type: "detail", purchaseId: viewState.purchaseId })
        }
      />
    );
  }

  return null;
}

// ─── List Panel ───

function PurchaseListPanel({
  onCreateNew,
  onSelectPurchase,
}: {
  onCreateNew: () => void;
  onSelectPurchase: (id: string) => void;
}) {
  const { purchases, loading, error, loadPurchases } = usePurchases();

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  // Group by month
  const grouped = purchases.reduce<Record<string, typeof purchases>>(
    (acc, purchase) => {
      const key = getMonthLabel(purchase.purchased_at);
      if (!acc[key]) acc[key] = [];
      acc[key].push(purchase);
      return acc;
    },
    {},
  );

  return (
    <Box padding={16}>
      <Stack space={24}>
        <Inline space="between" alignItems="center">
          <Title1>Compras</Title1>
          <ButtonPrimary small onPress={onCreateNew}>
            Nova compra
          </ButtonPrimary>
        </Inline>

        {loading && <Spinner />}

        {error && (
          <Inline space={8} alignItems="center">
            <IconInformationUserRegular size={20} />
            <Text2 regular>{error}</Text2>
          </Inline>
        )}

        {!loading && purchases.length === 0 && (
          <Boxed>
            <Box padding={16}>
              <Stack space={8}>
                <Text2 medium>Nenhuma compra registrada</Text2>
                <Text2 regular>
                  Comece registrando sua primeira compra do mês!
                </Text2>
              </Stack>
            </Box>
          </Boxed>
        )}

        {Object.entries(grouped).map(([month, monthPurchases]) => (
          <Stack key={month} space={12}>
            <Title3 as="h2">
              {month.charAt(0).toUpperCase() + month.slice(1)}
            </Title3>
            <Stack space={8}>
              {monthPurchases.map((purchase) => (
                <Boxed key={purchase.id}>
                  <Box padding={16}>
                    <Stack space={8}>
                      <Inline space="between" alignItems="center">
                        <Text3 medium>{purchase.store}</Text3>
                        <Tag type="active">
                          {formatCurrency(purchase.total)}
                        </Tag>
                      </Inline>
                      <Inline space="between" alignItems="center">
                        <Text2 regular>
                          {formatDate(purchase.purchased_at)}
                        </Text2>
                        <Text2 regular>
                          {purchase.item_count} ite
                          {purchase.item_count !== 1 ? "ns" : "m"}
                        </Text2>
                      </Inline>
                      <ButtonSecondary
                        small
                        onPress={() => onSelectPurchase(purchase.id)}
                      >
                        Ver detalhes
                      </ButtonSecondary>
                    </Stack>
                  </Box>
                </Boxed>
              ))}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

// ─── Create Panel ───

function CreatePurchasePanel({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: (purchaseId: string, store: string) => void;
}) {
  const { create, loading } = useCreatePurchase();
  const [store, setStore] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const handleCreate = async () => {
    if (!store.trim()) return;
    const purchase = await create({
      store: store.trim(),
      purchased_at: date,
      notes: notes.trim() || null,
    });
    if (purchase) {
      onCreated(purchase.id, purchase.store);
    }
  };

  return (
    <Box padding={16}>
      <Stack space={24}>
        <Title1>Nova Compra</Title1>

        <Stack space={16}>
          <TextField
            name="store"
            label="Loja / Supermercado"
            value={store}
            onChangeValue={setStore}
          />
          <TextField
            name="date"
            label="Data da compra"
            value={date}
            onChangeValue={setDate}
          />
          <TextField
            name="notes"
            label="Observações (opcional)"
            value={notes}
            onChangeValue={setNotes}
          />
        </Stack>

        <ButtonPrimary onPress={handleCreate}>
          {loading ? "Criando..." : "Criar e adicionar itens"}
        </ButtonPrimary>
        <ButtonSecondary onPress={onBack}>Cancelar</ButtonSecondary>
      </Stack>
    </Box>
  );
}

// ─── Detail Panel ───

function PurchaseDetailPanel({
  purchaseId,
  onBack,
  onAddItem,
}: {
  purchaseId: string;
  onBack: () => void;
  onAddItem: (store: string) => void;
}) {
  const { purchaseDetail, loading, error, loadDetail } = usePurchaseDetail();
  const { removeItem, loading: removing } = useRemovePurchaseItem();
  const { remove: deletePurch, loading: deleting } = useDeletePurchase();

  useEffect(() => {
    loadDetail(purchaseId);
  }, [purchaseId, loadDetail]);

  const handleRemoveItem = async (itemId: string) => {
    const success = await removeItem(itemId);
    if (success) {
      loadDetail(purchaseId);
    }
  };

  const handleDelete = async () => {
    const success = await deletePurch(purchaseId);
    if (success) {
      onBack();
    }
  };

  if (loading) {
    return (
      <Box padding={16}>
        <Stack space={16}>
          <Spinner />
          <Text2 regular>Carregando compra...</Text2>
        </Stack>
      </Box>
    );
  }

  if (error || !purchaseDetail) {
    return (
      <Box padding={16}>
        <Stack space={16}>
          <Text2 regular>{error || "Compra não encontrada"}</Text2>
          <ButtonSecondary onPress={onBack}>Voltar</ButtonSecondary>
        </Stack>
      </Box>
    );
  }

  return (
    <Box padding={16}>
      <Stack space={16}>
        <ButtonSecondary onPress={onBack}>← Voltar</ButtonSecondary>

        <Boxed>
          <Box padding={16}>
            <Stack space={8}>
              <Inline space="between" alignItems="center">
                <Title3 as="h2">{purchaseDetail.store}</Title3>
                <Tag type="active">{formatCurrency(purchaseDetail.total)}</Tag>
              </Inline>
              <Text2 regular>{formatDate(purchaseDetail.purchased_at)}</Text2>
              {purchaseDetail.notes && (
                <Text2 regular>{purchaseDetail.notes}</Text2>
              )}
            </Stack>
          </Box>
        </Boxed>

        <Inline space="between" alignItems="center">
          <Title3 as="h2">Itens ({purchaseDetail.items.length})</Title3>
          <ButtonPrimary small onPress={() => onAddItem(purchaseDetail.store)}>
            + Adicionar
          </ButtonPrimary>
        </Inline>

        {purchaseDetail.items.length === 0 ? (
          <Text2 regular>Nenhum item adicionado ainda.</Text2>
        ) : (
          <Stack space={8}>
            {purchaseDetail.items.map((item) => (
              <Boxed key={item.id}>
                <Box padding={12}>
                  <Stack space={4}>
                    <Inline space="between" alignItems="center">
                      <Text3 medium>{item.product.name}</Text3>
                      <Text3 medium>
                        {formatCurrency(item.price * item.quantity)}
                      </Text3>
                    </Inline>
                    <Inline space="between" alignItems="center">
                      <Text2 regular>
                        {item.quantity > 1
                          ? `${item.quantity}x ${formatCurrency(item.price)}`
                          : formatCurrency(item.price)}
                      </Text2>
                      <ButtonSecondary
                        small
                        onPress={() => handleRemoveItem(item.id)}
                      >
                        {removing ? "..." : "Remover"}
                      </ButtonSecondary>
                    </Inline>
                  </Stack>
                </Box>
              </Boxed>
            ))}
          </Stack>
        )}

        <Divider />

        <ButtonDanger onPress={handleDelete}>
          {deleting ? "Deletando..." : "Deletar compra"}
        </ButtonDanger>
      </Stack>
    </Box>
  );
}

// ─── Add Item Panel ───

function AddItemPanel({
  purchaseId,
  store,
  onBack,
}: {
  purchaseId: string;
  store: string;
  onBack: () => void;
}) {
  const { addItem, loading: adding } = useAddPurchaseItem();
  const {
    videoRef,
    scanning,
    barcode: scannedBarcode,
    startScanning,
    stopScanning,
  } = useBarcodeScanner();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductWithLatestPrice[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithLatestPrice | null>(null);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [success, setSuccess] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [loadingBarcode, setLoadingBarcode] = useState(false);

  // When barcode is scanned, look up the product
  useEffect(() => {
    if (!scannedBarcode) return;
    stopScanning();
    setScanError(null);
    setLoadingBarcode(true);
    findProductByBarcode(scannedBarcode)
      .then((product) => {
        if (product) {
          setSelectedProduct({
            ...product,
            latest_price: null,
            latest_store: null,
            price_count: 0,
          });
        } else {
          setScanError(
            `Produto com código ${scannedBarcode} não encontrado. Cadastre-o primeiro na aba Scanner.`,
          );
        }
      })
      .finally(() => setLoadingBarcode(false));
  }, [scannedBarcode, stopScanning]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const data = await searchProducts(query.trim());
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(handleSearch, 400);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const handleAddItem = async () => {
    if (!selectedProduct || !price) return;
    const result = await addItem(
      {
        purchase_id: purchaseId,
        product_id: selectedProduct.id,
        price: parseFloat(price),
        quantity: parseInt(quantity) || 1,
      },
      store,
    );
    if (result) {
      setSuccess(true);
      setSelectedProduct(null);
      setPrice("");
      setQuantity("1");
      setQuery("");
      setResults([]);
      setScanError(null);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <Box padding={16}>
      <Stack space={16}>
        <ButtonSecondary onPress={onBack}>← Voltar à compra</ButtonSecondary>

        <Title3 as="h2">Adicionar Item</Title3>

        {scanning && (
          <Stack space={16}>
            <video
              ref={videoRef}
              style={{ width: "100%", borderRadius: 8 }}
              autoPlay
              playsInline
              muted
            />
            <Text2 regular>Aponte a câmera para o código de barras...</Text2>
            <ButtonSecondary onPress={stopScanning}>
              Cancelar escaneamento
            </ButtonSecondary>
          </Stack>
        )}

        {loadingBarcode && (
          <Stack space={8}>
            <Spinner />
            <Text2 regular>Buscando produto...</Text2>
          </Stack>
        )}

        {!selectedProduct && !scanning && !loadingBarcode && (
          <Stack space={12}>
            <ButtonPrimary
              onPress={() => {
                setScanError(null);
                startScanning();
              }}
            >
              Escanear código de barras
            </ButtonPrimary>

            {scanError && (
              <Inline space={8} alignItems="center">
                <IconInformationUserRegular size={20} />
                <Text2 regular>{scanError}</Text2>
              </Inline>
            )}

            <Divider />

            <Text2 medium>Ou busque por nome:</Text2>
            <TextField
              name="searchProduct"
              label="Buscar produto (nome, código ou marca)"
              value={query}
              onChangeValue={setQuery}
            />

            {searching && <Spinner />}

            {results.length > 0 && (
              <Stack space={8}>
                {results.map((product) => (
                  <Boxed key={product.id}>
                    <Box padding={12}>
                      <Stack space={4}>
                        <Inline space="between" alignItems="center">
                          <Text3 medium>{product.name}</Text3>
                          {product.latest_price && (
                            <Tag type="info">
                              {`Último: ${formatCurrency(product.latest_price)}`}
                            </Tag>
                          )}
                        </Inline>
                        {product.brand && (
                          <Text2 regular>{product.brand}</Text2>
                        )}
                        <ButtonSecondary
                          small
                          onPress={() => {
                            setSelectedProduct(product);
                            if (product.latest_price) {
                              setPrice(product.latest_price.toString());
                            }
                          }}
                        >
                          Selecionar
                        </ButtonSecondary>
                      </Stack>
                    </Box>
                  </Boxed>
                ))}
              </Stack>
            )}

            {query.trim() && !searching && results.length === 0 && (
              <Text2 regular>Nenhum produto encontrado.</Text2>
            )}
          </Stack>
        )}

        {selectedProduct && (
          <Stack space={12}>
            <Boxed>
              <Box padding={12}>
                <Inline space="between" alignItems="center">
                  <Stack space={4}>
                    <Text3 medium>{selectedProduct.name}</Text3>
                    {selectedProduct.brand && (
                      <Text2 regular>{selectedProduct.brand}</Text2>
                    )}
                  </Stack>
                  <ButtonSecondary
                    small
                    onPress={() => {
                      setSelectedProduct(null);
                      setPrice("");
                    }}
                  >
                    Trocar
                  </ButtonSecondary>
                </Inline>
              </Box>
            </Boxed>

            <TextField
              name="itemPrice"
              label="Preço (R$)"
              value={price}
              onChangeValue={setPrice}
            />
            <TextField
              name="itemQuantity"
              label="Quantidade"
              value={quantity}
              onChangeValue={setQuantity}
            />

            <ButtonPrimary onPress={handleAddItem}>
              {adding ? "Adicionando..." : "Adicionar item"}
            </ButtonPrimary>
          </Stack>
        )}

        {success && <Tag type="success">Item adicionado!</Tag>}
      </Stack>
    </Box>
  );
}
