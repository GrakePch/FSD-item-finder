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
import Terminal from "./pages/Terminal/Terminal";
import ItemGroupInfo from "./pages/ItemGroupInfo/ItemGroupInfo";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import VehicleInfo from "./pages/VehicleInfo/VehicleInfo";

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
    <ContextAllData.Provider value={allData}>
      <NavBar />
      <Routes>
        <Route path="/" element={<SearchItems />} />
        <Route path="/v" element={<SearchVehicles />} />
        <Route path="/l" element={<SearchLocations />} />
        <Route path="/i/:itemKey" element={<ItemInfo />} />
        <Route path="/iv/:itemKey" element={<ItemGroupInfo />} />
        <Route path="/v/:vehicleClassName" element={<VehicleInfo />} />
        {/* <Route path="/b/:celestialBodyKey" element={<CelestialBodyInfo />} /> */}
        {/* <Route path="/l/:locationKey" element={<LocationInfo />} /> */}
        <Route path="/t/:terminalId" element={<Terminal />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
      <Footer />
    </ContextAllData.Provider>
  );
}

export default App;
