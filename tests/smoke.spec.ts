import { expect, test, type Page } from "@playwright/test";

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
      : [];

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data }),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockUexApi(page);
});

test("desktop universal search and language query", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop-only smoke");

  await page.goto("/");

  await expect(page.getByRole("button", { name: "Open search" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();

  await page.keyboard.press("Control+K");
  const dialog = page.getByRole("dialog", { name: "" });
  await expect(dialog).toBeVisible();

  const searchInput = page.locator(".universal-search-input-row input");
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

  await page.locator(".LanguageToggle").click();
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

test("mobile floating actions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only smoke");

  await page.goto("/");

  const homeFab = page.getByRole("button", { name: "Home" });
  const searchFab = page.getByRole("button", { name: "Open search" });
  const languageFab = page.locator(".LanguageToggle");

  await expect(homeFab).toBeVisible();
  await expect(searchFab).toBeVisible();
  await expect(languageFab).toBeVisible();

  await searchFab.click();
  await expect(page.getByRole("dialog", { name: "" })).toBeVisible();
  const closeSearchFab = page.locator(".universal-search-fab");
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
