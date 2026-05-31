import { useContext, useEffect, useState } from "react";
import CelestialBody3D from "../../components/CelestialBody3D/CelestialBody3D";
import "./EyesOnStarCitizen.css";
import { ContextAllData } from "../../contexts";
import { isSurfaceBodyType } from "../../utils";
import { Link, useParams, useSearchParams } from "react-router";
import CelestialBodyInfo from "../CelestialBodyInfo/CelestialBodyInfo";
import LocationInfo from "../LocationInfo/LocationInfo";
import CardCelestialBody from "./CardCelestialBody/CardCelestialBody";
import CardLocation from "./CardLocation/CardLocation";
import Icon from "@mdi/react";
import {
  mdiChevronUp,
  mdiClose,
  mdiHomeVariantOutline,
  mdiLayers,
  mdiMagnify,
} from "@mdi/js";
import { useTranslation } from "react-i18next";

const KEY_LAYERS_SETTING = "eosc.layersSetting";

const DEFAULT_LAYERS_SETTING = {
  showLocationLabels: true,
  showOrbitLines: true,
  showLongitudeLatitudeLines: false,
  showOMs: false,
  showSubsolarDirection: false,
  showNoQTMarkers: false,
  applyHDMaps: false,
  applyRealisticAtmosphere: false,
};

type LayersSetting = typeof DEFAULT_LAYERS_SETTING;

const LAYERS_SETTING_KEYS = Object.keys(DEFAULT_LAYERS_SETTING) as Array<
  keyof LayersSetting
>;

function loadLayersSetting(): LayersSetting {
  try {
    const raw = localStorage.getItem(KEY_LAYERS_SETTING);
    if (!raw) return DEFAULT_LAYERS_SETTING;

    const stored = JSON.parse(raw);
    if (!stored || typeof stored !== "object") return DEFAULT_LAYERS_SETTING;

    return LAYERS_SETTING_KEYS.reduce<LayersSetting>(
      (settings, key) => ({
        ...settings,
        [key]:
          typeof stored[key] === "boolean"
            ? stored[key]
            : DEFAULT_LAYERS_SETTING[key],
      }),
      { ...DEFAULT_LAYERS_SETTING }
    );
  } catch {
    return DEFAULT_LAYERS_SETTING;
  }
}

