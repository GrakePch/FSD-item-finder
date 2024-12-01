import "./ItemInfo.css";
import TradeOptions from "../TradeOptions/TradeOptions";
import { useEffect, useState } from "react";
import itemData from "../../data/item_data.json";
import { useSearchParams } from "react-router";
import Icon from "@mdi/react";
import { mdiTagMultipleOutline } from "@mdi/js";

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
      {listVariants.length > 1 && (
        <>
          <hr />
          <div className="title-and-button">
            <h3 className="variants-title">所有涂装版本</h3>
            <button className="button-check-group" onClick={() => {
              searchParams.set("group", 1);
              setSearchParams(searchParams);
            }}>
              <Icon path={mdiTagMultipleOutline} size="1.5rem" />
              查看所有涂装版本的购买选项
            </button>
          </div>
          <div className="list-variants">
            {listVariants.map((item) => (
              <button
                className="variant"
                key={item.uuid}
                onClick={() => {
                  searchParams.set("uuid", item.uuid);
                  searchParams.delete("group");
                  setSearchParams(searchParams);
                }}
              >
                <p>{item.name.zh}</p>
                <p className="price">¤ {item.buy.minPrice} 起</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ItemInfo;
