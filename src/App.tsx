import { useEffect, useState } from "react";
import "./App.css";
import { Route, Routes, useLocation } from "react-router";
import { ContextAllData, AllData } from "./contexts";
import { buildDataBodiesAndLocations } from "./api/bodiesAndLocations";
import { fetchAndProcessTerminals } from "./api/terminals";
import { fetchAndProcessItems } from "./api/items";
import { fetchAndProcessVehicles } from "./api/vehicles";
import SearchItems from "./pages/SearchItems/SearchItems";
import SearchVehicles from "./pages/SearchVehicles/SearchVehicles";
import ItemInfo from "./pages/ItemInfo/ItemInfo";
import TerminalInfo from "./pages/TerminalInfo/TerminalInfo";
import ItemGroupInfo from "./pages/ItemGroupInfo/ItemGroupInfo";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import VehicleInfo from "./pages/VehicleInfo/VehicleInfo";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import LanguageToggle from "./components/LanguageToggle/LanguageToggle";
import {
  KEY_CURRENT_LOCATION,
  WindowSelectCurrentLocation,
} from "./components/CurrentLocation/CurrentLocation";
import NavBarBottom from "./components/NavBarBottom/NavBarBottom";
import EyesOnStarCitizen from "./pages/EyesOnStarCitizen/EyesOnStarCitizen";

function App() {
  const [currentLocation, setCurrentLocation] = useState<string>(
    () => localStorage.getItem(KEY_CURRENT_LOCATION) || "Crusader"
  );
  const setCurrentLocationWithLocalStorage = (location: string) => {
    localStorage.setItem(KEY_CURRENT_LOCATION, location);
    setCurrentLocation(location);
  };

  const [allData, setAllData] = useState<AllData>({
    dictSystems: {},
    dictCelestialBodies: {},
    dictLocations: {},
    dictTerminals: {},
    dictVehicles: {},
    dictItems: {},
    currentLocation: currentLocation,
    setCurrentLocation: setCurrentLocationWithLocalStorage,
  });

  const location = useLocation();

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

  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path.startsWith("/i/") || path.startsWith("/iv/")) {
      document.title = "星际寻物";
    } else if (path === "/v" || path.startsWith("/v/")) {
      document.title = "星际寻船";
    } else if (
      path === "/l" ||
      path.startsWith("/l/") ||
      path.startsWith("/b/") ||
      path.startsWith("/t/")
    ) {
      document.title = "星际寻址";
    }
  }, [location]);

  useEffect(() => {
    // Check for 'from' in search params
    const params = new URLSearchParams(location.search);
    const fromParam = params.get("from");
    let stored = localStorage.getItem(KEY_CURRENT_LOCATION);
    if (fromParam) {
      setCurrentLocationWithLocalStorage(fromParam);
    } else {
      // If 'from' is not present, check if current location is stored
      if (!stored) {
        // If not, set default location
        localStorage.setItem(KEY_CURRENT_LOCATION, "Crusader");
      }
    }
  }, [location.search]);

  // Update allData.currentLocation when currentLocation changes
  useEffect(() => {
    setAllData((prev) => ({
      ...prev,
      currentLocation: currentLocation,
    }));
  }, [currentLocation]);

  return (
    <I18nextProvider i18n={i18n}>
      <ContextAllData.Provider value={allData}>
        <NavBar />
        <NavBarBottom />
        <Routes>
          <Route path="/" element={<SearchItems />} />
          <Route path="/v" element={<SearchVehicles />} />
          <Route path="/i/:itemKey" element={<ItemInfo />} />
          <Route path="/iv/:itemKey" element={<ItemGroupInfo />} />
          <Route path="/v/:vehicleClassName" element={<VehicleInfo />} />
          <Route path="/l"                   element={<EyesOnStarCitizen routing="_" />} />
          <Route path="/b/:celestialBodyKey" element={<EyesOnStarCitizen routing="b" />} />
          <Route path="/l/:locationKey"      element={<EyesOnStarCitizen routing="l" />} />
          <Route path="/t/:terminalId" element={<TerminalInfo />} />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
        <Footer />
        <LanguageToggle />
        <WindowSelectCurrentLocation />
      </ContextAllData.Provider>
    </I18nextProvider>
  );
}

export default App;
