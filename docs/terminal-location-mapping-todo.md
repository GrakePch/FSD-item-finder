# Terminal Location Mapping TODO

The browser now resolves UEX terminal parent locations through the precomputed
`src/data/uex_location_vg_location_map.*.json` files instead of runtime
location-name matching. Remaining work should continue moving display and trade
logic from name-derived paths toward stable UEX typed refs, VG location codes,
and i18n keys.

## Remaining Frontend Cleanup

- Add structured terminal fields such as `parentLocationCode`, `parentLocationI18nKey`, and `parentBodyCode` when processing UEX terminals. Keep `parentLocation` as the hydrated object reference.
- Replace terminal display paths that depend on `location_path: string[]` plus `locationNameToI18nKey(name)` with code/key-backed display data.
- Update trade option sorting and location tree grouping to prefer `terminal.parentLocation.code` and body codes instead of text path segments from `getLocPath()`.
- Reduce the `getTerminalDistance()` fallback that reads `locPath[1]` once mapping coverage is high enough or a structured terminal body code exists.
- Update terminal search to search terminal name plus mapped VG location name/code/i18n key instead of joining translated `location_path.slice(3)`.

## Data And Generation Follow-Ups

- Move hardcoded generator name replacements into a small script-local JSON file if the list grows beyond the current known aliases.
- Fill `src/data/uex_location_vg_location_map.manual.json` only for final UEX ref to VG code overrides that cannot be expressed as reusable name matching rules.
- Review `src/data/uex_location_vg_location_map.unmatched.json` when adding manual mappings or new generator rules.
- Track generated coverage over time. Current generated coverage is 143 UEX refs and 726 / 823 terminals; 97 terminals remain unmatched.
- Add manual mappings or stronger generator rules for the remaining unmatched refs before removing display-path fallbacks.
