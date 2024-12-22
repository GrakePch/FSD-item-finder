import "./ItemInfo.css";
import TradeOptions from "../TradeOptions/TradeOptions";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import Icon from "@mdi/react";
import { mdiTagMultipleOutline } from "@mdi/js";
import SetButton from "../SetButton/SetButton";
import { getZhHansNameFromEn } from "../../utils";
import axios from "axios";
import i18nCategories from "../../data/categories_en_to_zh_Hans.json";

const ItemInfo = ({ item }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tradingData, setTradingData] = useState(null);
  const [priceMinMaxByTerminals, setPriceMinMaxByTerminals] = useState(null);
  const [listVariants, setListVariants] = useState([]);

  useEffect(() => {
    console.log(item);
    axios
      .get("https://uexcorp.space/api/2.0/items_prices?id_item=" + item.id)
      .then((res) => {
        setTradingData(res.data.data);

        /* Compute max and min prices for buying and selling in terms of different terminals */
        let pricesBuy = res.data.data
          .filter((a) => a.price_buy > 0)
          .map((a) => a.price_buy);
        let pricesSell = res.data.data
          .filter((a) => a.price_sell > 0)
          .map((a) => a.price_sell);
        setPriceMinMaxByTerminals({
          buy_min: Math.min(...pricesBuy),
          buy_max: Math.max(...pricesBuy),
          sell_min: Math.min(...pricesSell),
          sell_max: Math.max(...pricesSell),
        });
      })
      .catch((err) => {
        console.log(err);
      });

    let tempListVariants = [];
    tempListVariants = item.variants?.map((uuid) => itemData[uuid]) || [];
    setListVariants(tempListVariants);
  }, [item]);

  return (
    <div className="ItemInfo">
      <div className="info-and-image">
        <div className="item-info">
          <div>
            <h1 className="zh">{getZhHansNameFromEn(item.name) || item.name}</h1>
            <h2 className="en">{item.name}</h2>
          </div>
          <div className="types">
            <p className="type">{i18nCategories[item.section] || item.section}</p>
            <p className="subtype">{i18nCategories[item.category] || item.category}</p>
          </div>
          <button
            className="button-visit-uex"
            onClick={() =>
              window.open("https://uexcorp.space/items/info?name=" + item.slug, "_blank")
            }
          >
            访问 UEX
          </button>
        </div>
        {item.screenshot && (
          <div
            className="item-image"
            style={{ backgroundImage: `url(${item.screenshot})` }}
          ></div>
        )}
      </div>

      {tradingData && tradingData.length > 0 && (
        <>
          <hr />
          <h3 className="trade-options-title">购买</h3>
          <TradeOptions
            pricesData={tradingData}
            priceMinMax={priceMinMaxByTerminals}
            tradeType="buy"
          />
        </>
      )}

      {/* {item.rent && item.rent.locations.length > 0 && (
        <>
          <hr />
          <h3 className="trade-options-title">租赁</h3>
          <TradeOptions pricesData={item.rent} tradeType="rent" />
        </>
      )} */}
      <hr />
      {(item.category === "Armor" || item.category === "Undersuits") &&
        (item.set ? (
          <>
            <div className="title-and-button">
              <h3>可购买的套装</h3>
              <button
                className="button-check-group"
                onClick={() => {
                  searchParams.set("mode", "set");
                  setSearchParams(searchParams);
                }}
              >
                <Icon path={mdiTagMultipleOutline} size="1.5rem" />
                哪里能购买完整套装
              </button>
            </div>
            <div className="set-container">
              <SetButton subType="undersuit" uuid={item.set.undersuit} self={item.uuid} />
              <SetButton subType="helmet" uuid={item.set.helmet} self={item.uuid} />
              <SetButton subType="torso" uuid={item.set.torso} self={item.uuid} />
              <SetButton subType="arms" uuid={item.set.arms} self={item.uuid} />
              <SetButton subType="legs" uuid={item.set.legs} self={item.uuid} />
              <SetButton subType="backpack" uuid={item.set.backpack} self={item.uuid} />
            </div>
          </>
        ) : (
          <div className="title-and-button">
            <h3>没有可购买的套装</h3>
          </div>
        ))}

      {listVariants.length > 1 && (
        <>
          <hr />
          <div className="title-and-button">
            <h3 className="variants-title">所有外观变体</h3>
            <button
              className="button-check-group"
              onClick={() => {
                searchParams.set("mode", "variants");
                setSearchParams(searchParams);
              }}
            >
              <Icon path={mdiTagMultipleOutline} size="1.5rem" />
              忽略外观差异
            </button>
          </div>
          <div className="list-variants">
            {listVariants.map((vItem) => (
              <button
                className="variant"
                key={vItem.uuid}
                onClick={
                  item.uuid === vItem.uuid
                    ? null
                    : () => setSearchParams({ uuid: vItem.uuid })
                }
              >
                <p>
                  {vItem.name.zh}
                  {item.uuid === vItem.uuid ? "（当前）" : ""}
                </p>
                <p className="price">¤ {vItem.buy.minPrice} 起</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ItemInfo;
