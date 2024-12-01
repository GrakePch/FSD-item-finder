import { useEffect, useState } from "react";
import "./App.css";
import ItemInfo from "./components/ItemInfo/ItemInfo";
import SearchBar from "./components/SearchBar/SearchBar";
import { useSearchParams } from "react-router";
import itemData from "./data/item_data.json";
import ItemGroupInfo from "./components/ItemGroupInfo/ItemGroupInfo";

function App() {
  const [item, setItem] = useState(null);
  const [isGroup, setIsGroup] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let uuid = searchParams.get("uuid");
    let tempItem = itemData[uuid] || null;
    setItem(tempItem);
    let isGroup = searchParams.get("group");
    setIsGroup(isGroup && tempItem.variants?.length);
  }, [searchParams]);

  return (
    <>
      <SearchBar centered={item === null} />

      {item &&
        (isGroup ? <ItemGroupInfo item={item} /> : <ItemInfo item={item} />)}
    </>
  );
}

export default App;
