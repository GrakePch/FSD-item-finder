import "./ItemInfo.css";
import TradeOptions from "../TradeOptions/TradeOptions";

const ItemInfo = ({ item }) => {
  const [type, subType] = item.type.zh.split("/");

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
    </div>
  );
};

export default ItemInfo;
