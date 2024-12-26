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

const percent = (v, zero, hundred) => {
  if (zero === hundred) return 0;
  return ((v - zero) / (hundred - zero)) * 100;
};

const TradeOptions = ({ pricesData, priceMinMax, tradeType }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const terminalsData = useContext(AllTerminalsContext);
  const [options, setOptions] = useState([]);
  const [locationForest, setLocationForest] = useState({});

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
      setLocationForest({});
      return;
    }

    const tempLocationForest = {};
    options
      .filter((option) => option["price_" + tradeType] > 0)
      .forEach((option) => {
        addToTree(tempLocationForest, getLocPath(option, terminalsData), option);
      });

    setLocationForest(tempLocationForest);
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
              return (
                <div className="option" key={option.id_terminal}>
                  <p className="location">
                    {getLocPath(option, terminalsData).map((loc, depth) => (
                      <span
                        key={depth}
                        className="location-chip"
                        style={{
                          backgroundColor: colorLocationDepth(depth),
                          color: depth <= 0 && `#000`,
                        }}
                      >
                        {getLocationZhName(loc)}
                      </span>
                    ))}
                  </p>
                  <p
                    className="date-modified"
                    style={{ color: option.date_modified < date4_0 && "#a06060" }}
                  >
                    {option.date_modified < date4_0 && (
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
                            priceMinMax[tradeType + "_max"]
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
            forest={locationForest}
            priceMin={priceMinMax[tradeType + "_min"]}
            priceMax={priceMinMax[tradeType + "_max"]}
            depth={0}
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

const LocationForest = ({ forest, priceMin, priceMax, depth, tradeType }) => {
  return Object.entries(forest).map(([key, loc]) => {
    if ("option" in loc) {
      return (
        <div className="option-in-tree" key={key}>
          <p className="location">
            <span
              className="location-chip"
              style={{ backgroundColor: colorLocationDepth(depth) }}
            >
              {getLocationZhName(loc.name)}
            </span>
          </p>
          {loc.option.date_modified < date4_0 && (
            <Icon path={mdiAlertCircleOutline} size="1rem" color="#a06060" />
          )}
          <p className="distance-info">{readableDistance(loc.option.distance)}</p>
          {loc.option["price_" + tradeType] > 0 ? (
            <p
              className="price"
              style={{
                color: colorPrice(
                  percent(loc.option["price_" + tradeType], priceMin, priceMax)
                ),
              }}
            >
              ¤ {loc.option["price_" + tradeType]}
            </p>
          ) : (
            <p className="price" style={{ color: `hsl(0deg 0% 50%)` }}>
              无法购买
            </p>
          )}
        </div>
      );
    } else if (Object.keys(loc.subs).length === 1)
      return (
        <div key={key} className="location-tree-nowrap">
          <p
            className="location-chip"
            style={{
              backgroundColor: colorLocationDepth(depth),
              color: depth <= 0 && `#000`,
            }}
          >
            {getLocationZhName(loc.name)}
          </p>
          <div className="sub-location">
            <LocationForest
              forest={loc.subs}
              priceMin={priceMin}
              priceMax={priceMax}
              depth={depth + 1}
              tradeType={tradeType}
            />
          </div>
        </div>
      );
    else
      return (
        <div key={key} className="location-tree">
          <p
            className="location-chip"
            style={{
              backgroundColor: colorLocationDepth(depth),
              color: depth <= 0 && `#000`,
            }}
          >
            {getLocationZhName(loc.name)}
          </p>
          <div className="line-and-list">
            <div className="line"></div>
            <div className="sub-location-list">
              <LocationForest
                forest={loc.subs}
                priceMin={priceMin}
                priceMax={priceMax}
                depth={depth + 1}
                tradeType={tradeType}
              />
            </div>
          </div>
        </div>
      );
  });
};

export default TradeOptions;
