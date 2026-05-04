import { useEffect, useState } from "react";
import {
  Stack,
  Title1,
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
} from "@telefonica/mistica";
import { useProducts } from "../hooks/use-products";
import type { ProductWithLatestPrice } from "../infra/product-gateway";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function ProductCard({ product }: { product: ProductWithLatestPrice }) {
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
        </Stack>
      </Box>
    </Boxed>
  );
}

export function DashboardView() {
  const { products, loading, error, loadProducts } = useProducts();
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
              <ProductCard key={product.id} product={product} />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
