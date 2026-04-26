# 物品展示 JSON 数据流程

本文档说明当前物品展示链路的数据来源、生成流程，以及哪些 JSON 只作为生成输入保留。当前约束是：物品数据与 i18n 分离。

## 运行时加载

应用启动时，`src/App.tsx` 调用 `fetchAndProcessItems()`，得到 `dictItems` 后写入 `ContextAllData`。物品搜索页、物品详情页、物品组详情页和终端物品列表都读取这个 `dictItems`。

运行时物品数据流程：

1. 浏览器请求 `/data/items.json`，实际文件是 `public/data/items.json`。
2. `items.json` 提供语言无关的物品 catalog：`key`、`ids`、`type`、`sub_type`、`slug`、`screenshot`、`attributes`。
   - 历史 key 如果没有当前 UEX id 且旧类型快照也无法识别，`type/sub_type` 会保留为 `null`，但 key 不会丢失。
3. 浏览器通过 `fetchWithCache("items_prices_all", ...)` 请求 UEX `items_prices_all`，结果缓存在 IndexedDB。
4. `fetchAndProcessItems()` 只在浏览器端合并动态价格，生成最终 `ItemDictionary`。
5. 页面继续通过 `src/i18n/items/{en,zh}.json` 的 `items` namespace 显示物品名称；catalog 不包含英文名、中文名或排序名。

## 直接参与物品展示的 JSON

| 文件 | 用途 |
| --- | --- |
| `public/data/items.json` | 唯一的物品静态 runtime catalog。只包含语言无关数据，不包含展示文案。 |
| `src/i18n/items/en.json` | 物品英文名称。搜索、详情、终端列表、变体分组会使用它。 |
| `src/i18n/items/zh.json` | 物品中文名称。搜索和展示通过 `items` namespace 使用它。 |
| `src/i18n/en.json` / `src/i18n/zh.json` | UI 文案、筛选器、属性名、属性值等翻译。 |

物品详情页的交易地点还依赖地点和终端链路：

| 文件或接口 | 用途 |
| --- | --- |
| UEX `terminals` | 构建终端字典和终端路径。 |
| `src/data/bodies.json` / `src/data/locations.json` | 构建星体和地点字典，用于终端匹配、路径、距离计算。 |
| `src/data/uex_bodies_fix_manual.json` | 修正 UEX terminal 返回的 body/orbit 名称。 |
| `src/data/location_name_to_i18n_key.json` | 地点名到 `locations` i18n key 的映射。 |
| `src/i18n/locations/{en,zh}.json` | 交易地点路径和地点名称翻译。 |

## 生成输入，不参与用户运行时加载

| 文件 | 用途 |
| --- | --- |
| `scripts/uex_item/key_match_rules.json` | 人工匹配规则，用于把 UEX item/vehicle 名称映射到本地 i18n key。 |
| `scripts/uex_item/item_type.json` | 旧物品类型快照。只在生成 `items.json` 时作为 `type/sub_type` 兜底输入。 |
| `scripts/uex_item/type_map_full_items.json` | 把旧 `Type` 映射到当前 UI 使用的 `type/sub_type`。只在生成阶段使用。 |
| `$RUNNER_TEMP/itemkey_id.json` | workflow 临时 item key map，不提交到仓库。 |
| `$RUNNER_TEMP/vehiclekey_id.json` | workflow 临时 vehicle key map，不提交到仓库。 |

以下旧 runtime 产物已删除，不再被前端加载：

- `src/data/key_to_uex_id/itemkey_id.json`
- `src/data/key_to_uex_id/item_type.json`
- `src/data/type_map_full_items.json`
- `public/data/items_uex.json`

## UEX 物品数据更新流程

`.github/workflows/update-uex-item-data.yml` 的流程：

1. 运行 `scripts/uex_item/update_key_to_uex_id.py`。
   - 请求 UEX `items_prices_all` 和 `vehicles_purchases_prices_all`。
   - 下载英文 `global.ini`。
   - 读取 `scripts/uex_item/key_match_rules.json`。
   - 输出临时 `$RUNNER_TEMP/itemkey_id.json` 和 `$RUNNER_TEMP/vehiclekey_id.json`。
2. 运行 `scripts/uex_item/update_vehicle_key_to_uex_ids_and_i18n.py`。
   - 读取临时 vehicle key map。
   - 更新 `src/data/vehicles/key_to_uex_ids_and_i18n.json`。
   - 这是载具链路，和物品 runtime catalog 分离。
3. 运行 `scripts/uex_item/update_items_uex.json.py`。
   - 读取临时 item key map。
   - 请求 UEX item categories、items、items_attributes。
   - 使用 `scripts/uex_item/item_type.json` 和 `scripts/uex_item/type_map_full_items.json` 补齐缺失类型。
   - 写入 `public/data/items.json`。
4. 运行 `npm run build` 验证前端能加载新 catalog。
5. 如果有变化，提交 `public/data/items.json` 和 `src/data/vehicles/key_to_uex_ids_and_i18n.json`。

## i18n 更新流程

`.github/workflows/update-i18n-data.yml` 仍然负责 i18n：

1. 下载英文和中文 `global.ini`。
2. `scripts/i18n/process_ini_items.py` 过滤 `item_Name`、`item_decoration`、`item_Mining`。
3. 写入 `src/i18n/items/en.json` 和 `src/i18n/items/zh.json`。
4. 其他脚本继续生成 locations、vehicles、vehicle_classes 翻译。

这条链路只生成翻译，不生成物品 catalog。物品 catalog 只保存语言无关数据。

## 最终物品对象字段来源

| 最终字段 | 来源 |
| --- | --- |
| `key` | `public/data/items.json` |
| `ids` | `public/data/items.json` |
| `type` / `sub_type` | `public/data/items.json`，生成阶段尽量用 UEX metadata 或旧类型快照补齐；无法识别的历史 key 为 `null` |
| `slug` | `public/data/items.json` |
| `screenshot` | `public/data/items.json` |
| `attributes` | `public/data/items.json` |
| `options` | UEX `items_prices_all` 运行时接口 |
| `price_min_max` | 从 `options` 计算，并忽略 4.0 时间点以前的旧价格 |
| 显示名称 | `src/i18n/items/en.json` / `src/i18n/items/zh.json` |
| 交易地点路径 | UEX `terminals` 运行时接口 + 本地地点 JSON |

交易地点列表展示时，4.0 时间点以前的非 Pyro 价格会额外显示旧数据警告。
