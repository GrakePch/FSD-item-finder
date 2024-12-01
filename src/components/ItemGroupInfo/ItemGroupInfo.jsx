import "./ItemGroupInfo.css";
import TradeOptions from "../TradeOptions/TradeOptions";
import { useEffect, useState } from "react";
import itemData from "../../data/item_data.json";
import { useSearchParams } from "react-router";

const ItemGroupInfo = ({ item }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [type, subType] = item.type.zh.split("/");
  const [listVariants, setListVariants] = useState([]);
  const [firstVariant, setFirstVariant] = useState(null);
  const [totalPriceData, setTotalPriceData] = useState(null);

  useEffect(() => {
    let tempListVariants = [];
    tempListVariants = item.variants?.map((uuid) => itemData[uuid]) || [];
    setListVariants(tempListVariants);
    setFirstVariant(tempListVariants[0]);

    let minPrice = Infinity;
    let maxPrice = 0;
    let totalBuyOptions = {};
    for (const variant of tempListVariants) {
      minPrice = Math.min(minPrice, variant.buy.minPrice);
      maxPrice = Math.max(maxPrice, variant.buy.maxPrice);
      for (const option of variant.buy.locations) {
        if (!totalBuyOptions[option.location.en]) {
          totalBuyOptions[option.location.en] = structuredClone(option);
          totalBuyOptions[option.location.en].canBuy = [variant.name.en];
        } else {
          totalBuyOptions[option.location.en].price = Math.min(
            totalBuyOptions[option.location.en].price,
            option.price
          );
          totalBuyOptions[option.location.en].canBuy.push(variant.name.en);
        }
      }
    }
    setTotalPriceData({
      minPrice: minPrice,
      maxPrice: maxPrice,
      locations: Object.values(totalBuyOptions),
    });
  }, [item]);

  return (
    <div className="ItemGroupInfo">
      <div className="item-info">
        <h1 className="zh">
          {firstVariant?.name.zh}{" "}
          <span>等 {listVariants.length} 个同类物品</span>
        </h1>
        <h2 className="en">{firstVariant?.name.en} ...</h2>
        <div className="types">
          <p className="type">{type}</p>
          <p className="subtype">{subType}</p>
        </div>
      </div>
      {totalPriceData && totalPriceData.locations.length > 0 && (
        <>
          <hr />
          <h3 className="trade-options-title">购买</h3>
          <TradeOptions pricesData={totalPriceData} tradeType="buy" />
        </>
      )}
      <hr />
      <h3 className="variants-title">本次查询包含以下物品</h3>
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
    </div>
  );
};

export default ItemGroupInfo;
