import { useState } from "react";
import {
  ThemeContextProvider,
  NavigationBar,
  Tabs,
  IconShoppingCartRegular,
  IconSearchRegular,
  IconBarcodeRegular,
  getVivoSkin,
} from "@telefonica/mistica";
import { DashboardView } from "./views/dashboard-view";
import { ScannerView } from "./views/scanner-view";
import { SearchView } from "./views/search-view";

const theme = {
  skin: getVivoSkin(),
  i18n: {
    locale: "pt-BR" as const,
    phoneNumberFormattingRegionCode: "BR" as const,
  },
};

const tabs = [
  { text: "Produtos", Icon: IconShoppingCartRegular },
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
      {selectedIndex === 1 && <ScannerView />}
      {selectedIndex === 2 && <SearchView />}
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
