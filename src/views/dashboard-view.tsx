import { useEffect, useState } from "react";
import {
  Stack,
  Title1,
  Title3,
  Text2,
  Text3,
  Inline,
  Box,
  Boxed,
  SkeletonRectangle,
  Tag,
  IconShoppingCartRegular,
  IconInformationUserRegular,
  Chip,
  Divider,
  ButtonSecondary,
  Spinner,
} from "@telefonica/mistica";
import { useProducts, useProductDetail } from "../hooks/use-products";
import type { ProductWithLatestPrice } from "../infra/product-gateway";

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

function ProductCard({
  product,
  onPress,
}: {
  product: ProductWithLatestPrice;
  onPress: () => void;
}) {
  return (
    <Boxed>
      <Box padding={16}>
        <Stack space={8}>
          <Inline space="between" alignItems="center">
            <Text3 medium>{product.name}</Text3>
            {product.latest_price !== null && (
              <Tag type="active">{formatCurrency(product.latest_price)}</Tag>
            )}
          </Inline>
          <Inline space={8}>
            {product.brand && <Text2 regular>{product.brand}</Text2>}
            {product.category && <Tag type="info">{product.category}</Tag>}
          </Inline>
          <Inline space="between" alignItems="center">
            <Text2 regular>
              {product.price_count} registro
              {product.price_count !== 1 ? "s" : ""} de preço
            </Text2>
            {product.latest_store && (
              <Text2 regular>{product.latest_store}</Text2>
            )}
          </Inline>
          <ButtonSecondary small onPress={onPress}>
            Ver histórico
          </ButtonSecondary>
        </Stack>
      </Box>
    </Boxed>
  );
}

function ProductDetailPanel({
  productId,
  onBack,
}: {
  productId: string;
  onBack: () => void;
}) {
  const { productDetail, loading, error, loadDetail } = useProductDetail();

  useEffect(() => {
    loadDetail(productId);
  }, [productId, loadDetail]);

  if (loading) {
    return (
      <Box padding={16}>
        <Stack space={16}>
          <Spinner />
          <Text2 regular>Carregando histórico...</Text2>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding={16}>
        <Stack space={16}>
          <IconInformationUserRegular size={32} />
          <Text2 regular>{error}</Text2>
          <ButtonSecondary onPress={onBack}>Voltar</ButtonSecondary>
        </Stack>
      </Box>
    );
  }

  if (!productDetail) return null;

  return (
    <Box padding={16}>
      <Stack space={16}>
        <ButtonSecondary onPress={onBack}>← Voltar</ButtonSecondary>

        <Boxed>
          <Box padding={16}>
            <Stack space={8}>
              <Title3 as="h2">{productDetail.name}</Title3>
              {productDetail.brand && (
                <Text2 regular>{productDetail.brand}</Text2>
              )}
              <Text2 regular>Cód: {productDetail.barcode}</Text2>
              {productDetail.category && (
                <Tag type="info">{productDetail.category}</Tag>
              )}
            </Stack>
          </Box>
        </Boxed>

        <Title3 as="h2">Histórico de Preços</Title3>

        {productDetail.price_records.length === 0 ? (
          <Text2 regular>Nenhum preço registrado ainda.</Text2>
        ) : (
          <Stack space={8}>
            {productDetail.price_records
              .slice()
              .reverse()
              .map((record) => (
                <Boxed key={record.id}>
                  <Box padding={12}>
                    <Inline space="between" alignItems="center">
                      <Stack space={4}>
                        <Text3 medium>{formatCurrency(record.price)}</Text3>
                        <Text2 regular>{formatDate(record.recorded_at)}</Text2>
                      </Stack>
                      {record.store && <Tag type="info">{record.store}</Tag>}
                    </Inline>
                  </Box>
                </Boxed>
              ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export function DashboardView() {
  const { products, loading, error, loadProducts } = useProducts();
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  if (selectedProductId) {
    return (
      <ProductDetailPanel
        productId={selectedProductId}
        onBack={() => setSelectedProductId(null)}
      />
    );
  }

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean)),
  ) as string[];

  const filteredProducts = filter
    ? products.filter((p) => p.category === filter)
    : products;

  const totalProducts = products.length;
  const productsWithPrice = products.filter((p) => p.latest_price !== null);
  const avgPrice =
    productsWithPrice.length > 0
      ? productsWithPrice.reduce((sum, p) => sum + (p.latest_price ?? 0), 0) /
        productsWithPrice.length
      : 0;

  if (loading) {
    return (
      <Box padding={24}>
        <Stack space={16}>
          <SkeletonRectangle height={32} />
          <SkeletonRectangle height={80} />
          <SkeletonRectangle height={80} />
          <SkeletonRectangle height={80} />
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding={24}>
        <Stack space={16}>
          <IconInformationUserRegular size={48} />
          <Text2 regular>{error}</Text2>
        </Stack>
      </Box>
    );
  }

  return (
    <Box padding={16}>
      <Stack space={24}>
        <Title1>Meus Produtos</Title1>

        <Inline space={16}>
          <Boxed>
            <Box padding={16}>
              <Stack space={4}>
                <Text2 regular>Total produtos</Text2>
                <Text3 medium>{totalProducts}</Text3>
              </Stack>
            </Box>
          </Boxed>
          <Boxed>
            <Box padding={16}>
              <Stack space={4}>
                <Text2 regular>Preço médio</Text2>
                <Text3 medium>
                  {avgPrice > 0 ? formatCurrency(avgPrice) : "-"}
                </Text3>
              </Stack>
            </Box>
          </Boxed>
        </Inline>

        {categories.length > 0 && (
          <Stack space={8}>
            <Text2 medium>Filtrar por categoria</Text2>
            <Inline space={8}>
              <Chip active={filter === null} onPress={() => setFilter(null)}>
                Todos
              </Chip>
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  active={filter === cat}
                  onPress={() => setFilter(cat)}
                >
                  {cat}
                </Chip>
              ))}
            </Inline>
          </Stack>
        )}

        <Divider />

        {filteredProducts.length === 0 ? (
          <Stack space={16}>
            <IconShoppingCartRegular size={48} />
            <Text2 regular>Nenhum produto cadastrado ainda</Text2>
          </Stack>
        ) : (
          <Stack space={8}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => setSelectedProductId(product.id)}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
