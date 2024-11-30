import "./ItemInfo.css";
const ItemInfo = ({ item }) => {
  return (
    <div className="ItemInfo">
      <div className="item-info">
        <h1>{item.name.zh}</h1>
        <h2>{item.name.en}</h2>
        <p className="type">{item.type.zh}</p>
      </div>
      <hr />
      <div className="buy-option-titles">
        <h4 className="location">购买地点</h4>
        <h4 className="price">价格 (aUEC)</h4>
      </div>
      <div className="buy-option-list">
        {item.locations.map((option) => (
          <div className="buy-option" key={option.location.en}>
            <p className="location">{option.location.zh}</p>
            <p className="price">{option.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemInfo;
