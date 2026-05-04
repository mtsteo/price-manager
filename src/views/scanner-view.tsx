import { useState, useEffect } from "react";
import {
  Stack,
  Title1,
  Text2,
  Box,
  Boxed,
  ButtonPrimary,
  ButtonSecondary,
  TextField,
  Spinner,
  Inline,
  Tag,
  IconSearchRegular,
  IconInformationUserRegular,
  Divider,
} from "@telefonica/mistica";
import { useBarcodeScanner } from "../hooks/use-barcode-scanner";
import {
  useBarcodeSearch,
  useAddPrice,
  useCreateProduct,
} from "../hooks/use-products";

export function ScannerView() {
  const {
    videoRef,
    scanning,
    barcode,
    error: scanError,
    startScanning,
    stopScanning,
  } = useBarcodeScanner();
  const {
    product,
    loading,
    error: searchError,
    notFound,
    searchByBarcode,
    reset,
  } = useBarcodeSearch();
  const { create: createProduct, loading: creating } = useCreateProduct();
  const { addPrice, loading: addingPrice } = useAddPrice();

  const [manualBarcode, setManualBarcode] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductBrand, setNewProductBrand] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [price, setPrice] = useState("");
  const [store, setStore] = useState("");
  const [success, setSuccess] = useState(false);

  const handleBarcodeDetected = (code: string) => {
    searchByBarcode(code);
  };

  const handleManualSearch = () => {
    if (manualBarcode.trim()) {
      handleBarcodeDetected(manualBarcode.trim());
    }
  };

  const handleRegisterPrice = async () => {
    if (!product || !price) return;
    const result = await addPrice({
      product_id: product.id,
      price: parseFloat(price),
      store: store || null,
    });
    if (result) {
      setSuccess(true);
      setPrice("");
      setStore("");
    }
  };

  const handleCreateProduct = async () => {
    if (!newProductName || (!barcode && !manualBarcode)) return;
    const created = await createProduct({
      barcode: barcode || manualBarcode,
      name: newProductName,
      brand: newProductBrand || null,
      category: newProductCategory || null,
    });
    if (created) {
      searchByBarcode(created.barcode);
      setNewProductName("");
      setNewProductBrand("");
      setNewProductCategory("");
    }
  };

  useEffect(() => {
    if (barcode && !scanning && !product && !loading && !notFound) {
      handleBarcodeDetected(barcode);
    }
  }, [barcode, scanning, product, loading, notFound]);

  return (
    <Box padding={16}>
      <Stack space={24}>
        <Title1>Scanner de Produto</Title1>

        {!scanning && !product && !notFound && (
          <Stack space={16}>
            <ButtonPrimary onPress={startScanning}>
              Escanear Código de Barras
            </ButtonPrimary>

            <Divider />

            <Text2 medium>Ou busque manualmente:</Text2>
            <TextField
              name="barcode"
              label="Código de barras"
              value={manualBarcode}
              onChangeValue={setManualBarcode}
            />
            <ButtonSecondary onPress={handleManualSearch}>
              Buscar
            </ButtonSecondary>
          </Stack>
        )}

        {scanning && (
          <Stack space={16}>
            <video
              ref={videoRef}
              style={{ width: "100%", borderRadius: 8 }}
              autoPlay
              playsInline
              muted
            />
            <ButtonSecondary onPress={stopScanning}>
              Cancelar Escaneamento
            </ButtonSecondary>
          </Stack>
        )}

        {loading && (
          <Stack space={16}>
            <Spinner />
            <Text2 regular>Buscando produto...</Text2>
          </Stack>
        )}

        {(scanError || searchError) && (
          <Inline space={8} alignItems="center">
            <IconInformationUserRegular size={20} />
            <Text2 regular>{scanError || searchError}</Text2>
          </Inline>
        )}

        {product && (
          <Stack space={16}>
            <Boxed>
              <Box padding={16}>
                <Stack space={8}>
                  <Inline space="between" alignItems="center">
                    <Text2 medium>{product.name}</Text2>
                    <Tag type="success">Encontrado</Tag>
                  </Inline>
                  {product.brand && <Text2 regular>{product.brand}</Text2>}
                  <Text2 regular>Cód: {product.barcode}</Text2>
                </Stack>
              </Box>
            </Boxed>

            <Divider />

            <Text2 medium>Registrar novo preço</Text2>
            <TextField
              name="price"
              label="Preço (R$)"
              value={price}
              onChangeValue={setPrice}
            />
            <TextField
              name="store"
              label="Loja (opcional)"
              value={store}
              onChangeValue={setStore}
            />
            <ButtonPrimary onPress={handleRegisterPrice}>
              {addingPrice ? "Salvando..." : "Registrar Preço"}
            </ButtonPrimary>

            {success && <Tag type="success">Preço registrado com sucesso!</Tag>}

            <ButtonSecondary
              onPress={() => {
                reset();
                setSuccess(false);
              }}
            >
              Escanear outro produto
            </ButtonSecondary>
          </Stack>
        )}

        {notFound && (
          <Stack space={16}>
            <Boxed>
              <Box padding={16}>
                <Stack space={8}>
                  <Inline space={8} alignItems="center">
                    <IconSearchRegular size={20} />
                    <Text2 medium>Produto não encontrado</Text2>
                  </Inline>
                  <Text2 regular>Código: {barcode || manualBarcode}</Text2>
                </Stack>
              </Box>
            </Boxed>

            <Divider />

            <Text2 medium>Cadastrar novo produto</Text2>
            <TextField
              name="productName"
              label="Nome do produto"
              value={newProductName}
              onChangeValue={setNewProductName}
            />
            <TextField
              name="productBrand"
              label="Marca (opcional)"
              value={newProductBrand}
              onChangeValue={setNewProductBrand}
            />
            <TextField
              name="productCategory"
              label="Categoria (opcional)"
              value={newProductCategory}
              onChangeValue={setNewProductCategory}
            />
            <ButtonPrimary onPress={handleCreateProduct}>
              {creating ? "Cadastrando..." : "Cadastrar Produto"}
            </ButtonPrimary>

            <ButtonSecondary
              onPress={() => {
                reset();
                setManualBarcode("");
              }}
            >
              Voltar
            </ButtonSecondary>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
