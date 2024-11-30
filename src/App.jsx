import { useEffect, useState } from "react";
import "./App.css";
import ItemInfo from "./components/ItemInfo/ItemInfo";
import SearchBar from "./components/SearchBar/SearchBar";
import { useSearchParams } from "react-router";
import itemData from "./data/item_data.json";

function App() {
  const [item, setItem] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let uuid = searchParams.get("uuid");
    setItem(itemData[uuid] || null);
  }, [searchParams]);

  return (
    <>
      <SearchBar centered={item === null} />

      {item && <ItemInfo item={item} />}
    </>
  );
}

export default App;
