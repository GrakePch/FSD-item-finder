import { useContext, useEffect, useState } from "react";
import "./TradeOptions.css";
import {
  colorLocationDepth,
  colorPrice,
  date4_0,
  getLocationZhName,
  getLocPath,
  getTerminalDistance,
  readableDistance,
} from "../../utils";
import { AllTerminalsContext } from "../../contexts";
import { useSearchParams } from "react-router";
import Icon from "@mdi/react";
import { mdiAlertCircleOutline } from "@mdi/js";
import locationNameToType from "../../data/location_name_to_type.json";
import { icon } from "../../assets/icon";

/**
 * @typedef {{id_terminal: number, distance: number, price_buy?: number | null, price_sell?: number | null, price_rent?: number | null, date_modified: number}} TradeOption
 * @typedef {{name: string, subs: LocationForest, option?: TradeOption}} LocationTree
 * @typedef {Record<string, LocationTree>} LocationForest
 * @typedef {{locs: string[], depth: number, subs: LocationTreeShallow[], option?: TradeOption}} LocationTreeShallow
 **/

const percent = (v, zero, hundred) => {
  if (zero === hundred) return 0;
  return Math.max(Math.min(((v - zero) / (hundred - zero)) * 100, 100), 0);
};

const TradeOptions = ({ pricesData, priceMinMax, tradeType }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const terminalsData = useContext(AllTerminalsContext);
  const [options, setOptions] = useState([]);

  /** @type {ReturnType<typeof useState<LocationTreeShallow[]>>} */
  const [locationForestShallow, setLocationForestShallow] = useState([]);

  useEffect(() => {
    /* Sort by location name first, no matter sort options */
    let tempOptions = pricesData
      .filter((o) => o.id_terminal in terminalsData)
      .toSorted((a, b) =>
        getLocPath(a, terminalsData)
          .join("  ")
          .localeCompare(getLocPath(b, terminalsData).join("  "))
      );

    /* Compute Distances from the "from" param, and sort by distance */
    let fromBodyName = searchParams.get("from");
    tempOptions.forEach((e) => {
      e.distance = getTerminalDistance(e, fromBodyName, terminalsData);
    });
    tempOptions.sort((a, b) => a.distance - b.distance);

    /* Sort by sorting options */
    if (searchParams.get("sort") === "price") {
      if (tradeType === "sell") {
        tempOptions.sort((a, b) => b["price_" + tradeType] - a["price_" + tradeType]);
      } else {
        tempOptions.sort((a, b) => a["price_" + tradeType] - b["price_" + tradeType]);
      }
    }

    // console.log(tempOptions);
    setOptions(tempOptions);
  }, [pricesData, searchParams]);

  useEffect(() => {
    if (options.length <= 0) {
      setLocationForestShallow([]);
      return;
    }

    const tempLocationForest = {};
    options
      .filter((option) => option["price_" + tradeType] > 0)
      .forEach((option) => {
        addToTree(tempLocationForest, getLocPath(option, terminalsData), option);
      });

    // console.log(tempLocationForest);

    const tempLocationForestShallow = [];
    optimizeForest(tempLocationForestShallow, tempLocationForest, 0);
    // console.log(tempLocationForestShallow);

    setLocationForestShallow(tempLocationForestShallow);
  }, [options]);

  return (
    <div className="TradeOptions">
      <div className="titles">
        <h3 className="location">
          {tradeType === "buy" ? "购买" : tradeType === "sell" ? "出售" : "租赁"}地点
        </h3>
        <h4 className="price">
          {tradeType === "buy"
            ? "购买价格"
            : tradeType === "sell"
            ? "出售价格"
            : "单日租赁价格"}
        </h4>
      </div>
      <div className="options-container">
        {searchParams.get("sort") === "price" ? (
          options
            .filter((option) => option["price_" + tradeType] > 0)
            .map((option) => {
              let date = new Date(option.date_modified * 1000);
              let locPath = getLocPath(option, terminalsData);
              return (
                <div className="option" key={option.id_terminal}>
                  <LocationPathChips path={locPath} startDepth={0} />
                  <p
                    className="date-modified"
                    style={{
                      color:
                        option.date_modified < date4_0 &&
                        locPath[0] !== "Pyro" &&
                        "#a06060",
                    }}
                  >
                    {option.date_modified < date4_0 && locPath[0] !== "Pyro" && (
                      <Icon path={mdiAlertCircleOutline} size="1rem" />
                    )}
                    {date.getMonth() + 1}/{date.getDate()}
                  </p>
                  {option["price_" + tradeType] > 0 ? (
                    <p
                      className="price"
                      style={{
                        color: colorPrice(
                          percent(
                            option["price_" + tradeType],
                            priceMinMax[tradeType + "_min"],
                            priceMinMax[tradeType + "_min"] * 2
                          )
                        ),
                      }}
                    >
                      ¤ {option["price_" + tradeType]}
                    </p>
                  ) : (
                    <p className="price" style={{ color: `hsl(0deg 0% 50%)` }}>
                      无法购买
                    </p>
                  )}
                </div>
              );
            })
        ) : (
          <LocationForest
            forest={locationForestShallow}
            priceMin={priceMinMax[tradeType + "_min"]}
            priceMax={priceMinMax[tradeType + "_max"]}
            tradeType={tradeType}
          />
        )}
      </div>
      <p className="annotation">
        <Icon path={mdiAlertCircleOutline} size={"1rem"} />
        标记的价格最后更新于4.0-Preview上线之前，可能会有较大误差。
      </p>
    </div>
  );
};