const EyesOnStarCitizen = ({ routing = "_" }: { routing: "_" | "b" | "l" }) => {
  const { t } = useTranslation();
  const { dictCelestialBodies, dictLocations, currentLocation } =
    useContext(ContextAllData);
  const celestialBodyKey = useParams()["*"] || "";
  const locationKey = useParams()["*"] || "";
  const [seeCelestialBody, setSeeCelestialBody] = useState<CelestialBody | null>(null);
  const seeLocation = dictLocations[locationKey] || null;
  const [isInfoCardOpen, setIsInfoCardOpen] = useState(true);
  const [isLayersSettingOpen, setIsLayersSettingOpen] = useState(false);

  /* Layers setting states */
  const [layersSetting, setLayersSetting] =
    useState<LayersSetting>(loadLayersSetting);

  const setLayerSetting = (key: keyof LayersSetting, value: boolean) => {
    setLayersSetting((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // DateTime Picker state stored in query params
  const [searchParams, setSearchParams] = useSearchParams();
  const searchDateTime = searchParams.get("datetime") || "";

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      searchParams.set("datetime", value);
    } else {
      searchParams.delete("datetime");
    }
    setSearchParams(searchParams, { replace: true });
  };

  const openSearch = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("search", "l");
    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    localStorage.setItem(KEY_LAYERS_SETTING, JSON.stringify(layersSetting));
  }, [layersSetting]);

  useEffect(() => {
    let tempCB = null;
    if (routing === "_") {
      tempCB =
        dictLocations[currentLocation]?.parentBody ||
        dictCelestialBodies[currentLocation] ||
        null;
      if (!tempCB) {
        tempCB = dictCelestialBodies["STANTON/II"];
      } else if (!isSurfaceBodyType(tempCB.type)) {
        tempCB = dictCelestialBodies["STANTON/II"];
      }
    } else if (routing === "b") {
      tempCB = dictCelestialBodies[celestialBodyKey] || null;
      if (tempCB && !isSurfaceBodyType(tempCB.type)) {
        tempCB = null;
      }
    } else if (routing === "l") {
      tempCB = dictLocations[locationKey]?.parentBody || null;
      if (tempCB && !isSurfaceBodyType(tempCB.type)) {
        tempCB = null;
      }
    }
    setSeeCelestialBody(tempCB);
  }, [
    routing,
    celestialBodyKey,
    locationKey,
    dictCelestialBodies,
    dictLocations,
    currentLocation,
  ]);

  if (!seeCelestialBody) {
    if (routing === "_") return null;
    if (routing === "b") return <CelestialBodyInfo />;
    if (routing === "l") return <LocationInfo />;
  }
  if (!seeCelestialBody) return null;

  return (
    <div className="EyesOnStarCitizen">
      <div style={{ width: "100%", height: "100%" }}>
        <CelestialBody3D
          celestialBody={seeCelestialBody}
          location={seeLocation}
          layersSetting={layersSetting}
        />
      </div>

      <nav className="special-nav-bar">
        <Link to="/" aria-label="Home">
          <Icon path={mdiHomeVariantOutline} size="1.5rem" />
        </Link>
        <button
          type="button"
          className="fake-search-bar"
          onClick={openSearch}
          aria-label="Open search"
        >
          <Icon path={mdiMagnify} size="1.25rem" />
        </button>
      </nav>

      <div className="date-time-picker-wrapper">
        <input
          type="datetime-local"
          value={searchDateTime}
          onChange={handleDateTimeChange}
          style={{ width: "100%", maxWidth: 240 }}
        />
        <button
          className="set-to-real-time"
          onClick={() => {
            searchParams.delete("datetime");
            setSearchParams(searchParams, { replace: true });
          }}
        >
          {t("EOSC.setToRealTime")}
        </button>
      </div>

      <div className={`info-card ${isInfoCardOpen ? "open" : ""}`}>
        <button
          className="info-card-toggle"
          onClick={() => setIsInfoCardOpen((prev) => !prev)}
        >
          <Icon path={mdiChevronUp} size={"1.5rem"} rotate={isInfoCardOpen ? 180 : 0} />
        </button>
        {routing === "l" ? (
          <CardLocation location={seeLocation} />
        ) : (
          <CardCelestialBody celestialBody={seeCelestialBody} />
        )}
      </div>

      <div className="layers-setting">
        <button
          className="layers-setting-toggle"
          onClick={() => setIsLayersSettingOpen((prev) => !prev)}
        >
          <Icon path={mdiLayers} size="1.5rem" />
        </button>
        <div className={`layers-setting-panel ${isLayersSettingOpen ? "open" : ""}`}>
          <button
            className="layers-setting-close"
            onClick={() => setIsLayersSettingOpen(false)}
          >
            <Icon path={mdiClose} size="1rem" />
          </button>
          <label>
            <input
              type="checkbox"
              checked={layersSetting.showLocationLabels}
              onChange={(e) => setLayerSetting("showLocationLabels", e.target.checked)}
            />
            {t("EOSC.showLocationLabels")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={layersSetting.showOrbitLines}
              onChange={(e) => setLayerSetting("showOrbitLines", e.target.checked)}
            />
            {t("EOSC.showOrbitLines")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={layersSetting.showLongitudeLatitudeLines}
              onChange={(e) =>
                setLayerSetting("showLongitudeLatitudeLines", e.target.checked)
              }
            />
            {t("EOSC.showLongitudeLatitudeLines")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={layersSetting.showOMs}
              onChange={(e) => setLayerSetting("showOMs", e.target.checked)}
            />
            {t("EOSC.showOMs")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={layersSetting.showSubsolarDirection}
              onChange={(e) =>
                setLayerSetting("showSubsolarDirection", e.target.checked)
              }
            />
            {t("EOSC.showSubsolarDirection")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={layersSetting.showNoQTMarkers}
              onChange={(e) => setLayerSetting("showNoQTMarkers", e.target.checked)}
            />
            {t("EOSC.showNoQTMarkers")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={layersSetting.applyHDMaps}
              onChange={(e) => setLayerSetting("applyHDMaps", e.target.checked)}
            />
            {t("EOSC.applyHDMaps")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={layersSetting.applyRealisticAtmosphere}
              onChange={(e) =>
                setLayerSetting("applyRealisticAtmosphere", e.target.checked)
              }
            />
            {t("EOSC.applyRealisticAtmosphere")}
          </label>
        </div>
      </div>
    </div>
  );
};

export default EyesOnStarCitizen;
