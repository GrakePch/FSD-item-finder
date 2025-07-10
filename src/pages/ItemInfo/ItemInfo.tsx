import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { ContextAllData } from "../../contexts";
import "./ItemInfo.css";
import { useNavigate, useSearchParams } from "react-router";
import Icon from "@mdi/react";
import { mdiTagMultipleOutline } from "@mdi/js";
import {
  getSet,
  getVariants,
  pushLocalStorageRecent,
  toI18nKey,
  typeCapitalizedToKey,
} from "../../utils";
import ItemColorIcon from "../../components/ItemColorIcon/ItemColorIcon";
import SetButton from "../../components/SetButton/SetButton";
import TradeOptions from "../../components/TradeOptions/TradeOptions";
import TagCurrent from "../../components/TagCurrent/TagCurrent";
import TradeOptionsSortingControl from "../../components/TradeOptionsSortingControl/TradeOptionsSortingControl";
import { useTranslation } from "react-i18next";

const uexLinkItem = "https://uexcorp.space/items/info?name=";
const uexLinkVehicle = "https://uexcorp.space/vehicles/home/list/in_game_sell/";

const ItemInfo = () => {
  const { t } = useTranslation();
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
        pushLocalStorageRecent(itemKey);
      } else {
        setItem(null);
      }
    }
  }, [itemKey, dictItems]);

  const handleTypeClick = (type: string, subType: string) => {
    searchParams.set("type", type + "." + subType);
    navigate(`/?${searchParams.toString()}`);
  };

  return (
    item && (
      <div className="ItemInfo">
        <div className="info-and-image">
          <div className="item-info">
            <div>
              <h1 className="zh">{t(item.key, { ns: "items" })}</h1>
              <h2 className="en">{t(item.key, { ns: "items", lng: "en" })}</h2>
            </div>
            <div className="types">
              <button className="type" onClick={() => handleTypeClick(item.type, "")}>
                {t("FilterType." + typeCapitalizedToKey(item.type))}
              </button>
              <button
                className="subtype"
                onClick={() => handleTypeClick(item.type, item.sub_type)}
              >
                {t("FilterType." + typeCapitalizedToKey(item.sub_type))}
              </button>
            </div>
            <div className="attributes">
              {item.attributes &&
                Object.entries(item.attributes).map(([aid, v]) => (
                  <div key={aid} className="attribute">
                    <p>{t("UEXAttribute." + aid)}</p>
                    <p>{t("UEXAttributeValue." + toI18nKey(v), { defaultValue: v })}</p>
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
                  <ItemColorIcon name={t(vItem.key, { ns: "items", lng: "en" })} />
                  <p className="name">
                    {t(vItem.key, { ns: "items", lng: "zh" }) ||
                      t(vItem.key, { ns: "items", lng: "en" })}
                    {item.key === vItem.key && <TagCurrent />}
                  </p>
                  {vItem.price_min_max.buy_min &&
                  vItem.price_min_max.buy_min < Infinity ? (
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
    )
  );
};

export default ItemInfo;
