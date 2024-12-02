import { useEffect, useState } from "react";
import "./App.css";
import ItemInfo from "./components/ItemInfo/ItemInfo";
import SearchBar from "./components/SearchBar/SearchBar";
import { useSearchParams } from "react-router";
import itemData from "./data/item_data.json";
import ItemGroupInfo from "./components/ItemGroupInfo/ItemGroupInfo";
import ItemSetInfo from "./components/ItemSetInfo/ItemSetInfo";

function App() {
  const [item, setItem] = useState(null);
  const [showMode, setShowMode] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let uuid = searchParams.get("uuid");
    let tempItem = itemData[uuid] || null;
    setItem(tempItem);
    let mode = searchParams.get("mode");
    setShowMode(mode);
  }, [searchParams]);

  return (
    <>
      <SearchBar centered={item === null} />

      {item &&
        (showMode === "variants" && item.variants?.length > 1 ? (
          <ItemGroupInfo item={item} />
        ) : showMode === "set" && item.set ? (
          <ItemSetInfo item={item} />
        ) : (
          <ItemInfo item={item} />
        ))}
    </>
  );
}

export default App;
