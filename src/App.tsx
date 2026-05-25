import { lazy, Suspense, type ReactNode, useEffect, useRef, useState } from "react";
import styles from "./App.module.css";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { ContextAllData, AllData } from "./contexts";
import { buildDataBodiesAndLocations } from "./api/bodiesAndLocations";
import { fetchAndProcessTerminals } from "./api/terminals";
import { fetchAndProcessItems, fetchItemCatalogDictionary } from "./api/items";
import { fetchAndProcessVehicles } from "./api/vehicles";
import { fetchCategoriesAttributes } from "./api/categoriesAttributes";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import LanguageToggle from "./components/LanguageToggle/LanguageToggle";
import {
  DEFAULT_CURRENT_BODY_CODE,
  KEY_CURRENT_LOCATION,
  WindowSelectCurrentLocation,
} from "./components/CurrentLocation/CurrentLocation";
import { setUEXAttributes } from "./utils";
import UniversalSearch from "./components/UniversalSearch/UniversalSearch";

const SearchItems = lazy(() => import("./pages/SearchItems/SearchItems"));
const ItemInfo = lazy(() => import("./pages/ItemInfo/ItemInfo"));
const ItemGroupInfo = lazy(() => import("./pages/ItemGroupInfo/ItemGroupInfo"));
const TerminalInfo = lazy(() => import("./pages/TerminalInfo/TerminalInfo"));
const VehicleInfo = lazy(() => import("./pages/VehicleInfo/VehicleInfo"));
const EyesOnStarCitizen = lazy(
  () => import("./pages/EyesOnStarCitizen/EyesOnStarCitizen")
);

type LoadState = "loading" | "ready" | "error";

function route(element: ReactNode) {
  return <Suspense fallback={null}>{element}</Suspense>;
}

function LoadingScreen() {
  return (
    <div className={styles.appLoading}>
      <div className={styles.appLoadingSpinner} />
      <p>正在加载数据…</p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className={styles.appError}>
      <h2>数据加载失败</h2>
      <p>{message}</p>
      <button onClick={() => window.location.reload()}>重试</button>
    </div>
  );
}

function App() {
  const [currentLocation, setCurrentLocation] = useState<string>(
    () => localStorage.getItem(KEY_CURRENT_LOCATION) || DEFAULT_CURRENT_BODY_CODE
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

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const location = useLocation();

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeAppData = async () => {
      // Synchronous data build
      const [dictSystems, dictBodies, dictLocations] = buildDataBodiesAndLocations();
      const normalizedCurrentLocation = normalizeCurrentLocation(
        currentLocation,
        dictBodies,
        dictLocations
      );
      if (normalizedCurrentLocation !== currentLocation) {
        setCurrentLocationWithLocalStorage(normalizedCurrentLocation);
      }
      setAllData((prev) => ({
        ...prev,
        dictSystems,
        dictCelestialBodies: dictBodies,
        dictLocations,
        currentLocation: normalizedCurrentLocation,
      }));

      // Fire all async fetches in parallel, track results
      const results = await Promise.allSettled([
        fetchCategoriesAttributes().then((attrs) => {
          setUEXAttributes(attrs);
          setAllData((prev) => ({ ...prev }));
          return "categories";
        }),
        fetchItemCatalogDictionary()
          .then((dictItems) => {
            setAllData((prev) => ({ ...prev, dictItems }));
            return fetchAndProcessItems(dictItems);
          })
          .then((dictItems) => {
            setAllData((prev) => ({ ...prev, dictItems }));
            return "items";
          }),
        fetchAndProcessTerminals(dictLocations).then((dictTerminals) => {
          setAllData((prev) => ({ ...prev, dictTerminals }));
          return "terminals";
        }),
        fetchAndProcessVehicles().then((dictVehicles) => {
          setAllData((prev) => ({ ...prev, dictVehicles }));
          return "vehicles";
        }),
      ]);

      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length === results.length) {
        // All fetches failed
        const messages = failures.map(
          (f) => (f as PromiseRejectedResult).reason?.message || "未知错误"
        );
        setLoadError(messages.join("；"));
        setLoadState("error");
      } else if (failures.length > 0) {
        // Partial failure - app is still usable
        console.warn(
          `${failures.length}/${results.length} data sources failed to load`
        );
        failures.forEach((f) =>
          console.error("Data load failure:", (f as PromiseRejectedResult).reason)
        );
        setLoadState("ready");
      } else {
        setLoadState("ready");
      }
    };

    initializeAppData();
  }, []);

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
    const params = new URLSearchParams(location.search);
    const fromParam = params.get("from");
    const stored = localStorage.getItem(KEY_CURRENT_LOCATION);
    if (fromParam) {
      setCurrentLocationWithLocalStorage(
        fromParam.startsWith("_loc_") ? DEFAULT_CURRENT_BODY_CODE : fromParam
      );
    } else {
      if (!stored) {
        localStorage.setItem(KEY_CURRENT_LOCATION, DEFAULT_CURRENT_BODY_CODE);
      }
    }
  }, [location.search]);

  useEffect(() => {
    setAllData((prev) => ({
      ...prev,
      currentLocation: currentLocation,
    }));
  }, [currentLocation]);

  if (location.pathname === "/v") {
    return <Navigate to="/" replace />;
  }

  if (loadState === "loading") {
    return (
      <I18nextProvider i18n={i18n}>
        <LoadingScreen />
      </I18nextProvider>
    );
  }

  if (loadState === "error") {
    return (
      <I18nextProvider i18n={i18n}>
        <ErrorScreen message={loadError || "无法加载应用数据"} />
      </I18nextProvider>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ContextAllData.Provider value={allData}>
        <NavBar />
        <Routes>
          <Route path="/" element={route(<SearchItems />)} />
          <Route path="/v" element={<Navigate to="/" replace />} />
          <Route path="/i/:itemKey" element={route(<ItemInfo />)} />
          <Route path="/iv/:itemKey" element={route(<ItemGroupInfo />)} />
          <Route path="/v/:vehicleClassName" element={route(<VehicleInfo />)} />
          <Route
            path="/l"
            element={route(<EyesOnStarCitizen routing="_" />)}
          />
          <Route
            path="/b/*"
            element={route(<EyesOnStarCitizen routing="b" />)}
          />
          <Route
            path="/l/*"
            element={route(<EyesOnStarCitizen routing="l" />)}
          />
          <Route path="/t/:terminalId" element={route(<TerminalInfo />)} />
        </Routes>
        <Footer />
        <LanguageToggle />
        <WindowSelectCurrentLocation />
        <UniversalSearch />
      </ContextAllData.Provider>
    </I18nextProvider>
  );
}

export default App;

function normalizeCurrentLocation(
  value: string,
  dictBodies: CelestialBodyDictionary,
  dictLocations: LocationDictionary
) {
  if (dictLocations[value]) return value;
  return dictBodies[value] ? value : DEFAULT_CURRENT_BODY_CODE;
}
