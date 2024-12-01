import "./ItemInfo.css";
import TradeOptions from "../TradeOptions/TradeOptions";
import { useEffect, useState } from "react";
import itemData from "../../data/item_data.json";
import { useSearchParams } from "react-router";

const ItemInfo = ({ item }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [type, subType] = item.type.zh.split("/");
  const [listVariants, setListVariants] = useState([]);

  useEffect(() => {
    let tempListVariants = [];
    tempListVariants = item.variants?.map((uuid) => itemData[uuid]) || [];
    setListVariants(tempListVariants);
  }, [item]);

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
      {item.buy && item.buy.locations.length > 0 && (
        <>
          <hr />
          <h3 className="trade-options-title">购买</h3>
          <TradeOptions pricesData={item.buy} tradeType="buy" />
        </>
      )}
      {item.rent && item.rent.locations.length > 0 && (
        <>
          <hr />
          <h3 className="trade-options-title">租赁</h3>
          <TradeOptions pricesData={item.rent} tradeType="rent" />
        </>
      )}

      <hr />
      <h3 className="variants-title">该物品的所有涂装版本</h3>
      <div className="list-variants">
        {listVariants.map((item) => (
          <button
            className="variant"
            key={item.uuid}
            onClick={() => {
              searchParams.set("uuid", item.uuid);
              setSearchParams(searchParams);
            }}
          >
            <p>{item.name.zh}</p>
            <p className="price">¤ {item.buy.minPrice} 起</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ItemInfo;
