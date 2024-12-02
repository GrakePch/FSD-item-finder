import { useSearchParams } from "react-router";
import "./ItemSetInfo.css";
import { useEffect, useState } from "react";
import SetButton from "../SetButton/SetButton";
import itemData from "../../data/item_data.json";
import TradeOptions from "../TradeOptions/TradeOptions";

const ItemSetInfo = ({ item }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [setPriceData, setSetPriceData] = useState(null);

  useEffect(() => {
    let locToSet = {};
    for (const subType of ["undersuit", "helmet", "torso", "arms", "legs", "backpack"]) {
      if (item.set[subType])
        for (const option of itemData[item.set[subType]].buy.locations) {
          if (!locToSet[option.location.en]) {
            locToSet[option.location.en] = { location: option.location, set: {} };
          }
          locToSet[option.location.en].set[subType] = option.price;
        }
    }

    let numberPiecesInSet = Object.values(item.set).filter((a) => a !== null).length;

    let tempSetPriceData = { locations: [] };
    let minPrice = Infinity;
    let maxPrice = 0;
    for (const option of Object.values(locToSet)) {
      if (Object.values(option.set).length === numberPiecesInSet) {
        /* Can buy the complete set at this location */
        let totalPrice = Object.values(option.set).reduce((a, b) => (a += b), 0);
        minPrice = Math.min(minPrice, totalPrice);
        maxPrice = Math.max(maxPrice, totalPrice);

        tempSetPriceData.locations.push({
          location: option.location,
          price: totalPrice,
        });
      }
    }
    tempSetPriceData.minPrice = minPrice;
    tempSetPriceData.maxPrice = maxPrice;

    setSetPriceData(tempSetPriceData);
  }, [item]);

  return (
    <div className="ItemSetInfo">
      <div className="item-info">
        <h1 className="zh">套装</h1>
        <h2 className="en">Set</h2>
      </div>
      <div className="set-container">
        <SetButton subType="undersuit" uuid={item.set.undersuit} />
        <SetButton subType="helmet" uuid={item.set.helmet} />
        <SetButton subType="torso" uuid={item.set.torso} />
        <SetButton subType="arms" uuid={item.set.arms} />
        <SetButton subType="legs" uuid={item.set.legs} />
        <SetButton subType="backpack" uuid={item.set.backpack} />
      </div>
      <h3 className="trade-options-title">可购买完整套装地点及总价</h3>
      {setPriceData && setPriceData.locations.length > 0 ? (
        <TradeOptions pricesData={setPriceData} tradeType="buy" />
      ) : (
        <p className="message">很遗憾，没有任何地点可以购买完整套装</p>
      )}
    </div>
  );
};

export default ItemSetInfo;
