import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "@mdi/react";
import { mdiClose, mdiArrowExpandHorizontal, mdiTimerOutline, mdiFuel } from "@mdi/js";
import styles from "./QuantumTravelItemCard.module.css";
import SearchBar from "../../../components/SearchBar/SearchBar";

/**
 * QuantumTravelItemCard:
 * 在 ItemInfo 物品页展示量子驱动器（QD）的性能卡，并提供一个"选择舰船"popup。
 *
 * 背景：QD 卡片的油耗段（每段对应一条演示航线）需要 `fuelCapacity`（燃料罐容量），
 * 这是船侧数据；物品页没有"船"上下文。因此本组件让用户选一艘船，用该船的
 * TotalQuantumFuelCapacity 作为油耗计算基准。选船按钮直接展示所选船的燃料容量。
 *
 * 数据源（全部静态 import，与 VehicleInfo 页一致）：
 *  - vehicle_hardpoints.json：QD 槽位 size + 每艘船的 QuantumFuelTanks.TotalQuantumFuelCapacity
 *  - vehicle_index.json：ClassName → 船名（本地化走 vehicles i18n）
 *  - vehicle_items_essential.json：QD 本体性能（speed / 两段加速度 / grade / class / size）
 */
import vehicleHardpointsRaw from "../../../data/vehicles/vehicle_hardpoints.json";
import { formatTime } from "../../VehicleInfo/VehicleSupplementalInfo/formatters";
import type { EssentialVehicleItem } from "../../VehicleInfo/VehicleSupplementalInfo/types";
import { getInstalledItems } from "../../VehicleInfo/VehicleSupplementalInfo/hardpointUtils";
import { getVehicleNameI18nKey } from "../../../utils/vehicleI18n";

const vehicleHardpointsList = vehicleHardpointsRaw as unknown as VehicleHardpointData[];

// 油耗系数表（与 Fancy-SC-Ship-Info-2 / VehicleSupplementalInfo 一致，前端常量，非数据源）
const mapConsumptionScuPerGmSpecial: Record<string, number> = {
  QDRV_ORIG_S04_890J_SCItem: 0.047,
  QDRV_WETK_S04_Idris_TEMP: 0.075,
  QDRV_AEGS_S04_Javelin_SCItem: 0.12,
};

const mapConsumptionScuPerGm: Record<number, Record<number, number>> = {
  1: { 1: 0.014, 2: 0.012, 3: 0.01, 4: 0.008 },
  2: { 1: 0.011, 2: 0.013, 3: 0.016, 4: 0.019 },
  3: { 1: 0.018, 2: 0.021, 3: 0.026, 4: 0.031 },
};

// 演示航距（Gm）
const distCrusaderToHurstonGm = 31.92;
const distMicroTechToPyroGatewayGm = 67.97;
const distTerminusToEndgameGm = 136.49;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// 量子航行时间（与 VehicleSupplementalInfo 内联实现一致）
const qtTime = (
  distance: number,
  speedMax: number,
  accelStage1: number,
  accelStage2: number
) => {
  const accelSum = accelStage1 + accelStage2;
  const accelSumSq = accelSum ** 2;
  const reachThreshold =
    (4 * speedMax ** 2 * (2 * accelStage1 + accelStage2)) / (3 * accelSumSq);

  if (distance >= reachThreshold) {
    return (
      (4 * speedMax) / accelSum +
      distance / speedMax -
      (4 * speedMax * (2 * accelStage1 + accelStage2)) / (3 * accelSumSq)
    );
  }

  const delta = accelStage2 - accelStage1;
  const z =
    (3 * delta ** 2 * accelSumSq * distance) / (8 * speedMax ** 2 * accelStage1 ** 3) - 1;
  const prefactor =
    (4 * accelStage1 * speedMax) / (accelStage2 ** 2 - accelStage1 ** 2);

  if (z > 1) {
    const sqrtTerm = Math.sqrt(Math.max(z * z - 1, 0));
    const logTerm = -Math.log(z - sqrtTerm);
    return prefactor * (2 * Math.cosh(logTerm / 3) - 1);
  }

  const safeZ = clamp(z, -1, 1);
  return prefactor * (2 * Math.cos((1 / 3) * Math.acos(safeZ)) - 1);
};

// StandardJump 的运行时形态可能含 State2AccelerationRate 或 Stage2AccelerationRate（essential 类型只声明了 State2，数据里两种都可能出现）
type StandardJumpWithStage2 = {
  Speed?: number;
  Stage1AccelerationRate?: number;
  State2AccelerationRate?: number;
  Stage2AccelerationRate?: number;
};

