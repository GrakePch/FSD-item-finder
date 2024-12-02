import "./ItemInfo.css";
import TradeOptions from "../TradeOptions/TradeOptions";
import { useEffect, useState } from "react";
import itemData from "../../data/item_data.json";
import { useSearchParams } from "react-router";
import Icon from "@mdi/react";
import { mdiTagMultipleOutline } from "@mdi/js";
import SetButton from "../SetButton/SetButton";

const ItemInfo = ({ item }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [type, subType] = item.type.zh.split("/");
  const [typeEN, subTypeEN] = item.type.en.split("/");
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
      {(typeEN === "Armor" || typeEN === "Undersuits") &&
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
