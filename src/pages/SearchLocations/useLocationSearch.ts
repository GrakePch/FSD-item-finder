import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ContextAllData } from "../../contexts";
import { locationNameToI18nKey } from "../../utils";

const isNameOrI18nMatch = (
  normalizedSearchName: string,
  nameEn: string,
  nameI18n: string
) => {
  const nameMatch = nameEn.toLowerCase().includes(normalizedSearchName);
  const i18nMatch = nameI18n.toLowerCase().includes(normalizedSearchName);
  return nameMatch || i18nMatch;
};

export function useLocationSearch(searchName: string, includeTerminal = false) {
  const { t } = useTranslation();
  const { dictCelestialBodies, dictLocations, dictTerminals } =
    useContext(ContextAllData);
  const normalizedSearchName = searchName.trim().toLowerCase();

  const celestialBody = useMemo(
    () =>
      Object.values(dictCelestialBodies).filter((body) =>
        isNameOrI18nMatch(
          normalizedSearchName,
          body.name,
          t(locationNameToI18nKey(body.name), {
            ns: "locations",
            defaultValue: body.name,
          })
        )
      ),
    [dictCelestialBodies, normalizedSearchName, t]
  );

  const locations = useMemo(
    () =>
      normalizedSearchName
        ? Object.values(dictLocations).filter((location) =>
            isNameOrI18nMatch(
              normalizedSearchName,
              location.name,
              t(locationNameToI18nKey(location.name), {
                ns: "locations",
                defaultValue: location.name,
              })
            )
          )
        : [],
    [dictLocations, normalizedSearchName, t]
  );

  const terminals = useMemo(
    () =>
      includeTerminal && normalizedSearchName
        ? Object.values(dictTerminals).filter((terminal) => {
            const terminalNameEn = Array.isArray(terminal.location_path)
              ? terminal.location_path
                  .slice(3)
                  .map((name) =>
                    t(locationNameToI18nKey(name), {
                      ns: "locations",
                      defaultValue: name,
                      lng: "en",
                    })
                  )
                  .join(" - ")
              : "";
            const terminalNameI18n = Array.isArray(terminal.location_path)
              ? terminal.location_path
                  .slice(3)
                  .map((name) =>
                    t(locationNameToI18nKey(name), {
                      ns: "locations",
                      defaultValue: name,
                    })
                  )
                  .join(" - ")
              : "";
            return isNameOrI18nMatch(
              normalizedSearchName,
              terminalNameEn,
              terminalNameI18n
            );
          })
        : [],
    [dictTerminals, includeTerminal, normalizedSearchName, t]
  );

  return {
    celestialBody,
    locations,
    terminals,
  };
}
