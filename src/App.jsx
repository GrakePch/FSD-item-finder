import { useEffect, useState } from "react";
import "./App.css";
import ItemInfo from "./components/ItemInfo/ItemInfo";
import SearchBar from "./components/SearchBar/SearchBar";
import { useSearchParams } from "react-router";
import ItemGroupInfo from "./components/ItemGroupInfo/ItemGroupInfo";
import ItemSetInfo from "./components/ItemSetInfo/ItemSetInfo";
import axios from "axios";
import { getItemUexFormatBySlug, getVehicleUEXFormatBySlug } from "./utils";

function App() {
  const [item, setItem] = useState(null);
  const [showMode, setShowMode] = useState("");
  const [searchParams] = useSearchParams();
  const [itemsAll, setItemsAll] = useState([]);
  const [vehiclesBuyAll, setVehiclesBuyAll] = useState([]);
  const [vehiclesRentAll, setVehiclesRentAll] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("https://uexcorp.space/api/2.0/items_prices_all");
        // console.log(res.data.data);
        setItemsAll(res.data.data);
      } catch (err) {
        console.log(err);
      }
      try {
        const res = await axios.get(
          "https://uexcorp.space/api/2.0/vehicles_purchases_prices_all"
        );
        setVehiclesBuyAll(res.data.data);
      } catch (err) {
        console.log(err);
      }
      try {
        const res = await axios.get(
          "https://uexcorp.space/api/2.0/vehicles_rentals_prices_all"
        );
        setVehiclesRentAll(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let slug = searchParams.get("name");
    let tempItem = structuredClone(getItemUexFormatBySlug(slug));
    if (!tempItem) {
      tempItem = structuredClone(getVehicleUEXFormatBySlug(slug));
      tempItem.section = "Vehicle";
      tempItem.category = "Vehicle";
    }
    setItem(tempItem);
    let mode = searchParams.get("mode");
    setShowMode(mode);
  }, [searchParams]);

  return (
    <>
      <SearchBar
        centered={item === null}
        itemsAll={itemsAll}
        vehiclesBuyAll={vehiclesBuyAll}
        vehiclesRentAll={vehiclesRentAll}
      />

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
