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
    let tempOptions = pricesData.map((item) => ({...item, location_path: [item.star_system_name, item.orbit_name, ...item.terminal_name.split(" - ").reverse()]}));
    setOptionsUnsorted(tempOptions);
  }, [pricesData]);

  useEffect(() => {

    let tempOptions = optionsUnsorted.toSorted(
      (a, b) => (sortBy === "location"
          ? a.location_path.join("/").localeCompare(b.location_path.join("/"))
          : a.price_buy - b.price_buy) * sortDir
    );

    // console.log(tempOptions)
    setOptions(tempOptions);
  }, [optionsUnsorted, sortBy, sortDir]);

  // useEffect(() => {
  //   if (options.length <= 0) {
  //     setLocationForest({});
  //     return;
  //   }

  //   const tempLocationForest = {};
  //   options.forEach((item) => {
  //     const enParts = item.location.en.split(" - ").map((part) => part.trim());
  //     const zhParts = item.location.zh.split(" - ").map((part) => part.trim());
  //     const namesENZH = enParts.map((en, index) => ({
  //       en,
  //       zh: zhParts[index],
  //     }));
  //     addToTree(tempLocationForest, enParts, namesENZH, item.price);
  //   });

  //   setLocationForest(tempLocationForest);
  // }, [options]);

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
        {
        // sortBy === "price" ? (
          true ? (
          options.filter((option) => option.price_buy > 0).map((option) => {
            let hue =
              200 -
              percent(option.price_buy, priceMinMax.buy_min, priceMinMax.buy_max) * 2;
            return (
              <div className="option" key={option.id}>
                <p className="location">
                <span style={{backgroundColor: `var(--color-text-1)`, color: `#000`}}>{getLocationZhName(option.location_path[0])}</span>
                  {option.location_path.slice(1).map((loc, idx) => <span key={idx} style={{backgroundColor: `rgba(255 255 255 / ${(1 - idx / 4) * .2})`}}>{getLocationZhName(loc)}</span>)}
                </p>
                {option.price_buy > 0 ? (
                  <p
                    className="price"
                    style={{
                      color: `hsl(${hue}deg 60% 50%)`,
                    }}
                  >
                    ¤ {option.price_buy}
                  </p>
                ) : (
                  <p
                    className="price"
                    style={{
                      color: `hsl(0deg 0% 50%)`,
                    }}
                  >
                    无法购买
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <></>
          // <LocationForest
          //   forest={locationForest}
          //   priceMin={pricesData.minPrice}
          //   priceMax={pricesData.maxPrice}
          //   depth={0}
          // />
        )}
      </div>
    </div>
  );
};

const addToTree = (tree, path, names, price) => {
  let current = tree;
  path.forEach((node, index) => {
    if (!current[node]) {
      current[node] = {
        name: names[index],
        subs: {},
      };
    }
    if (index == path.length - 1) current[node].price = price;
    current = current[node].subs;
  });
};

const LocationForest = ({ forest, priceMin, priceMax, depth }) => {
  return Object.entries(forest).map(([key, loc]) => {
    if ("price" in loc) {
      let hue = 200 - percent(loc.price, priceMin, priceMax) * 2;
      return (
        <div className="option-in-tree" key={key}>
          <p className="location">{loc.name.zh}</p>
          <p
            className="price"
            style={{
              color: `hsl(${hue}deg 60% 50%)`,
            }}
          >
            ¤ {loc.price}
          </p>
        </div>
      );
    } else if (Object.keys(loc.subs).length === 1)
      return (
        <div key={key} className="location-tree-nowrap">
          <p>{loc.name.zh} /&nbsp;</p>
          <div className="sub-location">
            <LocationForest
              forest={loc.subs}
              priceMin={priceMin}
              priceMax={priceMax}
              depth={depth}
            />
          </div>
        </div>
      );
    else
      return (
        <div key={key} className="location-tree">
          <p>{loc.name.zh} /</p>
          <div className="line-and-list">
            <div className="line"></div>
            <div className="sub-location-list">
              <LocationForest
                forest={loc.subs}
                priceMin={priceMin}
                priceMax={priceMax}
                depth={depth + 1}
              />
            </div>
          </div>
        </div>
      );
  });
};

export default TradeOptions;
