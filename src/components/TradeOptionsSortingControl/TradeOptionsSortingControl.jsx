import { useEffect, useState } from "react";
import "./TradeOptionsSortingControl.css";
import { useSearchParams } from "react-router";
import { getBody, getLocationZhName, getSystems } from "../../utils";
import Icon from "@mdi/react";
import { mdiCurrencySign, mdiMapMarker } from "@mdi/js";

const TradeOptionsSortingControl = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [starSystem, setStarSystem] = useState("");
  const [systemTree, setSystemTree] = useState({});

  useEffect(() => {
    /* Update Search Params to Default values */
    let paramSort = searchParams.get("sort");
    if (["price", "location"].includes(paramSort) === false) {
      searchParams.set("sort", "price");
      setSearchParams(searchParams);
    }
    if (!getBody(searchParams.get("from"))) {
      searchParams.set("from", "Crusader");
      setSearchParams(searchParams);
    }
    let tempStarSys = getBody(searchParams.get("from"));
    setStarSystem(tempStarSys?.parentStar || tempStarSys?.name);
  }, [searchParams]);

  useEffect(() => {
    setSystemTree(getSystems());
  }, []);

  return (
    <div style={{ padding: "0 1rem" }}>
      <div className="TradeOptionsSortingControl">
        <button
          className={searchParams.get("sort") === "price" ? "active" : undefined}
          onClick={() => {
            searchParams.set("sort", "price");
            setSearchParams(searchParams);
          }}
        >
          <Icon path={mdiCurrencySign} size={"1rem"} /><p>价格低优先</p>
        </button>
        <button
          className={searchParams.get("sort") === "location" ? "active" : undefined}
          onClick={() => {
            searchParams.set("sort", "location");
            setSearchParams(searchParams);
          }}
        >
          <Icon path={mdiMapMarker} size={"1rem"} /><p>距离近优先</p>
        </button>
        <div className="selectors">
          <select
            className="systems"
            value={starSystem}
            onChange={(e) => {
              searchParams.set("from", e.target.value);
              setSearchParams(searchParams);
            }}
          >
            {Object.keys(systemTree).map((s) => (
              <option key={s} value={s}>
                {getLocationZhName(s)}星系
              </option>
            ))}
          </select>
          <hr />
          <select
            className="bodies"
            value={searchParams.get("from")}
            onChange={(e) => {
              searchParams.set("from", e.target.value);
              setSearchParams(searchParams);
            }}
          >
            <option value={starSystem}>{getLocationZhName(starSystem)}</option>
            {systemTree[starSystem]?.children.map((b) =>
              b.children.length > 0 ? (
                <optgroup key={b.name} label={getLocationZhName(b.name) + " 引力系统"}>
                  <option value={b.name}>{getLocationZhName(b.name)}</option>
                  {b.children.map((b2) => (
                    <option key={b2.name} value={b2.name}>
                      {b2.type === "Lagrange Point"
                        ? b2.name
                        : getLocationZhName(b2.name)}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <option key={b.name} value={b.name}>
                  {getLocationZhName(b.name)}
                </option>
              )
            )}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TradeOptionsSortingControl;
