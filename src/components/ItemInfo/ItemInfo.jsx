import { useEffect, useState } from "react";
import "./ItemInfo.css";

const percent = (v, zero, hundred) => {
  return ((v - zero) / (hundred - zero)) * 100;
};

const ItemInfo = ({ item }) => {
  const [sortBy, setSortBy] = useState("price");
  const [sortDir, setSortDir] = useState(1);
  const [buyOptions, setBuyOptions] = useState([]);
  const numOptions = item.locations.length;
  const priceMin = item.locations?.[0].price;
  const priceMax = item.locations?.[numOptions - 1].price;

  const [type, subType] = item.type.zh.split("/");

  useEffect(() => {
    let tempBuyOptions = item.locations.toSorted(
      (a, b) =>
        (sortBy === "location"
          ? a.location.en.localeCompare(b.location.en)
          : a.price - b.price) * sortDir
    );
    setBuyOptions(tempBuyOptions);
  }, [item, sortBy, sortDir]);

  return (
    <div className="ItemInfo">
      <div className="item-info">
        <h1 className="zh">{item.name.zh}</h1>
        <h2 className="en">{item.name.en}</h2>
        <div className="types">
          <p className="type">{type}</p>
          <p className="subtype">{subType}</p>
        </div>
      </div>
      <hr />
      <div className="buy-option-titles">
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
          购买地点{sortBy === "location" ? (sortDir > 0 ? " ▲" : " ▼") : " △"}
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
          价格{sortBy === "price" ? (sortDir > 0 ? " ▲" : " ▼") : " △"}
        </h4>
      </div>
      <div className="buy-option-list">
        {buyOptions.map((option) => {
          let hue = 200 - percent(option.price, priceMin, priceMax) * 2;
          return (
            <div className="buy-option" key={option.location.en}>
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

export default ItemInfo;
