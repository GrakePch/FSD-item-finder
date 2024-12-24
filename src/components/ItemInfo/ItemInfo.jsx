import "./ItemInfo.css";
import TradeOptions from "../TradeOptions/TradeOptions";
import { useSearchParams } from "react-router";
import Icon from "@mdi/react";
import { mdiTagMultipleOutline } from "@mdi/js";
import SetButton from "../SetButton/SetButton";
import { getCategoryZhName } from "../../utils";

const uexLinkItem = "https://uexcorp.space/items/info?name=";
const uexLinkVehicle = "https://uexcorp.space/vehicles/home/list/in_game_sell/";

const ItemInfo = ({ item, listVariants, set }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // console.log(item)

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
            <p className="type">{getCategoryZhName(item.type) || "未知"}</p>
            <p className="subtype">{getCategoryZhName(item.sub_type) || "未知"}</p>
          </div>

          <button
            className="button-visit-uex"
            onClick={
              item.sub_type === "Vehicle"
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

      {set && (
        <>
          <hr />
          <div className="title-and-button">
            <h3>套装</h3>
            {/* <button
              className="button-check-group"
              onClick={() => {
                searchParams.set("mode", "set");
                setSearchParams(searchParams);
              }}
            >
              <Icon path={mdiTagMultipleOutline} size="1.5rem" />
              哪里能购买完整套装
            </button> */}
          </div>
          <div className="set-container">
            {/* <SetButton subType="undersuit" item={set.undersuit} selfKey={item.key} /> */}
            <SetButton subType="helmet" item={set?.helmet} selfKey={item.key} />
            <SetButton subType="torso" item={set?.torso} selfKey={item.key} />
            <SetButton subType="arms" item={set?.arms} selfKey={item.key} />
            <SetButton subType="legs" item={set?.legs} selfKey={item.key} />
            {/* <SetButton subType="backpack" item={set.backpack} selfKey={item.key} /> */}
          </div>
        </>
      )}

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

      {listVariants.length > 1 && (
        <>
          <hr />
          <div className="title-and-button">
            <h3 className="variants-title">外观变体</h3>
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
                key={vItem.key}
                onClick={
                  item.key === vItem.key
                    ? null
                    : () => {
                        searchParams.set("key", vItem.key);
                        setSearchParams(searchParams);
                      }
                }
              >
                <p>
                  {vItem.name_zh_Hans || vItem.name}
                  {item.key === vItem.key ? "（当前）" : ""}
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
