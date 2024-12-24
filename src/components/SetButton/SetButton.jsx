import { useSearchParams } from "react-router";
import "./SetButton.css";

const SetButton = ({ subType, item, selfKey }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tIcon = {
    undersuit: "🩲",
    helmet: "🤿",
    torso: "👕",
    arms: "💪",
    legs: "👖",
    backpack: "🎒",
  };

  return item ? (
    <button
      className="SetButton"
      onClick={item.key === selfKey ? null : () => setSearchParams({ key: item.key })}
    >
      <p>{tIcon[subType]}</p>
      <p className="zh">
        {item.name_zh_Hans}
        {item.key === selfKey ? "（当前）" : ""}
      </p>
      {item.price_min_max.buy_min && item.price_min_max.buy_min < Infinity ? (
        <p className="price">¤ {item.price_min_max.buy_min} 起</p>
      ) : (
        <p className="price" style={{ color: "hsl(0deg 0% 60%)" }}>
          无法购买
        </p>
      )}
    </button>
  ) : (
    <button className="SetButton" disabled>
      <p>{tIcon[subType]}</p>
      <p className="zh">无</p>
    </button>
  );
};

export default SetButton;
