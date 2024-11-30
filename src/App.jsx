import { useEffect, useState } from "react";
import "./App.css";
import ItemInfo from "./components/ItemInfo/ItemInfo";
import SearchBar from "./components/SearchBar/SearchBar";
import { useSearchParams } from "react-router";
import itemData from "./data/item_data.json";

function App() {
  const [showItem, setShowItem] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let uuid = searchParams.get("uuid");
    setShowItem(itemData[uuid]);
  }, [searchParams]);

  return (
    <>
      <SearchBar showItem={showItem} />

      {showItem && <ItemInfo item={showItem} />}
    </>
  );
}

export default App;
