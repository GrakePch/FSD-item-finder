# VerseGuide Location 字段来源映射

本文档说明 `scripts/starmap/normalize_verseguide_location_data.py` 生成的 `src/data/starmap/locations.json` 中，每个 location 字段对应 VerseGuide raw 数据的来源。

## Raw 来源约定

- 地点数据来自 Firestore location 文档：`systems/{SYSTEM}/planets/{routeCode}/locations/{locationId}`。
- fetch 阶段会遍历每个系统下的 Firestore planets，再读取每个 planet 子集合里的 `locations`，并写入 `raw.systems.{SYSTEM}.locations[]`。
- location 数据不来自 `systemPayload.data.resultset[0].celestial_objects[]`。`systemPayload` 更偏向 RSI Starmap 的 lore / 语义数据；location 文档本身包含地点坐标、类型、可见性、版本、量子标记、图片和补充描述等信息。
- `systemCode`：raw 的系统 key，例如 `STANTON`、`PYRO`、`NYX`。
- `bodyRouteCode`：`location.body`，对应地点所属的非恒星天体 route code；用于 normalized `parentCode` 时保留原始写法，例如 `I.1` 不拆分。
- `locationId`：优先使用 `location._documentId`，没有时回退到 `location.id`。

## 过滤规则

只有满足以下条件的 raw location 会输出到 `src/data/starmap/locations.json`：

| 条件 | 来源字段 |
| --- | --- |
| official 数据 | `location.share == "official"` |
| 排除 hidden | `location.hidden is False` |
| 属于目标版本 | `raw.version in location.versions`，或 CLI `--version` 指定版本在 `location.versions` 中 |

## 顶层字段

| 字段 | 来源 |
| --- | --- |
| `code` | 拼接 `{parentCode}/{readablePart}` |
| `name` | `location.name`；为空时回退到 `location.reference`；再为空时使用 `locationId` 字符串 |
| `type` | `location.tag` |
| `designation` | `location.designation` |
| `restrictions` | `location.restrictions` 规范化后的数组；raw 为空字符串、空数组或缺失时输出 `[]` |
| `factions` | `location.factions`；空字符串或缺失时输出 `null`，非空字符串会 trim 后保留 |
| `features` | `location.features` 规范化后的数组；raw 不是数组时输出 `[]` |
| `weather` | `location.weather`；包含 `low`、`high`、`average`、`count` 且均为有效数字时输出，否则为 `null` |
| `beaconMarker` | `bool(location.beacon.marker)` |
| `beaconType` | `location.beacon.type` |
| `parentCode` | 有 `location.body` 时为 `{systemCode}/{bodyRouteCode}`；否则为 `systemCode` |
| `parentStarCode` | 固定为 `systemCode` |
| `cartesianInKm.x` | `location.x / 1000` |
| `cartesianInKm.y` | `location.y / 1000` |
| `cartesianInKm.z` | `location.z / 1000` |

## `code` 生成规则

| 组成部分 | 来源 |
| --- | --- |
| `parentCode` | 见顶层字段表 |
| `readablePart` | 依次取 `location.name`、`location.designation`、`location.reference`、`location.id`、`location._documentId` 的第一个非空值，再 slugify；空格和其他非字母数字字符会替换为 `-` |

示例：

```json
{
  "parentCode": "STANTON/1A",
  "name": "Caterpillar 16T",
  "designation": "16T-YQ39 / W"
}
```

生成：

```text
STANTON/1A/caterpillar-16t
```

`location.reference` 参与 `readablePart` 的回退计算，但不作为 normalized location 顶层字段输出。

## 单位说明

- `cartesianInKm` 坐标来自 VerseGuide 米制坐标，normalize 阶段统一除以 `1000` 并保留 6 位小数。
- `weather` 来自 VerseGuide location 的局部 weather 样本。raw 字段没有明确单位标记，normalized 阶段只保留数值形态。

## 特殊处理

- Hidden location 在过滤阶段排除。
- 顶层 `restrictions` 是整理后的数组，raw 的 `location.share` 和 `location.hidden` 只用于过滤。
- Firestore typed value 中的 `"NaN"` 在 fetch 阶段会被解包为 `null`，normalize 阶段会把非有效数字按字段规则回退或跳过。

## 前端消费约定

- 前端运行时直接消费 `src/data/starmap/locations.json`，并使用 `location.code` 作为 `dictLocations` key。
- location 路由为 code-only 的 `/l/*`，例如 `/l/STANTON/II/orison`；旧 name URL 不做兼容解析。
- 运行时会额外挂 `parentBody`、`parentStar` 和 `terminals`，父级关联通过 `parentCode` / `parentStarCode` 匹配 VG body code。
- UEX / legacy location 名称只通过内部 `src/data/location_alias_to_code.json` 和唯一 VG name 做 best-effort 匹配，不参与路由兼容。
- `beaconMarker` 对应旧 UI 中的量子标记可用状态；`restrictions` 中包含 `private` 时对应旧 UI 的私有地点状态。
