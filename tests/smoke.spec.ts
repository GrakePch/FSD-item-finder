import { expect, test, type Page } from "@playwright/test";

const VIRTUAL_ITEM_ROW_HEIGHT = 56;

async function mockUexApi(page: Page) {
  await page.route("https://api.uexcorp.space/2.0/**", async (route) => {
    const url = new URL(route.request().url());
    const pathname = url.pathname;
    const data = pathname.endsWith("/terminals")
      ? [
          {
            id: 94,
            code: "SMOKE",
            name: "Smoke Test Terminal",
            type: "item",
            star_system_name: "Stanton",
            orbit_name: "Crusader",
            planet_name: "Crusader",
            moon_name: null,
            space_station_name: null,
            outpost_name: "Smoke Test Outpost",
            city_name: null,
            faction_name: "UEE",
            company_name: "Smoke",
            is_affinity_influenceable: 0,
            is_habitation: 0,
            is_refinery: 0,
            is_cargo_center: 0,
            is_medical: 0,
            is_food: 0,
            is_shop_fps: 1,
            is_shop_vehicle: 0,
            is_refuel: 0,
            is_repair: 0,
            is_nqa: 0,
            is_player_owned: 0,
            is_auto_load: 0,
            has_loading_dock: 0,
            has_docking_port: 0,
            has_freight_elevator: 0,
          },
        ]
      : pathname.endsWith("/items_prices")
        ? [
            {
              id_item: 777,
              id_terminal: 94,
              price_buy: 100,
              price_sell: null,
              date_modified: 0,
            },
          ]
        : [];

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data }),
    });
  });
}

async function getMaxRenderedItemIndex(page: Page) {
  return page.locator('[class*="resultListItem"]').evaluateAll((rows) =>
    Math.max(
      ...rows.map((row) => {
        const transform = (row as HTMLElement).style.transform;
        const match = transform.match(/translateY\(([-0-9.]+)px\)/);
        return match ? Number(match[1]) / 56 : 0;
      })
    )
  );
}

test.beforeEach(async ({ page }) => {
  await mockUexApi(page);
});

test("terminal item list follows English language query", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop-only smoke");

  await page.goto("/t/94?lang=en");

  const terminalItemList = page.locator(".TerminalInfo .list-sell");
  await expect(terminalItemList).toContainText("Brandt Module");
  await expect(terminalItemList).not.toContainText("布兰特 模组");
});

test("home history item list follows English language query", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop-only smoke");

  await page.addInitScript(() => {
    window.localStorage.setItem("recent", "item_Mining_Consumable_Brandt");
  });
  await page.goto("/?lang=en");

  const homeHistoryList = page.locator('[class*="SearchResultList"]').first();
  await expect(homeHistoryList).toContainText("Brandt Module");
  await expect(homeHistoryList).not.toContainText("布兰特 模组");
});

test("item search results follow English language query", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop-only smoke");

  await page.goto("/?lang=en&search=i&show_unbuyable=1");
  await page.locator('[class*="universalSearchInputRow"] input').fill("brandt");

  const itemResults = page.locator('[class*="itemResults"]').first();
  await expect(itemResults).toContainText("Brandt Module");
  await expect(itemResults).not.toContainText("布兰特 模组");
});

test("desktop universal search and language query", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop-only smoke");

  await page.goto("/");

  await expect(page.getByRole("button", { name: "Open search" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();

  await page.keyboard.press("Control+K");
  const dialog = page.getByRole("dialog", { name: "" });
  await expect(dialog).toBeVisible();

  const searchInput = page.locator('[class*="universalSearchInputRow"] input');
  await expect(searchInput).toBeFocused();
  await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveCount(1);

  const selectedTabBefore = await page
    .locator('[role="tab"][aria-selected="true"]')
    .innerText();
  await page.keyboard.press("Control+K");
  await expect
    .poll(async () =>
      page.locator('[role="tab"][aria-selected="true"]').innerText()
    )
    .not.toBe(selectedTabBefore);

  await page.locator('[class*="LanguageToggle"]').click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("lang"))
    .toBe("en");

  await searchInput.fill("smoke");
  await page.keyboard.press("Escape");
  await expect(searchInput).toHaveValue("");
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("desktop item type filter scrolls through virtualized results", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop-only smoke");

  await page.goto("/?search=i&type=Systems.&show_unbuyable=1");

  await expect(page.getByRole("dialog", { name: "" })).toBeVisible();
  const itemResults = page.locator('[class*="itemResults"]').first();
  await expect(itemResults).toBeVisible();
  await expect.poll(() =>
    itemResults.evaluate((element) => element.scrollHeight > element.clientHeight)
  ).toBe(true);

  const initialMaxIndex = await getMaxRenderedItemIndex(page);
  expect(initialMaxIndex).toBeLessThan(50);

  const lastIndex = await itemResults.evaluate(
    (element, rowHeight) => Math.floor(element.scrollHeight / rowHeight) - 1,
    VIRTUAL_ITEM_ROW_HEIGHT
  );
  await itemResults.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event("scroll", { bubbles: true }));
  });

  await expect.poll(() => getMaxRenderedItemIndex(page)).toBeGreaterThanOrEqual(lastIndex - 1);
});

test("mobile floating actions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only smoke");

  await page.goto("/");

  const homeFab = page.getByRole("button", { name: "Home" });
  const searchFab = page.getByRole("button", { name: "Open search" });
  const languageFab = page.locator('[class*="LanguageToggle"]');

  await expect(homeFab).toBeVisible();
  await expect(searchFab).toBeVisible();
  await expect(languageFab).toBeVisible();

  await searchFab.click();
  await expect(page.getByRole("dialog", { name: "" })).toBeVisible();
  const closeSearchFab = page.locator('[class*="universalSearchFab"]');
  await expect(closeSearchFab).toHaveAttribute("aria-label", "Close search");

  await languageFab.click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("lang"))
    .toBe("en");

  await closeSearchFab.click();
  await expect(page.getByRole("dialog", { name: "" })).toBeHidden();

  await page.goto("/t/94");
  await homeFab.click();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/");
});