const addToTree = (tree, path, option) => {
  let current = tree;
  path.forEach((node, index) => {
    if (!current[node]) {
      current[node] = {
        name: node,
        subs: {},
      };
    }
    if (index == path.length - 1) current[node].option = option;
    current = current[node].subs;
  });
};

/**
 *
 * @param {LocationTreeShallow[]} newForest
 * @param {LocationForest} oldForest
 * @param {number} depth
 */
const optimizeForest = (newForest, oldForest, depth) => {
  for (const oldTree of Object.values(oldForest)) {
    /** @type {LocationTreeShallow} */
    let newTree = {
      depth: depth,
      locs: [oldTree.name],
      subs: [],
      option: oldTree.option,
    };
    if (Object.keys(oldTree.subs).length > 1)
      optimizeForest(newTree.subs, oldTree.subs, depth + 1);
    else if (Object.keys(oldTree.subs).length == 1) {
      optimizeTree(newTree, oldTree, depth + 1);
    }
    newForest.push(newTree);
  }
};

/**
 *
 * @param {LocationTreeShallow} newTree
 * @param {LocationTree} oldTree
 * @param {number} depth
 */
const optimizeTree = (newTree, oldTree, depth) => {
  let onlySubTree = Object.values(oldTree.subs)[0];
  newTree.locs.push(onlySubTree.name);
  newTree.option = onlySubTree.option;
  if (Object.keys(onlySubTree.subs).length == 1) {
    optimizeTree(newTree, onlySubTree, depth + 1);
  } else if (Object.keys(onlySubTree.subs).length > 1) {
    optimizeForest(newTree.subs, onlySubTree.subs, depth + 1);
  }
};

const LocationForest = ({ forest, priceMin, priceMax, tradeType }) => {
  const terminalsData = useContext(AllTerminalsContext);
  return forest.map((tree) =>
    tree.option ? (
      <div
        className={"option-in-tree" + (tree.depth > 0 ? " not-root" : "")}
        key={tree.locs[0]}
      >
        <LocationPathChips path={tree.locs} startDepth={tree.depth} />
        {tree.option.date_modified < date4_0 &&
          getLocPath(tree.option, terminalsData)[0] !== "Pyro" && (
            <Icon path={mdiAlertCircleOutline} size="1rem" color="#a06060" />
          )}
        <p className="distance-info">{readableDistance(tree.option.distance)}</p>
        {tree.option["price_" + tradeType] > 0 ? (
          <p
            className="price"
            style={{
              color: colorPrice(
                percent(tree.option["price_" + tradeType], priceMin, priceMin * 2)
              ),
            }}
          >
            ¤ {tree.option["price_" + tradeType]}
          </p>
        ) : (
          <p className="price" style={{ color: `hsl(0deg 0% 50%)` }}>
            无法购买
          </p>
        )}
      </div>
    ) : (
      <div
        className={"location-tree" + (tree.depth > 0 ? " not-root" : "")}
        key={tree.locs[0]}
      >
        <LocationPathChips path={tree.locs} startDepth={tree.depth} />
        <div style={{ marginLeft: "1.5rem" }}>
          <LocationForest
            forest={tree.subs}
            priceMin={priceMin}
            priceMax={priceMax}
            tradeType={tradeType}
          />
        </div>
      </div>
    )
  );
};

const LocationPathChips = ({ path, startDepth }) => (
  <p className="location">
    {path.map((loc, idx) => (
      <span
        key={loc + idx}
        className="location-chip"
        style={{
          backgroundColor: colorLocationDepth(startDepth + idx),
          color: startDepth + idx <= 0 && `#000`,
        }}
      >
        {locationNameToType[loc] === 1 && (
          <Icon path={icon["Space Station"]} size="1rem" color="hsl(170deg 80% 50%)" />
        )}
        {getLocationZhName(loc)}
      </span>
    ))}
  </p>
);

export default TradeOptions;
