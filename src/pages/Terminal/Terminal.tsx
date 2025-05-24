import { useNavigate, useParams, useSearchParams } from "react-router";
import "./Terminal.css";
import { useContext, useEffect, useState } from "react";
import { ContextAllData } from "../../contexts";
import axios from "axios";
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
import TerminalCard from "../SearchLocations/SearchLocationResultList/TerminalCard/TerminalCard";
import LocationCard from "../SearchLocations/SearchLocationResultList/LocationCard/LocationCard";

const Terminal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dictTerminals, dictItems } = useContext(ContextAllData);
  const terminalId = useParams().terminalId;
  const [terminalInfo, setTerminalInfo] = useState<Terminal>(null);
  const [rawDictItemsPrices, setRawDictItemsPrices] = useState({});
  const [listItemsOfTerminal, setListItemsOfTerminal] = useState([]);
  const [hashSetSubTypes, setHashSetSubTypes] = useState<Set<string>>(new Set<string>());
  const [searchString, setSearchString] = useState("");
  const [filterSubType, setFilterSubType] = useState("");
  const [listTerminalsNearby, setListTerminalsNearby] = useState<Terminal[]>([]);

  useEffect(() => {
    if (searchParams.get("key")) {
      searchParams.delete("key");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    const _tInfo = dictTerminals[terminalId];
    // console.log(_tInfo);
    setTerminalInfo(_tInfo);

    let _tempListTerminalsNearby = [];
    if (_tInfo && _tInfo.parentLocation) {
      /* Get Nearby Terminal */
      _tempListTerminalsNearby = _tInfo.parentLocation.terminals.filter(
        (t) => t.type === "item" && t.id != terminalId
      );
    }
    setListTerminalsNearby(_tempListTerminalsNearby);
  }, [terminalId, dictTerminals]);

  /* API Fetch: Get items prices at this terminal */
  useEffect(() => {
    axios
      .get("https://api.uexcorp.space/2.0/items_prices?id_terminal=" + terminalId)
      .then((res) => {
        const _temp = Object.fromEntries(
          res.data.data.map((item) => [item.id_item, item])
        );
        console.log(_temp);
        setRawDictItemsPrices(_temp);
      })
      .catch((err) => {
        setRawDictItemsPrices({});
        console.log(err);
      });
  }, [terminalId]);

  /* Process API raw data */
  useEffect(() => {
    const _tempList = Object.values(dictItems)
      .filter(
        (item) =>
          rawDictItemsPrices[item.id_item] &&
          rawDictItemsPrices[item.id_item].price_buy > 0
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    // .sort((a, b) => a.sub_type.localeCompare(b.sub_type))
    // .sort((a, b) => a.type.localeCompare(b.type));

    setListItemsOfTerminal(_tempList);

    const _tempSet = new Set<string>();
    _tempList.forEach((item) => _tempSet.add(item.sub_type));
    setHashSetSubTypes(_tempSet);
  }, [dictItems, rawDictItemsPrices]);

  const handleResultClick = (key) => {
    searchParams.delete("searchFocus");
    navigate(`/i/${key}?${searchParams.toString()}`);
  };

  const handleSearchChange = (e) => setSearchString(e.target.value);

  return (
    <div className="Terminal">
      {terminalInfo ? (
        <>
          <div className="basic-info">
            <div className="name">
              <h1>
                {terminalInfo.location_path
                  .slice(3)
                  .map((n) => t(`Location.${locationNameToI18nKey(n)}`))
                  .join(" - ")}
              </h1>
              <h2>{terminalInfo.name}</h2>
            </div>
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
              {listItemsOfTerminal
                .filter((item) => !filterSubType || item.sub_type === filterSubType)
                .filter(
                  (item) =>
                    !searchString ||
                    item.name
                      .toLocaleLowerCase()
                      .includes(searchString.toLocaleLowerCase()) ||
                    item.name_zh_Hans
                      ?.toLocaleLowerCase()
                      ?.includes(searchString.toLocaleLowerCase())
                )
                .map((item) => {
                  let attrsize, attrClass, attrGrade, attrTrackSignal;
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
                      {icon[item.sub_type] ? (
                        <Icon path={icon[item.sub_type]} size="2rem" />
                      ) : (
                        <div className="type">
                          <p>
                            {t(
                              "FilterType." + typeCapitalizedToKey(item.type || "unknown")
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
                        <p className="zh">{item.name_zh_Hans || item.name}</p>
                        <p className="en">{item.name}</p>
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
                          style={{ backgroundColor: sizeToColor[attrsize] }}
                        >
                          S{attrsize}
                        </div>
                      )}
                      <p className="price">
                        ¤ {rawDictItemsPrices[item.id_item]?.price_buy}
                      </p>
                    </button>
                  );
                })}
            </div>
          </div>
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

export default Terminal;
