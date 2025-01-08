import { useNavigate, useParams, useSearchParams } from "react-router";
import "./Terminal.css";
import { useContext, useEffect, useState } from "react";
import { AllItemsPriceContext, AllTerminalsContext } from "../../contexts";
import axios from "axios";
import {
  classToColor,
  getAttributeValueByName,
  getAttributeValueZhName,
  getLocationZhName,
  signalToColor,
  sizeToColor,
} from "../../utils";
import Icon from "@mdi/react";
import { icon } from "../../assets/icon";
import i18nCategories from "../../data/categories_en_to_zh_Hans.json";
import { mdiArrowLeft, mdiHomeVariantOutline } from "@mdi/js";

const Terminal = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const terminalsData = useContext(AllTerminalsContext);
  const itemsData = useContext(AllItemsPriceContext);
  const terminalId = useParams().tid;
  const [terminalInfo, setTerminalInfo] = useState(null);
  const [rawDictItemsPrices, setRawDictItemsPrices] = useState({});

  useEffect(() => {
    if (searchParams.get("key")) {
      searchParams.delete("key");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    // console.log(terminalsData[terminalId]);
    setTerminalInfo(terminalsData[terminalId]);
  }, [terminalId, terminalsData]);

  useEffect(() => {
    axios
      .get("https://api.uexcorp.space/2.0/items_prices?id_terminal=" + terminalId)
      .then((res) => {
        const _temp = Object.fromEntries(
          res.data.data.map((item) => [item.id_item, item])
        );
        // console.log(_temp);
        setRawDictItemsPrices(_temp);
      })
      .catch((err) => {
        setRawDictItemsPrices({});
        console.log(err);
      });
  }, [terminalId]);

  const handleResultClick = (key) => {
    searchParams.set("key", key);
    searchParams.delete("searchFocus");
    navigate("/?" + searchParams.toString());
  };

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
          <div className="search-and-list">
            <div className="list-sell">
              {Object.values(itemsData)
                .filter(
                  (item) =>
                    rawDictItemsPrices[item.id_item] &&
                    rawDictItemsPrices[item.id_item].price_buy > 0
                )
                .sort((a, b) => a.name.localeCompare(b.name))
                .sort((a, b) => a.sub_type.localeCompare(b.sub_type))
                .sort((a, b) => a.type.localeCompare(b.type))
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
                        ¤ {rawDictItemsPrices[item.id_item].price_buy}
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
