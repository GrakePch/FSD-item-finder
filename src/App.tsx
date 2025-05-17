import { useEffect, useState } from "react";
import "./App.css";
import SearchBar from "./components/SearchBar/SearchBar";
import { Route, Routes } from "react-router";
import {
  AllTerminalsContext,
  AllItemsPriceContext,
  BodiesAndLocationsContext,
} from "./contexts";
import { buildDataBodiesAndLocations } from "./utils";
import { fetchAndProcessTerminals } from "./api/terminals";
import { fetchAndProcessItems } from "./api/items";
import { fetchAndProcessVehicles } from "./api/vehicles";
import { buildItemsData } from "./api/itemsAndVehicles";
import Item from "./pages/Item/Item";
import Terminal from "./pages/Terminal/Terminal";
import Footer from "./components/Footer/Footer";
import TerminalIndex from "./pages/TerminalIndex/TerminalIndex";

function App() {
  const [terminalsData, setTerminalsData] = useState<TerminalDictionary>({});
  const [itemsData, setItemsData] = useState<Record<string, any>>({});
  const [bodiesAndLocationsData, setBodiesAndLocationsData] = useState<any[]>([{}, {}, {}]);
  const [item, setItem] = useState<any>(null);
  const [isItemsDataAcquired, setIsItemsDataAcquired] = useState<boolean>(false);

  const initializeAppData = async () => {
    const [dictSystems, dictBodies, dictLocations] = buildDataBodiesAndLocations();

    try {
      // Terminals
      const terminals = await fetchAndProcessTerminals(dictLocations);
      setTerminalsData(terminals);

      // Items
      let dictItem = await fetchAndProcessItems();

      // Vehicles
      dictItem = await fetchAndProcessVehicles(dictItem);

      // Build items data
      const tempItemsData = buildItemsData(dictItem);
      setItemsData(tempItemsData);
      setIsItemsDataAcquired(true);
    } catch (err) {
      setIsItemsDataAcquired(false);
      console.log(err);
    }

    setBodiesAndLocationsData([dictSystems, dictBodies, dictLocations]);
  };

  useEffect(() => {
    initializeAppData();
  }, []);

  return (
    <BodiesAndLocationsContext.Provider value={bodiesAndLocationsData}>
      <AllTerminalsContext.Provider value={terminalsData}>
        <AllItemsPriceContext.Provider value={itemsData}>
          <Routes>
            <Route
              path="/t"
              element={
                <>
                  <TerminalIndex />
                  <Footer />
                </>
              }
            />
            <Route
              path="/t/:tid"
              element={
                <>
                  <Terminal />
                  <Footer />
                </>
              }
            />
            <Route
              path="*"
              element={
                <>
                  <SearchBar
                    centered={item === null}
                    dataAcquired={isItemsDataAcquired}
                  />
                  <Item item={item} setItem={setItem} />
                  <Footer style={{ position: item ? "unset" : "absolute" }} />
                </>
              }
            />
          </Routes>
        </AllItemsPriceContext.Provider>
      </AllTerminalsContext.Provider>
    </BodiesAndLocationsContext.Provider>
  );
}

export default App;