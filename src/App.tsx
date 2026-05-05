import { useState } from "react";
import {
  ThemeContextProvider,
  NavigationBar,
  Tabs,
  IconShoppingCartRegular,
  IconSearchRegular,
  IconBarcodeRegular,
  IconListRegular,
  getVivoSkin,
} from "@telefonica/mistica";
import { DashboardView } from "./views/dashboard-view";
import { ScannerView } from "./views/scanner-view";
import { SearchView } from "./views/search-view";
import { PurchasesView } from "./views/purchases-view";

const colorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

const theme = {
  skin: getVivoSkin(),
  colorScheme: colorScheme as "dark" | "light",
  i18n: {
    locale: "pt-BR" as const,
    phoneNumberFormattingRegionCode: "BR" as const,
  },
};

const tabs = [
  { text: "Produtos", Icon: IconShoppingCartRegular },
  { text: "Compras", Icon: IconListRegular },
  { text: "Scanner", Icon: IconBarcodeRegular },
  { text: "Busca", Icon: IconSearchRegular },
];

function AppContent() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <>
      <NavigationBar title="Price Manager" />
      <Tabs
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
        tabs={tabs}
      />
      {selectedIndex === 0 && <DashboardView />}
      {selectedIndex === 1 && <PurchasesView />}
      {selectedIndex === 2 && <ScannerView />}
      {selectedIndex === 3 && <SearchView />}
    </>
  );
}

export function App() {
  return (
    <ThemeContextProvider theme={theme}>
      <AppContent />
    </ThemeContextProvider>
  );
}
