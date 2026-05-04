import { useState, useEffect } from "react";
import {
  Stack,
  Title1,
  Text2,
  Text3,
  Box,
  Boxed,
  TextField,
  Spinner,
  Inline,
  Tag,
  IconShoppingCartRegular,
  Divider,
} from "@telefonica/mistica";
import { useProductSearch } from "../hooks/use-products";
import type { ProductWithLatestPrice } from "../infra/product-gateway";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function SearchResultCard({ product }: { product: ProductWithLatestPrice }) {
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
          <Text2 regular>Cód: {product.barcode}</Text2>
          {product.latest_store && (
            <Text2 regular>Última loja: {product.latest_store}</Text2>
          )}
        </Stack>
      </Box>
    </Boxed>
  );
}

export function SearchView() {
  const { results, loading, error, search } = useProductSearch();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      search(query);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, search]);

  return (
    <Box padding={16}>
      <Stack space={24}>
        <Title1>Buscar Produtos</Title1>

        <TextField
          name="search"
          label="Nome, código ou marca"
          value={query}
          onChangeValue={setQuery}
        />

        {loading && <Spinner />}

        {error && <Text2 regular>{error}</Text2>}

        {!loading && query && results.length === 0 && (
          <Stack space={16}>
            <IconShoppingCartRegular size={48} />
            <Text2 regular>Nenhum produto encontrado para "{query}"</Text2>
          </Stack>
        )}

        {results.length > 0 && (
          <Stack space={8}>
            <Text2 regular>
              {results.length} resultado{results.length !== 1 ? "s" : ""}
            </Text2>
            <Divider />
            {results.map((product) => (
              <SearchResultCard key={product.id} product={product} />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