// 依据 QD 的 size 筛出所有可安装的船，附带燃料容量
type ShipMatch = {
  className: string;
  name: string; // 英文船名（含厂商前缀），本地化兜底
  fuelCapacity: number;
};

const findMatchingShips = (qdSize: number | undefined): ShipMatch[] => {
  if (qdSize === undefined) return [];

  return vehicleHardpointsList
    .map((v) => {
      const propulsion = v.Hardpoints?.Components?.Propulsion;
      const quantumDrives = propulsion?.QuantumDrives;
      const slots = getInstalledItems<VehiclePort>(quantumDrives) || [];
      let slotSize: number | undefined;
      for (const item of slots) {
        if (typeof item.MinSize === "number" && typeof item.MaxSize === "number") {
          slotSize = item.MinSize;
          break;
        }
      }
      const fuelCapacity =
        propulsion?.QuantumFuelTanks?.TotalQuantumFuelCapacity ?? 0;
      return {
        className: v.ClassName,
        name: v.Name,
        fuelCapacity,
        slotSize,
      };
    })
    .filter((s) => s.slotSize === qdSize);
};

const FuelCapacityBar = ({ totalWidth, segmentWidth }: { totalWidth: number; segmentWidth: number }) => {
  if (segmentWidth <= 0 || !Number.isFinite(segmentWidth)) {
    return <div className={styles.fuelCapacityBar} />;
  }
  const segmentNum = Math.floor(totalWidth / segmentWidth);
  const lastSegmentWidth = totalWidth % segmentWidth;
  return (
    <div className={styles.fuelCapacityBar}>
      {Array.from({ length: segmentNum }).map((_, i) => (
        <div key={i} className={styles.segment} style={{ width: `${(segmentWidth / totalWidth) * 100}%` }} />
      ))}
      {lastSegmentWidth > 0 && (
        <div className={styles.remainder} style={{ width: `${(lastSegmentWidth / totalWidth) * 100}%` }} />
      )}
    </div>
  );
};

type QuantumTravelItemCardProps = {
  vItem: EssentialVehicleItem;
};

