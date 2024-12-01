import { useEffect, useState } from "react";
import "./TradeOptions.css";

const percent = (v, zero, hundred) => {
  return ((v - zero) / (hundred - zero)) * 100;
};

const TradeOptions = ({ pricesData, tradeType }) => {
  const [sortBy, setSortBy] = useState("price");
  const [sortDir, setSortDir] = useState(1);
  const [options, setOptions] = useState([]);
  const [locationForest, setLocationForest] = useState({});
  const priceMin = pricesData.minPrice;
  const priceMax = pricesData.maxPrice;

  useEffect(() => {
    let tempOptions = pricesData.locations.toSorted(
      (a, b) =>
        (sortBy === "location"
          ? a.location.en.localeCompare(b.location.en)
          : a.price - b.price) * sortDir
    );
    setOptions(tempOptions);
  }, [pricesData, sortBy, sortDir]);

  useEffect(() => {
    if (options.length <= 0) {
      setLocationForest({});
      return;
    }

    const tempLocationForest = {};
    options.forEach((item) => {
      const enParts = item.location.en.split(" - ").map((part) => part.trim());
      const zhParts = item.location.zh.split(" - ").map((part) => part.trim());
      const namesENZH = enParts.map((en, index) => ({
        en,
        zh: zhParts[index],
      }));
      addToTree(tempLocationForest, enParts, namesENZH, item.price);
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
          options.map((option) => {
            let hue = 200 - percent(option.price, priceMin, priceMax) * 2;
            return (
              <div className="option" key={option.location.en}>
                <p className="location">
                  {option.location.zh.split(" - ").join(" / ")}
                </p>
                <p
                  className="price"
                  style={{
                    color: `hsl(${hue}deg 60% 50%)`,
                  }}
                >
                  ¤ {option.price}
                </p>
              </div>
            );
          })
        ) : (
          <LocationForest
            forest={locationForest}
            priceMin={priceMin}
            priceMax={priceMax}
            depth={0}
          />
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
