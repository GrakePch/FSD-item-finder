import "./ItemGroupInfo.css";
import TradeOptions from "../TradeOptions/TradeOptions";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { getCategoryZhName } from "../../utils";

const ItemGroupInfo = ({ item, listVariants }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [firstVariant, setFirstVariant] = useState(null);
  const [totalPriceData, setTotalPriceData] = useState([]);
  const [totalPriceMinMax, setTotalPriceMinMax] = useState({});

  useEffect(() => {
    setFirstVariant(listVariants[0]);

    let optionDict = {};
    for (const item of listVariants) {
      for (const option of item.options) {
        if (!optionDict[option.id_terminal]) {
          optionDict[option.id_terminal] = option;
        } else {
          let o = optionDict[option.id_terminal];
          if (!o.price_buy || option.price_buy < o.price_buy)
            o.price_buy = option.price_buy;
          if (!o.price_sell || option.price_sell > o.price_sell)
            o.price_sell = option.price_sell;
        }
      }
    }
    let tempTotalPriceData = Object.values(optionDict);
    setTotalPriceData(tempTotalPriceData);

    /* Update price_min_max for each item */
    let pricesBuy = tempTotalPriceData
      .filter((a) => a.price_buy !== null)
      .map((a) => a.price_buy);
    let pricesSell = tempTotalPriceData
      .filter((a) => a.price_sell !== null)
      .map((a) => a.price_sell);
    let pricesRent =
      tempTotalPriceData
        ?.filter((a) => a.price_rent !== null)
        ?.map((a) => a.price_rent) || [];
    let tempTotalPriceMinMax = {
      buy_min: Math.min(...pricesBuy) || null,
      buy_max: Math.max(...pricesBuy) || null,
      sell_min: Math.min(...pricesSell) || null,
      sell_max: Math.max(...pricesSell) || null,
      rent_min: Math.min(...pricesRent) || null,
      rent_max: Math.max(...pricesRent) || null,
    };

    setTotalPriceMinMax(tempTotalPriceMinMax);
  }, [item, listVariants]);

  return (
    <div className="ItemGroupInfo">
      <div className="item-info">
        <h1 className="zh">
          {firstVariant?.name_zh_Hans} <span>等 {listVariants.length} 个同类物品</span>
        </h1>
        <h2 className="en">{firstVariant?.name} ...</h2>
        <div className="types">
          <p className="type">{getCategoryZhName(item.type) || "未知"}</p>
          <p className="subtype">{getCategoryZhName(item.sub_type) || "未知"}</p>
        </div>
      </div>
      {totalPriceData && totalPriceData.length > 0 && (
        <>
          <hr />
          <h3 className="trade-options-title">购买</h3>
          <TradeOptions
            pricesData={totalPriceData}
            priceMinMax={totalPriceMinMax}
            tradeType="buy"
          />
        </>
      )}
      <hr />
      <h3 className="variants-title">本次查询包含以下物品</h3>
      <div className="list-variants">
        {listVariants.map((vItem) => (
          <button
            className="variant"
            key={vItem.key}
            onClick={() => setSearchParams({ key: vItem.key })}
          >
            <p>{vItem.name_zh_Hans || vItem.name}</p>
            {vItem.price_min_max.buy_min && vItem.price_min_max.buy_min < Infinity ? (
              <p className="price">¤ {vItem.price_min_max.buy_min} 起</p>
            ) : (
              <p className="price" style={{ color: "hsl(0deg 0% 60%)" }}>
                无法购买
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ItemGroupInfo;
