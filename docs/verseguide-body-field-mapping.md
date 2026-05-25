# VerseGuide Body 字段来源映射

本文档说明 `scripts/starmap/normalize_verseguide_location_data.py` 生成的 `src/data/starmap/body.json` 中，每个 body 字段对应 VerseGuide raw 数据的来源。

## Raw 来源约定

- 恒星天体：来自 `raw.systems.{SYSTEM}.systemPayload.data.resultset[0]`，即 VerseGuide Storage 中的 system payload；normalized 中作为该系统的根恒星天体输出。
- 非恒星天体：主体几何/渲染字段来自 `raw.systems.{SYSTEM}.planets[]`，即 Firestore `systems/{SYSTEM}/planets/{routeCode}` 文档；语义字段来自同系统 `systemPayload.data.resultset[0].celestial_objects[]` 中 `id` 相同的词条。
- `systemPayload` 的数据更偏向 RSI Starmap 的 lore / 语义数据，例如归属、宜居性、轨道周期、描述类信息；Firestore planets 的数据更偏向几何数据和渲染数据，例如坐标、半径、四元数、自转和大气渲染参数。
- `routeCode`：非恒星天体的 `planet.code`，没有时使用 `planet._documentId`；用于 normalized `code` / `parentCode` 时保留 routeCode 原始写法。
- `systemCode`：raw 的系统 key，例如 `STANTON`、`PYRO`、`NYX`。

## 顶层字段

| 字段 | 恒星天体来源 | 非恒星天体来源 |
| --- | --- | --- |
| `code` | `systemCode` | 拼接 `{systemCode}/{routeCode}` |
| `name` | `systemPayload.data.resultset[0].name`；为空时用 `systemCode.title()` | `planet.name`；为空时依次回退到 `planet.designation`、`planet.code`、`planet._documentId` |
| `type` | `systemPayload.data.resultset[0].type` | `planet.type` |
| `subType` | `systemPayload.data.resultset[0].type`；恒星天体 payload 没有独立 subtype | 优先 `celestial_objects[].subtype.name`；没有时回退到 `planet.type_name` |
| `parentCode` | 固定为 `null` | 根据 `planet.parent_id` 在同系统 planets 的 `id -> routeCode` 映射中查找；找到则为 `{systemCode}/{parentRouteCode}`；否则为 `systemCode`；如果父级是 `STAR` 文档，也映射为 `systemCode` |
| `parentStarCode` | 固定为 `null` | 固定为 `systemCode` |
| `cartesianInKm.x` | `systemPayload.data.resultset[0].position_x / 1000` | `planet.bx / 1000` |
| `cartesianInKm.y` | `systemPayload.data.resultset[0].position_y / 1000` | `planet.by / 1000` |
| `cartesianInKm.z` | `systemPayload.data.resultset[0].position_z / 1000` | `planet.bz / 1000` |
| `bodyRadiusInKm` | 优先取 Firestore `planets[]` 中 `type == "STAR"` 的 `radius / 1000`；缺失时回退到 `systemPayload.data.resultset[0].celestial_objects[]` 中 STAR 记录的 `size` | `planet.radius`，单位为 km；不是有效数字时为 `0.0` |
| `quaternion.w` | 固定为 `1.0` | `planet.qw`；不是有效数字时为 `1.0` |
| `quaternion.x` | 固定为 `0.0` | `planet.qx`；不是有效数字时为 `0.0` |
| `quaternion.y` | 固定为 `0.0` | `planet.qy`；不是有效数字时为 `0.0` |
| `quaternion.z` | 固定为 `0.0` | `planet.qz`；不是有效数字时为 `0.0` |
| `habitable` | 省略 | `celestial_objects[].habitable`；字段存在但值不是 boolean 时输出 `null` |
| `affiliation.code` | `systemPayload.data.resultset[0].affiliation[0].code` | `celestial_objects[].affiliation[0].code` |
| `affiliation.name` | `systemPayload.data.resultset[0].affiliation[0].name` | `celestial_objects[].affiliation[0].name` |
| `affiliation.color` | `systemPayload.data.resultset[0].affiliation[0].color` | `celestial_objects[].affiliation[0].color` |
| `orbitPeriod` | 省略 | `celestial_objects[].orbit_period`；只有有效数字时输出 |
| `atmosphere_compounds` | 省略 | `planet.compounds`；空对象不输出，空字符串项会跳过，其余值按字符串保留 |
| `atmosphereHeightInKm` | 省略 | `planet.atmosphere`；单位为 km；只有有效数字时输出 |
| `omRadiusInKm` | 省略 | `planet.omDistance`；单位为 km；只有有效数字时输出 |
| `rotationPeriodInHours` | 省略 | `planet.rotationSpeed`；单位为小时/自转周期；只有有效数字时输出 |
| `rotationCorrection` | 省略 | `planet.rotationCorrection`；只有有效数字时输出 |

## 单位说明

- `bodyRadiusInKm` 和 `omRadiusInKm` 按 km 输出。恒星 `bodyRadiusInKm` 的 Firestore `radius` 来源为米制，normalize 阶段会除以 `1000`；payload STAR `size` fallback 已是 km 量级，直接保留。
- `atmosphereHeightInKm` 来自 VerseGuide `planet.atmosphere`。与 `bodies_render_data.json` 中 `atmosphereHeightM` 对照时，`34.45` 对应 `34450m`，因此这里按 km 保留。
- `rotationPeriodInHours` 来自 VerseGuide `rotationSpeed`，表示小时/自转周期。

## 过滤与特殊处理

- Firestore planets 中 `type == "STAR"` 的文档由恒星天体记录覆盖，不作为非恒星天体输出；其 `radius` 字段会用于恒星天体的 `bodyRadiusInKm`。
- Firestore typed value 中的 `"NaN"` 在 fetch 阶段会被解包为 `null`，normalize 阶段会把非有效数字按字段规则回退或跳过。
- `cartesianInKm` 坐标来自 VerseGuide 米制坐标，normalize 阶段统一除以 `1000` 并保留 6 位小数。
