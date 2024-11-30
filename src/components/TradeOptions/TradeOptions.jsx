import { useEffect, useState } from "react";
import "./TradeOptions.css";

const percent = (v, zero, hundred) => {
  return ((v - zero) / (hundred - zero)) * 100;
};

const TradeOptions = ({ pricesData, tradeType }) => {
  const [sortBy, setSortBy] = useState("price");
  const [sortDir, setSortDir] = useState(1);
  const [options, setOptions] = useState([]);
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
      <div className="option-list">
        {options.map((option) => {
          let hue = 200 - percent(option.price, priceMin, priceMax) * 2;
          return (
            <div className="option" key={option.location.en}>
              <p className="location">{option.location.zh}</p>
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
        })}
      </div>
    </div>
  );
};

export default TradeOptions;
