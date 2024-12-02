import { useSearchParams } from "react-router";
import itemData from "../../data/item_data.json";
import "./SetButton.css";

const SetButton = ({ subType, uuid, self }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tIcon = {
    undersuit: "🩲",
    helmet: "🤿",
    torso: "👕",
    arms: "💪",
    legs: "👖",
    backpack: "🎒",
  };

  return uuid ? (
    <button
      className="SetButton"
      onClick={uuid === self ? null : () => setSearchParams({ uuid: uuid })}
    >
      <p>{tIcon[subType]}</p>
      <p className="zh">
        {itemData[uuid].name.zh}
        {uuid === self ? "（当前）" : ""}
      </p>
      <p className="price">¤ {itemData[uuid].buy.minPrice} 起</p>
    </button>
  ) : (
    <button className="SetButton" disabled>
      <p>{tIcon[subType]}</p>
      <p className="zh">无</p>
    </button>
  );
};

export default SetButton;
