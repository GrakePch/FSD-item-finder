import { useState } from "react";
import "./App.css";
import ItemInfo from "./components/ItemInfo/ItemInfo";
import SearchBar from "./components/SearchBar/SearchBar";

function App() {
  const [showItem, setShowItem] = useState(null);

  return (
    <>
      <SearchBar showItem={showItem} setShowItem={setShowItem} />

      {showItem && <ItemInfo item={showItem} />}
    </>
  );
}

export default App;
