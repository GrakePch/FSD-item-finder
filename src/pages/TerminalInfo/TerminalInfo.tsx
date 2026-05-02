import { useNavigate, useParams, useSearchParams } from "react-router";
import "./TerminalInfo.css";
import { useContext, useEffect, useState } from "react";
import { ContextAllData } from "../../contexts";
import {
  fetchTerminalItemPrices,
  type TerminalItemPriceDictionary,
} from "../../api/terminalItemPrices";
import {
  classToColor,
  getAttributeValueByName,
  locationNameToI18nKey,
  signalToColor,
  sizeToColor,
  toI18nKey,
  typeCapitalizedToKey,
} from "../../utils";
import Icon from "@mdi/react";
import { icon } from "../../assets/icon";
import { mdiClose, mdiMagnify } from "@mdi/js";
import { useTranslation } from "react-i18next";
import TerminalCard from "../../components/TerminalCard/TerminalCard";
import LocationCard from "../../components/LocationCard/LocationCard";
import useDebouncedValue from "../../hooks/useDebouncedValue";

const TerminalInfo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dictTerminals, dictItems } = useContext(ContextAllData);
  const terminalId = useParams().terminalId;
  const [terminalInfo, setTerminalInfo] = useState<Terminal | null>(null);
  const [rawDictItemsPrices, setRawDictItemsPrices] =
    useState<TerminalItemPriceDictionary>({});
  const [isLoadingTerminalPrices, setIsLoadingTerminalPrices] = useState(false);
  const [terminalPricesError, setTerminalPricesError] = useState(false);
  const [listItemsOfTerminal, setListItemsOfTerminal] = useState<Item[]>([]);
  const [hashSetSubTypes, setHashSetSubTypes] = useState<Set<string>>(new Set<string>());
  const [searchString, setSearchString] = useState("");
  const debouncedSearchString = useDebouncedValue(searchString);
  const [filterSubType, setFilterSubType] = useState("");
  const [listTerminalsNearby, setListTerminalsNearby] = useState<Terminal[]>([]);

  function getTerminalItemPrice(item: Item) {
    return (item.ids || [])
      .map((id) => rawDictItemsPrices[id])
      .filter((price) => price?.price_buy > 0)
      .sort((a, b) => a.price_buy - b.price_buy)[0];
  }

  useEffect(() => {
    if (searchParams.get("key")) {
      searchParams.delete("key");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    const _tInfo = terminalId ? dictTerminals[terminalId] || null : null;
    setTerminalInfo(_tInfo);

    let _tempListTerminalsNearby: Terminal[] = [];
    if (_tInfo && _tInfo.parentLocation) {
      /* Get Nearby Terminal */
      _tempListTerminalsNearby = _tInfo.parentLocation.terminals.filter(
        (t: Terminal) => t.id.toString() != terminalId
      );
    }
    setListTerminalsNearby(_tempListTerminalsNearby);
  }, [terminalId, dictTerminals]);

  /* API Fetch: Get items prices at this terminal */
  useEffect(() => {
    if (!terminalId) return;

    let isCurrent = true;
    setIsLoadingTerminalPrices(true);
    setTerminalPricesError(false);
    setRawDictItemsPrices({});

    fetchTerminalItemPrices(terminalId)
      .then((prices) => {
        if (!isCurrent) return;
        setRawDictItemsPrices(prices);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setRawDictItemsPrices({});
        setTerminalPricesError(true);
        console.error("Failed to load terminal item prices", err);
      })
      .finally(() => {
        if (!isCurrent) return;
        setIsLoadingTerminalPrices(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [terminalId]);

  /* Process API raw data */
  useEffect(() => {
    const _tempList = Object.values(dictItems)
      .filter((item) => getTerminalItemPrice(item))
      .sort((a, b) =>
        t(a.key, { ns: "items", lng: "en" }).localeCompare(
          t(b.key, { ns: "items", lng: "en" })
        )
      );
    // .sort((a, b) => a.sub_type.localeCompare(b.sub_type))
    // .sort((a, b) => a.type.localeCompare(b.type));

    setListItemsOfTerminal(_tempList);

    const _tempSet = new Set<string>();
    _tempList.forEach((item) => {
      if (item.sub_type) _tempSet.add(item.sub_type);
    });
    setHashSetSubTypes(_tempSet);
  }, [dictItems, rawDictItemsPrices, t]);

  const handleResultClick = (key: string) => {
    searchParams.delete("searchFocus");
    navigate(`/i/${key}?${searchParams.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchString(e.target.value);
  const normalizedSearchString = debouncedSearchString.trim().toLocaleLowerCase();

  return (
    <div className="TerminalInfo">
      {terminalInfo ? (
        <>
          <div className="basic-info">
            <div className="name">
              <h1>
                {terminalInfo.location_path
                  .slice(3)
                  .map((n) => t(locationNameToI18nKey(n), { ns: "locations" }))
                  .join(" - ")}
              </h1>
              <h2>{terminalInfo.name}</h2>
            </div>
            <h3 className="type">{t(`UEXTerminalType.${terminalInfo.type}`)}</h3>
            <h3 className="faction">{terminalInfo.name_faction}</h3>
          </div>
          {terminalInfo.parentLocation && (
            <div className="location-links">
              <h4>{t(`LocationInfo.titleParentLocation`)}</h4>
              <ul>
                <li>
                  <LocationCard location={terminalInfo.parentLocation} />
                </li>
              </ul>
            </div>
          )}
          {listTerminalsNearby.length > 0 && (
            <div className="location-links">
              <h4>{t("TerminalInfo.nearby")}</h4>
              <ul className="nearby-terminals">
                {listTerminalsNearby.map((tnb) => (
                  <li key={tnb.id}>
                    <TerminalCard terminal={tnb} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {terminalInfo.type === "item" ? (
            <div className="search-and-list">
              <div className="searchbar-container">
                <input
                  type="text"
                  id="searchbar"
                  placeholder={t("TerminalInfoSearchBar.placeholder")}
                  value={searchString}
                  onChange={handleSearchChange}
                />
                <Icon className="icon-search" path={mdiMagnify} size="1.5rem" />
                {searchString && (
                  <button className="btn-clear" onClick={() => setSearchString("")}>
                    <Icon className="icon-clear" path={mdiClose} size="1.5rem" />
                  </button>
                )}
              </div>
              <div className="filters-for-sub-type">
                <button
                  className={!filterSubType ? "active" : undefined}
                  onClick={() => setFilterSubType("")}
                >
                  {t("FilterType.all")}
                </button>
                {Array.from(hashSetSubTypes).map((subType) => (
                  <button
                    key={subType}
                    className={filterSubType === subType ? "active" : undefined}
                    onClick={() =>
                      setFilterSubType(filterSubType === subType ? "" : subType)
                    }
                  >
                    {t("FilterType." + typeCapitalizedToKey(subType))}
                  </button>
                ))}
              </div>
              <div className="list-sell">
                {isLoadingTerminalPrices ? (
                  <p className="terminal-items-status">
                    {t("TerminalInfo.loadingItems")}
                  </p>
                ) : terminalPricesError ? (
                  <p className="terminal-items-status">
                    {t("TerminalInfo.pricesUnavailable")}
                  </p>
                ) : listItemsOfTerminal.length === 0 ? (
                  <p className="terminal-items-status">
                    {t("TerminalInfo.noItems")}
                  </p>
                ) : (
                  listItemsOfTerminal
                  .filter((item) => !filterSubType || item.sub_type === filterSubType)
                  .filter(
                    (item) =>
                      !normalizedSearchString ||
                      t(item.key, { ns: "items", lng: "en" })
                        .toLocaleLowerCase()
                        .includes(normalizedSearchString) ||
                      t(item.key, { ns: "items", lng: "zh" })
                        ?.toLocaleLowerCase()
                        ?.includes(normalizedSearchString)
                  )
                  .map((item) => {
                    const terminalItemPrice = getTerminalItemPrice(item);
                    let attrsize: string | null = null;
                    let attrClass: string | null = null;
                    let attrGrade: string | null = null;
                    let attrTrackSignal: string | undefined;
                    if (item.type === "Systems") {
                      attrsize = getAttributeValueByName("Size", item.attributes);
                      attrClass = getAttributeValueByName("Class", item.attributes);
                      attrGrade = getAttributeValueByName("Grade", item.attributes);
                    }
                    if (item.type === "Vehicle Weapons") {
                      attrsize = getAttributeValueByName("Size", item.attributes);
                      attrTrackSignal = item.attributes?.[112];
                    }
                    if (item.sub_type === "Attachments") {
                      attrsize = getAttributeValueByName("Size", item.attributes);
                    }
                    return (
                      <button
                        className="list-item"
                        key={item.key}
                        onClick={() => handleResultClick(item.key)}
                      >
                        {item.sub_type && icon[item.sub_type] ? (
                          <Icon path={icon[item.sub_type]} size="2rem" />
                        ) : (
                          <div className="type">
                            <p>
                              {t(
                                "FilterType." +
                                  typeCapitalizedToKey(item.type || "unknown")
                              )}
                            </p>
                            <p>
                              {t(
                                "FilterType." +
                                  typeCapitalizedToKey(item.sub_type || "unknown")
                              )}
                            </p>
                          </div>
                        )}
                        <div className="names">
                          <p className="zh">
                            {t(item.key, { ns: "items", lng: "zh" }) || item.key}
                          </p>
                          <p className="en">{t(item.key, { ns: "items", lng: "en" })}</p>
                        </div>
                        {attrClass && attrGrade && (
                          <div
                            className="class-grade"
                            style={{
                              color: classToColor[attrClass],
                              backgroundColor: classToColor[attrClass] + "18",
                            }}
                          >
                            {t("UEXAttributeValue." + toI18nKey(attrClass), {
                              defaultValue: attrClass,
                            })}
                            -{attrGrade}
                          </div>
                        )}
                        {attrTrackSignal && (
                          <div
                            className="tracking-signal"
                            style={{
                              color: signalToColor[attrTrackSignal],
                              backgroundColor: signalToColor[attrTrackSignal] + "18",
                            }}
                          >
                            {t("UEXAttributeValue." + toI18nKey(attrTrackSignal), {
                              defaultValue: attrTrackSignal,
                            })}
                          </div>
                        )}
                        {attrsize != null && (
                          <div
                            className="size"
                            style={{ backgroundColor: sizeToColor[Number(attrsize)] }}
                          >
                            S{attrsize}
                          </div>
                        )}
                        <p className="price">
                          {t("Common.price", { price: terminalItemPrice?.price_buy })}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <h3 style={{ textAlign: "center", marginTop: ".5rem" }}>
              {t("TerminalInfo.typeNotSupported")}
            </h3>
          )}
        </>
      ) : (
        <div className="name">
          <h1 className="zh">{t("TerminalInfo.notFound")}</h1>
          <h2 className="en">{t("TerminalInfo.notFound", { lng: "en" })}</h2>
        </div>
      )}
    </div>
  );
};

export default TerminalInfo;
