import "./Item.css";
import { useSearchParams } from "react-router";
import { useContext, useEffect, useState } from "react";
import ItemGroupInfo from "../../components/ItemGroupInfo/ItemGroupInfo";
import ItemInfo from "../../components/ItemInfo/ItemInfo";
import { AllItemsPriceContext } from "../../contexts";
import { getSet, getVariants, pushLocalStorageRecent } from "../../utils";

const Item = ({ item, setItem }) => {
  const [searchParams] = useSearchParams();
  const itemsData = useContext(AllItemsPriceContext);
  const [itemListVariants, setItemListVariants] = useState([]);
  const [itemSet, setItemSet] = useState(null);
  const [showMode, setShowMode] = useState("");

  useEffect(() => {
    setShowMode(searchParams.get("mode"));
    let key = searchParams.get("key");
    let _itemsData = itemsData[key];
    if (_itemsData) {
      pushLocalStorageRecent(key);
      setItem(itemsData[key]);
    } else {
      setItem(null);
    }
    setItemListVariants(getVariants(key, itemsData));
    setItemSet(getSet(key, itemsData));
  }, [searchParams, itemsData]);
  return (
    item &&
    (showMode === "variants" && itemListVariants.length > 1 ? (
      <ItemGroupInfo item={item} listVariants={itemListVariants} />
    ) : (
      <ItemInfo item={item} listVariants={itemListVariants} set={itemSet} />
    ))
  );
};

export default Item;
