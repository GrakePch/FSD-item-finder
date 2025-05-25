import { useEffect, useState } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { ContextAllData, AllData } from "./contexts";
import { buildDataBodiesAndLocations } from "./api/bodiesAndLocations";
import { fetchAndProcessTerminals } from "./api/terminals";
import { fetchAndProcessItems } from "./api/items";
import { fetchAndProcessVehicles } from "./api/vehicles";
import SearchItems from "./pages/SearchItems/SearchItems";
import SearchVehicles from "./pages/SearchVehicles/SearchVehicles";
import SearchLocations from "./pages/SearchLocations/SearchLocations";
import ItemInfo from "./pages/ItemInfo/ItemInfo";
import TerminalInfo from "./pages/TerminalInfo/TerminalInfo";
import ItemGroupInfo from "./pages/ItemGroupInfo/ItemGroupInfo";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import VehicleInfo from "./pages/VehicleInfo/VehicleInfo";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import LanguageToggle from "./components/LanguageToggle/LanguageToggle";
import CelestialBodyInfo from "./pages/CelestialBodyInfo/CelestialBodyInfo";
import LocationInfo from "./pages/LocationInfo/LocationInfo";

function App() {
  const [allData, setAllData] = useState<AllData>({
    dictSystems: {},
    dictCelestialBodies: {},
    dictLocations: {},
    dictTerminals: {},
    dictVehicles: {},
    dictItems: {},
  });

  const initializeAppData = async () => {
    const [dictSystems, dictBodies, dictLocations] = buildDataBodiesAndLocations();

    try {
      const dictTerminals = await fetchAndProcessTerminals(dictLocations);
      const dictVehicles = await fetchAndProcessVehicles();
      const dictItems = await fetchAndProcessItems();

      setAllData((prev) => ({
        ...prev,
        dictTerminals: dictTerminals,
        dictVehicles: dictVehicles,
        dictItems: dictItems,
      }));
    } catch (err) {
      console.log(err);
    }

    setAllData((prev) => ({
      ...prev,
      dictSystems: dictSystems,
      dictCelestialBodies: dictBodies,
      dictLocations: dictLocations,
    }));
  };

  useEffect(() => {
    initializeAppData();
  }, []);

  useEffect(() => console.log(allData), [allData]);

  return (
    <I18nextProvider i18n={i18n}>
      <ContextAllData.Provider value={allData}>
        <NavBar />
        <LanguageToggle />
        <Routes>
          <Route path="/" element={<SearchItems />} />
          <Route path="/v" element={<SearchVehicles />} />
          <Route path="/l" element={<SearchLocations />} />
          <Route path="/i/:itemKey" element={<ItemInfo />} />
          <Route path="/iv/:itemKey" element={<ItemGroupInfo />} />
          <Route path="/v/:vehicleClassName" element={<VehicleInfo />} />
          <Route path="/b/:celestialBodyKey" element={<CelestialBodyInfo />} />
          <Route path="/l/:locationKey" element={<LocationInfo />} />
          <Route path="/t/:terminalId" element={<TerminalInfo />} />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
        <Footer />
      </ContextAllData.Provider>
    </I18nextProvider>
  );
}

export default App;
