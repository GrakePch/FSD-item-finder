import { useEffect, useState } from "react";
import "./TradeOptions.css";
import { getLocationZhName } from "../../utils";

const percent = (v, zero, hundred) => {
  if (zero === hundred) return 0;
  return ((v - zero) / (hundred - zero)) * 100;
};

const TradeOptions = ({ pricesData, priceMinMax, tradeType }) => {
  const [optionsUnsorted, setOptionsUnsorted] = useState([]);
  const [sortBy, setSortBy] = useState("price");
  const [sortDir, setSortDir] = useState(1);
  const [options, setOptions] = useState([]);
  const [locationForest, setLocationForest] = useState({});

  useEffect(() => {
    let tempOptions = pricesData.map((item) => ({
      ...item,
      location_path: [
        item.star_system_name || "Stanton",
        item.orbit_name,
        ...item.terminal_name.split(" - ").reverse(),
      ],
    }));
    setOptionsUnsorted(tempOptions);
  }, [pricesData]);

  useEffect(() => {
    let tempOptions = optionsUnsorted.toSorted(
      (a, b) =>
        (sortBy === "location"
          ? a.location_path.join("/").localeCompare(b.location_path.join("/"))
          : a["price_" + tradeType] - b["price_" + tradeType]) * sortDir
    );

    // console.log(tempOptions)
    setOptions(tempOptions);
  }, [optionsUnsorted, sortBy, sortDir]);

  useEffect(() => {
    if (options.length <= 0) {
      setLocationForest({});
      return;
    }

    const tempLocationForest = {};
    options
      .filter((option) => option["price_" + tradeType] > 0)
      .forEach((option) => {
        addToTree(tempLocationForest, option.location_path, option);
      });

    setLocationForest(tempLocationForest);
  }, [options]);

  return (
    <div className="TradeOptions">
      <div className="titles">
        <h4
          className="location"
          onClick={() => {
            if (sortBy === "location") {
              setSortDir(-1 * sortDir);
            } else {
              setSortBy("location");
              setSortDir(1);
            }
          }}
        >
          地点{sortBy === "location" ? (sortDir > 0 ? " ▲" : " ▼") : " △"}
        </h4>
        <h4
          className="price"
          onClick={() => {
            if (sortBy === "price") {
              setSortDir(-1 * sortDir);
            } else {
              setSortBy("price");
              setSortDir(1);
            }
          }}
        >
          {tradeType === "buy" ? "购买价格" : "单日租赁价格"}
          {sortBy === "price" ? (sortDir > 0 ? " ▲" : " ▼") : " △"}
        </h4>
      </div>
      <div className="options-container">
        {sortBy === "price" ? (
          options
            .filter((option) => option["price_" + tradeType] > 0)
            .map((option) => {
              let hue =
                200 -
                percent(
                  option["price_" + tradeType],
                  priceMinMax[tradeType + "_min"],
                  priceMinMax[tradeType + "_max"]
                ) *
                  2;
              return (
                <div className="option" key={option.id}>
                  <p className="location">
                    <span
                      className="location-chip"
                      style={{ backgroundColor: `var(--color-text-1)`, color: `#000` }}
                    >
                      {getLocationZhName(option.location_path[0])}
                    </span>
                    {option.location_path.slice(1).map((loc, idx) => (
                      <span
                        key={idx}
                        className="location-chip"
                        style={{
                          backgroundColor: `rgba(255 255 255 / ${(1 - idx / 4) * 0.2})`,
                        }}
                      >
                        {getLocationZhName(loc)}
                      </span>
                    ))}
                  </p>
                  {option["price_" + tradeType] > 0 ? (
                    <p className="price" style={{ color: `hsl(${hue}deg 60% 50%)` }}>
                      ¤ {option["price_" + tradeType]}
                    </p>
                  ) : (
                    <p className="price" style={{ color: `hsl(0deg 0% 50%)` }}>
                      无法购买
                    </p>
                  )}
                </div>
              );
            })
        ) : (
          <LocationForest
            forest={locationForest}
            priceMin={priceMinMax[tradeType + "_min"]}
            priceMax={priceMinMax[tradeType + "_max"]}
            depth={0}
            tradeType={tradeType}
          />
        )}
      </div>
    </div>
  );
};

const addToTree = (tree, path, option) => {
  let current = tree;
  path.forEach((node, index) => {
    if (!current[node]) {
      current[node] = {
        name: node,
        subs: {},
      };
    }
    if (index == path.length - 1) current[node].option = option;
    current = current[node].subs;
  });
};

const LocationForest = ({ forest, priceMin, priceMax, depth, tradeType }) => {
  let bgcolor = `rgba(255 255 255 / ${(1 - (depth - 1) / 4) * 0.2})`;
  return Object.entries(forest).map(([key, loc]) => {
    if ("option" in loc) {
      let hue = 200 - percent(loc.option["price_" + tradeType], priceMin, priceMax) * 2;
      return (
        <div className="option-in-tree" key={key}>
          <p className="location">
            <span className="location-chip" style={{ backgroundColor: bgcolor }}>
              {getLocationZhName(loc.name)}
            </span>
          </p>
          {loc.option["price_" + tradeType] > 0 ? (
            <p className="price" style={{ color: `hsl(${hue}deg 60% 50%)` }}>
              ¤ {loc.option["price_" + tradeType]}
            </p>
          ) : (
            <p className="price" style={{ color: `hsl(0deg 0% 50%)` }}>
              无法购买
            </p>
          )}
        </div>
      );
    } else if (Object.keys(loc.subs).length === 1)
      return (
        <div key={key} className="location-tree-nowrap">
          <p
            className="location-chip"
            style={
              depth > 0
                ? { backgroundColor: bgcolor }
                : { backgroundColor: `var(--color-text-1)`, color: `#000` }
            }
          >
            {getLocationZhName(loc.name)}
          </p>
          <div className="sub-location">
            <LocationForest
              forest={loc.subs}
              priceMin={priceMin}
              priceMax={priceMax}
              depth={depth + 1}
              tradeType={tradeType}
            />
          </div>
        </div>
      );
    else
      return (
        <div key={key} className="location-tree">
          <p
            className="location-chip"
            style={
              depth > 0
                ? { backgroundColor: bgcolor }
                : { backgroundColor: `var(--color-text-1)`, color: `#000` }
            }
          >
            {getLocationZhName(loc.name)}
          </p>
          <div className="line-and-list">
            <div className="line"></div>
            <div className="sub-location-list">
              <LocationForest
                forest={loc.subs}
                priceMin={priceMin}
                priceMax={priceMax}
                depth={depth + 1}
                tradeType={tradeType}
              />
            </div>
          </div>
        </div>
      );
  });
};

export default TradeOptions;