const QuantumTravelItemCard = ({ vItem }: QuantumTravelItemCardProps) => {
  const { t } = useTranslation();
  const [shipPickerOpen, setShipPickerOpen] = useState(false);

  const className = vItem.stdItem.ClassName;
  const size = vItem.stdItem.Size;

  // 匹配本 QD size 的船（基础列表，未排序）
  const baseShips = useMemo(() => findMatchingShips(size), [size]);
  const [selectedClassName, setSelectedClassName] = useState<string | null>(null);

  // 排序控制
  const [sortMode, setSortMode] = useState<"name" | "fuelCap">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  // 搜索
  const [searchQuery, setSearchQuery] = useState("");

  // 本地化船名（vehicles 命名空间），fallback 英文名
  const shipDisplayName = useCallback(
    (ship: ShipMatch) =>
      t(getVehicleNameI18nKey(ship.className), {
        ns: "vehicles",
        defaultValue: ship.name,
      }),
    [t]
  );

  // 依据排序方式 + 方向排序后的列表
  const sortedShips = useMemo(() => {
    const arr = [...baseShips];
    arr.sort((a, b) => {
      if (sortMode === "fuelCap") {
        return sortDir === "asc"
          ? a.fuelCapacity - b.fuelCapacity
          : b.fuelCapacity - a.fuelCapacity;
      }
      const na = shipDisplayName(a);
      const nb = shipDisplayName(b);
      return sortDir === "asc" ? na.localeCompare(nb) : nb.localeCompare(na);
    });
    return arr;
  }, [baseShips, sortMode, sortDir, shipDisplayName]);

  // 依据搜索关键词过滤（已排序列表上过滤，保留排序顺序）。
  // 匹配本地化船名、英文船名与 className，支持中/英文输入。
  const filteredShips = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedShips;
    return sortedShips.filter(
      (ship) =>
        shipDisplayName(ship).toLowerCase().includes(q) ||
        ship.name.toLowerCase().includes(q) ||
        ship.className.toLowerCase().includes(q)
    );
  }, [sortedShips, searchQuery, shipDisplayName]);

  const selectedShip =
    sortedShips.find((s) => s.className === selectedClassName) || sortedShips[0];

  const infoQuantumDrive = vItem.stdItem.QuantumDrive;
  const fuelCapacity = selectedShip?.fuelCapacity ?? 0;

  const speedMaxMps = infoQuantumDrive?.StandardJump?.Speed;
  const accelStage1 = infoQuantumDrive?.StandardJump?.Stage1AccelerationRate;
  const accelStage2 =
    (infoQuantumDrive?.StandardJump as StandardJumpWithStage2 | undefined)
      ?.State2AccelerationRate ??
    (infoQuantumDrive?.StandardJump as StandardJumpWithStage2 | undefined)
      ?.Stage2AccelerationRate;

  const canShowCard =
    boolSpeed(speedMaxMps) && boolSpeed(accelStage1) && boolSpeed(accelStage2) && fuelCapacity > 0;

  if (!canShowCard) return null;

  const consumptionScuPerGm =
    mapConsumptionScuPerGmSpecial[className] ||
    (size !== undefined && vItem.stdItem.Grade !== undefined
      ? mapConsumptionScuPerGm[size]?.[vItem.stdItem.Grade]
      : undefined) ||
    0;

  const consumptionCrusaderToHurstonScu = consumptionScuPerGm * distCrusaderToHurstonGm;
  const consumptionCrusaderToHurstonPercent =
    (consumptionCrusaderToHurstonScu / fuelCapacity) * 100;
  const timeCrusaderToHurstonFormatted = formatTime(
    qtTime(distCrusaderToHurstonGm * 1e9, speedMaxMps, accelStage1, accelStage2)
  );

  const consumptionMicroTechToPyroGatewayScu = consumptionScuPerGm * distMicroTechToPyroGatewayGm;
  const consumptionMicroTechToPyroGatewayPercent =
    (consumptionMicroTechToPyroGatewayScu / fuelCapacity) * 100;
  const timeMicroTechToPyroGatewayFormatted = formatTime(
    qtTime(distMicroTechToPyroGatewayGm * 1e9, speedMaxMps, accelStage1, accelStage2)
  );

  const consumptionTerminusToEndgameScu = consumptionScuPerGm * distTerminusToEndgameGm;
  const consumptionTerminusToEndgamePercent =
    (consumptionTerminusToEndgameScu / fuelCapacity) * 100;
  const timeTerminusToEndgameFormatted = formatTime(
    qtTime(distTerminusToEndgameGm * 1e9, speedMaxMps, accelStage1, accelStage2)
  );

  const percentStyle = (prct: number) => ({
    color: prct < 100 ? "var(--color-nav-mode)" : "var(--color-red)",
  });

  return (
    <section className={styles.container}>
      {/* 选船交互：两行按钮（船名+更换飞船 / 量子燃料容量+SCU） */}
      <button
        type="button"
        className={styles.shipSelector}
        onClick={() => setShipPickerOpen(true)}
      >
        <span className={styles.shipSelectorRow}>
          <span className={styles.shipSelectorName}>
            {selectedShip ? shipDisplayName(selectedShip) : "-"}
          </span>
          <span className={styles.shipSelectorChange}>
            {t("ItemInfo.QuantumTravel.ChangeShip", { defaultValue: "更换飞船" })}
          </span>
        </span>
        <span className={styles.shipSelectorRow}>
          <span className={styles.shipSelectorFuelValue}>
            <Icon path={mdiFuel} size="0.9rem" />
            {fuelCapacity.toFixed(1)} SCU
          </span>
        </span>
      </button>

      <div className={styles.sectionCommonInfo}>
        <div className={styles.commonKeyValue}>
          <div>{t("QuantumTravel.MaxSpeed")}</div>
          <div>{(speedMaxMps * 1e-9).toFixed(1)} Gm/s</div>
        </div>
        <div className={styles.commonKeyValue}>
          <div>{t("QuantumTravel.ConsumptionPerGm")}</div>
          <div>{consumptionScuPerGm.toFixed(3)} SCU</div>
        </div>

        <FuelCapacityBar totalWidth={fuelCapacity} segmentWidth={consumptionCrusaderToHurstonScu} />
        <div className={styles.commonKeyValue}>
          <div>{t("QuantumTravel.CrusaderToHurston")}</div>
          <div className={styles.routeValue}>
            <Icon path={mdiArrowExpandHorizontal} size="0.9rem" />
            {distCrusaderToHurstonGm} Gm
          </div>
        </div>
        <div className={styles.commonKeyValue}>
          <div className={styles.routeValueLeft}>
            <Icon path={mdiTimerOutline} size="0.9rem" />
            <b>{timeCrusaderToHurstonFormatted}</b>
          </div>
          <div className={styles.routeValue} style={percentStyle(consumptionCrusaderToHurstonPercent)}>
            <Icon path={mdiFuel} size="0.9rem" />
            {Math.ceil(consumptionCrusaderToHurstonPercent)} %
          </div>
        </div>

        <FuelCapacityBar totalWidth={fuelCapacity} segmentWidth={consumptionMicroTechToPyroGatewayScu} />
        <div className={styles.commonKeyValue}>
          <div>{t("QuantumTravel.MicroTechToPyroGateway")}</div>
          <div className={styles.routeValue}>
            <Icon path={mdiArrowExpandHorizontal} size="0.9rem" />
            {distMicroTechToPyroGatewayGm} Gm
          </div>
        </div>
        <div className={styles.commonKeyValue}>
          <div className={styles.routeValueLeft}>
            <Icon path={mdiTimerOutline} size="0.9rem" />
            <b>{timeMicroTechToPyroGatewayFormatted}</b>
          </div>
          <div className={styles.routeValue} style={percentStyle(consumptionMicroTechToPyroGatewayPercent)}>
            <Icon path={mdiFuel} size="0.9rem" />
            {Math.ceil(consumptionMicroTechToPyroGatewayPercent)} %
          </div>
        </div>

        <FuelCapacityBar totalWidth={fuelCapacity} segmentWidth={consumptionTerminusToEndgameScu} />
        <div className={styles.commonKeyValue}>
          <div>{t("QuantumTravel.TerminusToEndgame")}</div>
          <div className={styles.routeValue}>
            <Icon path={mdiArrowExpandHorizontal} size="0.9rem" />
            {distTerminusToEndgameGm} Gm
          </div>
        </div>
        <div className={styles.commonKeyValue}>
          <div className={styles.routeValueLeft}>
            <Icon path={mdiTimerOutline} size="0.9rem" />
            <b>{timeTerminusToEndgameFormatted}</b>
          </div>
          <div className={styles.routeValue} style={percentStyle(consumptionTerminusToEndgamePercent)}>
            <Icon path={mdiFuel} size="0.9rem" />
            {Math.ceil(consumptionTerminusToEndgamePercent)} %
          </div>
        </div>
      </div>

      {shipPickerOpen && (
        <div className={styles.popupOverlay} onClick={() => setShipPickerOpen(false)}>
          <div className={styles.popupPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <div className={styles.popupTitle}>
                {t("ItemInfo.QuantumTravel.SelectShip", { defaultValue: "选择舰船" })}
              </div>
              <div className={styles.popupControls}>
                <select
                  className={styles.popupSelect}
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as "name" | "fuelCap")}
                  aria-label={t("ItemInfo.QuantumTravel.SortBy", { defaultValue: "排序方式" })}
                >
                  <option value="name">
                    {t("ItemInfo.QuantumTravel.SortShipName", {
                      defaultValue: "船名",
                    })}
                  </option>
                  <option value="fuelCap">
                    {t("ItemInfo.QuantumTravel.SortFuelCapacity", {
                      defaultValue: "燃料容量",
                    })}
                  </option>
                </select>
                <select
                  className={styles.popupSelect}
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
                  aria-label={t("ItemInfo.QuantumTravel.SortDirection", {
                    defaultValue: "方向",
                  })}
                >
                  <option value="asc">
                    {t("ItemInfo.QuantumTravel.Ascending", {
                      defaultValue: "升序",
                    })}
                  </option>
                  <option value="desc">
                    {t("ItemInfo.QuantumTravel.Descending", {
                      defaultValue: "降序",
                    })}
                  </option>
                </select>
              </div>
              <button
                type="button"
                className={styles.popupClose}
                onClick={() => setShipPickerOpen(false)}
                aria-label="Close"
              >
                <Icon path={mdiClose} size="1.25rem" />
              </button>
            </div>
            <SearchBar
              className={styles.popupSearchBar}
              searchName={searchQuery}
              setSearchName={setSearchQuery}
              placeholder={t("ItemInfo.QuantumTravel.SearchShips", {
                defaultValue: "搜索飞船",
              })}
              inputId="qd-ship-search"
            />
            <div className={styles.popupList}>
              {filteredShips.length === 0 ? (
                <div className={styles.popupEmpty}>
                  {t("ItemInfo.QuantumTravel.NoShipsFound", {
                    defaultValue: "没有找到匹配的飞船",
                  })}
                </div>
              ) : (
                filteredShips.map((ship) => (
                  <button
                    type="button"
                    key={ship.className}
                    className={[
                      styles.popupRow,
                      ship.className === selectedShip?.className ? styles.popupRowActive : undefined,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      setSelectedClassName(ship.className);
                      setShipPickerOpen(false);
                    }}
                  >
                    <span className={styles.popupRowLeft}>
                      <span className={styles.popupShipName}>{shipDisplayName(ship)}</span>
                    </span>
                    <span className={styles.popupFuel}>{ship.fuelCapacity.toFixed(1)} SCU</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// helper: guard numbers
const boolSpeed = (v: number | undefined | null): v is number =>
  typeof v === "number" && Number.isFinite(v) && v > 0;

export default QuantumTravelItemCard;
