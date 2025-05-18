import { useNavigate, useParams, useSearchParams } from "react-router";
import "./Terminal.css";
import { useContext, useEffect, useState } from "react";
import { ContextAllData } from "../../contexts";
import axios from "axios";
import {
  classToColor,
  getAttributeValueByName,
  getAttributeValueZhName,
  getCategoryZhName,
  getLocationZhName,
  signalToColor,
  sizeToColor,
} from "../../utils";
import Icon from "@mdi/react";
import { icon } from "../../assets/icon";
import i18nCategories from "../../data/categories_en_to_zh_Hans.json";
import { mdiArrowLeft, mdiClose, mdiHomeVariantOutline, mdiMagnify } from "@mdi/js";

const Terminal = () => {
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
    if (_tInfo) {
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
      .sort((a, b) => a.name.localeCompare(b.name))
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

  const handleNearbyTerminalClick = (tid) =>
    navigate(`/t/${tid}?${searchParams.toString()}`);

  return (
    <div className="Terminal">
      {window.history.state?.idx < 1 ? (
        <button className="fab-navigate" onClick={() => navigate("/")}>
          <Icon path={mdiHomeVariantOutline} size="1.5rem" />
        </button>
      ) : (
        <button className="fab-navigate" onClick={() => navigate(-1)}>
          <Icon path={mdiArrowLeft} size="1.5rem" />
        </button>
      )}
      {terminalInfo ? (
        <>
          <div className="location-path">
            <span className="name-star-system">
              {getLocationZhName(terminalInfo.location.name_star_system)}
            </span>
            <span className="name-orbit">
              {getLocationZhName(terminalInfo.location.name_orbit)}
            </span>
            <span className="name-3rd">
              {getLocationZhName(terminalInfo.location_path[2])}
            </span>
          </div>
          <div className="basic-info">
            <div className="name">
              <h1 className="zh">
                {terminalInfo.location_path
                  .slice(2)
                  .map((n) => getLocationZhName(n))
                  .join(" - ")}
              </h1>
              <h2 className="en">{terminalInfo.name}</h2>
            </div>
            <h3 className="faction">{terminalInfo.name_faction}</h3>
          </div>
          {listTerminalsNearby.length > 0 && (
            <>
              <hr />
              <h4>附近</h4>
              <div className="nearby-terminals">
                {listTerminalsNearby.map((t) => (
                  <button key={t.id} onClick={() => handleNearbyTerminalClick(t.id)}>
                    {t.location_path
                      .slice(2)
                      .map((n) => getLocationZhName(n))
                      .join(" - ")}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="search-and-list">
            <div className="searchbar-container">
              <input
                type="text"
                id="searchbar"
                placeholder="搜索本店商品……"
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
                全部
              </button>
              {Array.from(hashSetSubTypes).map((subType) => (
                <button
                  key={subType}
                  className={filterSubType === subType ? "active" : undefined}
                  onClick={() =>
                    setFilterSubType(filterSubType === subType ? "" : subType)
                  }
                >
                  {getCategoryZhName(subType)}
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
                          <p>{i18nCategories[item.type] || item.type || "未知"}</p>
                          <p>
                            {i18nCategories[item.sub_type] || item.sub_type || "未知"}
                          </p>
                        </div>
                      )}
                      <div className="names">
                        <p className="zh">{item.name_zh_Hans || item.name}</p>
                        <p className="en">{item.name}</p>
                      </div>
                      {attrsize != null && (
                        <div
                          className="size"
                          style={{ backgroundColor: sizeToColor[attrsize] }}
                        >
                          S{attrsize}
                        </div>
                      )}
                      {attrClass && attrGrade && (
                        <div
                          className="class-grade"
                          style={{
                            color: classToColor[attrClass],
                            backgroundColor: classToColor[attrClass] + "18",
                          }}
                        >
                          {getAttributeValueZhName(attrClass)}-{attrGrade}
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
                          {getAttributeValueZhName(attrTrackSignal)}
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
          <h1 className="zh">商店不存在</h1>
          <h2 className="en">Terminal Not Found</h2>
        </div>
      )}
    </div>
  );
};

export default Terminal;
