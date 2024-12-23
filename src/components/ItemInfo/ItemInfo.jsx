import "./ItemInfo.css";
import TradeOptions from "../TradeOptions/TradeOptions";
import { useSearchParams } from "react-router";
import Icon from "@mdi/react";
import { mdiTagMultipleOutline } from "@mdi/js";
import SetButton from "../SetButton/SetButton";
import { getCategoryZhName } from "../../utils";

const uexLinkItem = "https://uexcorp.space/items/info?name=";
const uexLinkVehicle = "https://uexcorp.space/vehicles/home/list/in_game_sell/";

const ItemInfo = ({ item, listVariants }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  if (!item) return null;

  return (
    <div className="ItemInfo">
      <div className="info-and-image">
        <div className="item-info">
          <div>
            <h1 className="zh">{item.name_zh_Hans || item.name}</h1>
            <h2 className="en">{item.name}</h2>
          </div>
          <div className="types">
            <p className="type">{getCategoryZhName(item.type)}</p>
            <p className="subtype">{getCategoryZhName(item.sub_type)}</p>
          </div>

          <button
            className="button-visit-uex"
            onClick={
              item.category === "Vehicle"
                ? () => window.open(uexLinkVehicle, "_blank")
                : () => window.open(uexLinkItem + item.slug, "_blank")
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

      {item.options && item.options.length > 0 && (
        <>
          <hr />
          <h3 className="trade-options-title">购买</h3>
          <TradeOptions
            pricesData={item.options}
            priceMinMax={item.price_min_max}
            tradeType="buy"
          />
        </>
      )}

      {item.options_rent && item.options_rent.length > 0 && (
        <>
          <hr />
          <h3 className="trade-options-title">租赁</h3>
          <TradeOptions
            pricesData={item.options_rent}
            priceMinMax={item.price_min_max}
            tradeType="rent"
          />
        </>
      )}
      {(item.category === "Armor" || item.category === "Undersuits") &&
        (item.set ? (
          <>
            <hr />
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
                key={vItem.slug}
                onClick={
                  item.id_item === vItem.id_item
                    ? null
                    : () => setSearchParams({ name: vItem.slug })
                }
              >
                <p>
                  {vItem.name_zh_Hans || vItem.name}
                  {item.id_item === vItem.id_item ? "（当前）" : ""}
                </p>
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
        </>
      )}
    </div>
  );
};

export default ItemInfo;
