import "./ItemGroupInfo.css";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { getVariants, typeCapitalizedToKey } from "../../utils";
import { useParams } from "react-router";
import { ContextAllData } from "../../contexts";
import TradeOptions from "../../components/TradeOptions/TradeOptions";
import ItemColorIcon from "../../components/ItemColorIcon/ItemColorIcon";
import { useTranslation } from "react-i18next";

const ItemGroupInfo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dictItems } = useContext(ContextAllData);
  const itemKey = useParams().itemKey;
  const [item, setItem] = useState<Item | null>(null);
  const [listVariants, setListVariants] = useState<Item[]>([]);

  useEffect(() => {
    if (itemKey) {
      const _item = dictItems[itemKey];
      if (_item) {
        setItem(_item);
        setListVariants(getVariants(itemKey, dictItems));
      } else {
        setItem(null);
      }
    }
  }, [itemKey, dictItems]);

  const [firstVariant, setFirstVariant] = useState<Item | null>(null);
  const [totalPriceData, setTotalPriceData] = useState<TradeOption[]>([]);
  const [totalPriceMinMax, setTotalPriceMinMax] = useState<Partial<PriceMinMax>>({});

  useEffect(() => {
    setFirstVariant(listVariants[0] || null);

    const optionDict: Record<number, TradeOption> = {};
    for (const item of listVariants) {
      for (const option of item.options) {
        if (!optionDict[option.id_terminal]) {
          optionDict[option.id_terminal] = option;
        } else {
          const o = optionDict[option.id_terminal];
          if (
            option.price_buy !== null &&
            (!o.price_buy || option.price_buy < o.price_buy)
          )
            o.price_buy = option.price_buy;
          if (
            option.price_sell !== null &&
            (!o.price_sell || option.price_sell > o.price_sell)
          )
            o.price_sell = option.price_sell;
        }
      }
    }
    const tempTotalPriceData = Object.values(optionDict);
    setTotalPriceData(tempTotalPriceData);

    /* Update price_min_max for each item */
    const pricesBuy = tempTotalPriceData
      .filter((a): a is TradeOption & { price_buy: number } => a.price_buy !== null)
      .map((a) => a.price_buy);
    const pricesSell = tempTotalPriceData
      .filter((a): a is TradeOption & { price_sell: number } => a.price_sell !== null)
      .map((a) => a.price_sell);
    const pricesRent =
      tempTotalPriceData
        ?.filter((a): a is TradeOption & { price_rent: number } => a.price_rent !== null)
        ?.map((a) => a.price_rent) || [];
    const tempTotalPriceMinMax = {
      buy_min: Math.min(...pricesBuy) || null,
      buy_max: Math.max(...pricesBuy) || null,
      sell_min: Math.min(...pricesSell) || null,
      sell_max: Math.max(...pricesSell) || null,
      rent_min: Math.min(...pricesRent) || null,
      rent_max: Math.max(...pricesRent) || null,
    };

    setTotalPriceMinMax(tempTotalPriceMinMax);
  }, [item, listVariants]);

  const handleTypeClick = (type: string | null, subType: string | null) => {
    if (!type) return;
    searchParams.set("type", type + "." + subType);
    navigate(`/?${searchParams.toString()}`);
  };

  return (
    item && (
      <div className="ItemGroupInfo">
        <div className="item-info">
          <h1 className="zh">
            {t(firstVariant?.key || item.key, { ns: "items", lng: "zh" })}{" "}
            <span>{t("ItemGroupInfo.sameKindItems", { count: listVariants.length })}</span>
          </h1>
          <h2 className="en">{t(firstVariant?.key || item.key, { ns: "items", lng: "en" })} ...</h2>
          {(item.type || item.sub_type) && (
            <div className="types">
              {item.type && (
                <button className="type" onClick={() => handleTypeClick(item.type, "")}>
                  {t("FilterType." + typeCapitalizedToKey(item.type))}
                </button>
              )}
              {item.type && item.sub_type && (
                <button
                  className="subtype"
                  onClick={() => handleTypeClick(item.type, item.sub_type)}
                >
                  {t("FilterType." + typeCapitalizedToKey(item.sub_type))}
                </button>
              )}
            </div>
          )}
        </div>
        {totalPriceData && totalPriceData.length > 0 && (
          <>
            <hr />
            <h3 className="trade-options-title">{t("TradeOptions.tradeType.buy")}</h3>
            <TradeOptions
              pricesData={totalPriceData}
              priceMinMax={totalPriceMinMax}
              tradeType="buy"
            />
          </>
        )}
        <hr />
        <h3 className="variants-title">{t("ItemGroupInfo.includedItems")}</h3>
        <div className="list-variants">
          {listVariants.map((vItem) => (
            <button
              className="variant"
              key={vItem.key}
              onClick={() => {
                navigate(`/i/${vItem.key}?${searchParams.toString()}`);
              }}
            >
              <ItemColorIcon name={t(vItem.key, { ns: "items", lng: "en" })} />
              <p className="name">{t(vItem.key, { ns: "items" })}</p>
              {vItem.price_min_max.buy_min && vItem.price_min_max.buy_min < Infinity ? (
                <p className="price">
                  {t("Common.priceFrom", { price: vItem.price_min_max.buy_min })}
                </p>
              ) : (
                <p className="price" style={{ color: "hsl(0deg 0% 60%)" }}>
                  {t("SearchItemResultList.notBuyable")}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  );
};

export default ItemGroupInfo;
