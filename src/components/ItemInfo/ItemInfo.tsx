import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { ContextAllData } from "../../contexts";
import "./ItemInfo.css";
import TradeOptions from "../TradeOptions/TradeOptions";
import { useNavigate, useSearchParams } from "react-router";
import Icon from "@mdi/react";
import { mdiTagMultipleOutline } from "@mdi/js";
import SetButton from "../SetButton/SetButton";
import {
  getAttributeValueZhName,
  getAttributeZhName,
  getCategoryZhName,
  getSet,
  getUEXAttribute,
  getVariants,
} from "../../utils";
import TagCurrent from "../TagCurrent/TagCurrent";
import TradeOptionsSortingControl from "../TradeOptionsSortingControl/TradeOptionsSortingControl";
import ItemColorIcon from "../ItemColorIcon/ItemColorIcon";

const uexLinkItem = "https://uexcorp.space/items/info?name=";
const uexLinkVehicle = "https://uexcorp.space/vehicles/home/list/in_game_sell/";

const ItemInfo = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [item, setItem] = useState<Item | null>(null);
  const [listVariants, setListVariants] = useState<Item[]>([]);
  const [set, setSet] = useState<ArmorSet | null>(null);
  const { dictItems } = useContext(ContextAllData);
  const itemKey = useParams().itemKey;

  useEffect(() => {
    if (itemKey) {
      const _item = dictItems[itemKey];
      if (_item) {
        setItem(_item);
        setListVariants(getVariants(itemKey, dictItems));
        setSet(getSet(itemKey, dictItems));
      } else {
        setItem(null);
      }
    }
  }, [itemKey, dictItems]);

  const handleTypeClick = (type: string, subType: string) => {
    searchParams.set("type", type + "." + subType);
    searchParams.set("searchFocus", "1");
    setSearchParams(searchParams);
  };

  return item && (
    <div className="ItemInfo">
      <div className="info-and-image">
        <div className="item-info">
          <div>
            <h1 className="zh">{item.name_zh_Hans || item.name}</h1>
            <h2 className="en">{item.name}</h2>
          </div>
          <div className="types">
            <button className="type" onClick={() => handleTypeClick(item.type, "")}>
              {getCategoryZhName(item.type)}
            </button>
            <button
              className="subtype"
              onClick={() => handleTypeClick(item.type, item.sub_type)}
            >
              {getCategoryZhName(item.sub_type)}
            </button>
          </div>
          <div className="attributes">
            {item.attributes &&
              Object.entries(item.attributes).map(([aid, v]) => (
                <div key={aid} className="attribute">
                  <p>{getAttributeZhName(getUEXAttribute(aid)?.name)}</p>
                  <p>{getAttributeValueZhName(v)}</p>
                </div>
              ))}
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
          </div>
          <div className="set-container">
            <SetButton subType="undersuit" item={set?.undersuit} selfKey={item.key} />
            <SetButton subType="helmet" item={set?.helmet} selfKey={item.key} />
            <SetButton subType="torso" item={set?.torso} selfKey={item.key} />
            <SetButton subType="arms" item={set?.arms} selfKey={item.key} />
            <SetButton subType="legs" item={set?.legs} selfKey={item.key} />
            <SetButton subType="backpack" item={set?.backpack} selfKey={item.key} />
          </div>
        </>
      )}

      <hr />
      <TradeOptionsSortingControl />
      {item.options &&
        item.options.length > 0 &&
        item.price_min_max.buy_min &&
        item.price_min_max.buy_min < Infinity && (
          <TradeOptions
            pricesData={item.options}
            priceMinMax={item.price_min_max}
            tradeType="buy"
          />
        )}
      {item.options &&
        item.options.length > 0 &&
        item.price_min_max.sell_min &&
        item.price_min_max.sell_min < Infinity && (
          <TradeOptions
            pricesData={item.options}
            priceMinMax={item.price_min_max}
            tradeType="sell"
          />
        )}

      {/* {item.options_rent && item.options_rent.length > 0 && (
        <TradeOptions
          pricesData={item.options_rent}
          priceMinMax={item.price_min_max}
          tradeType="rent"
        />
      )} */}

      {listVariants.length > 1 && (
        <>
          <hr />
          <div className="title-and-button">
            <h3 className="variants-title">外观变体</h3>
            <button
              className="button-check-group"
              onClick={() => {
                navigate(`/iv/${item.key}?${searchParams.toString()}`);
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
                        navigate(`/i/${vItem.key}?${searchParams.toString()}`);
                      }
                }
              >
                <ItemColorIcon name={vItem.name} />
                <p className="name">
                  {vItem.name_zh_Hans || vItem.name}
                  {item.key === vItem.key && <TagCurrent />}
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
