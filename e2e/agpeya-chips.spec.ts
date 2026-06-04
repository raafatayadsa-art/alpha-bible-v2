import { test, expect, Page } from "@playwright/test";

const PRAYER_ID = "baker";
const URL_PATH = `/agpeya/${PRAYER_ID}`;

async function getScroller(page: Page) {
  // The reader's scroll container is the <main> element inside the reader root.
  return page.locator("main").first();
}

async function getChips(page: Page) {
  return page.locator("[data-chip]");
}

async function sectionTopRelativeToScroller(page: Page, id: string) {
  return await page.evaluate((sectionId) => {
    const root = document.querySelector("main") as HTMLElement | null;
    const el = document.querySelector(`#section-${sectionId}`) as HTMLElement | null;
    if (!root || !el) return null;
    const r = root.getBoundingClientRect();
    const e = el.getBoundingClientRect();
    return e.top - r.top;
  }, id);
}

test.describe("Agpeya reader — section chip tap navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_PATH);
    // Wait for chips to render
    await page.locator("[data-chip]").first().waitFor({ state: "visible" });
  });

  test("tapping each chip activates it and scrolls its section into view", async ({ page }) => {
    const chips = await getChips(page);
    const count = await chips.count();
    expect(count).toBeGreaterThan(1);

    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      const id = await chips.nth(i).getAttribute("data-chip");
      if (id) ids.push(id);
    }

    for (const id of ids) {
      const chip = page.locator(`[data-chip="${id}"]`);
      await chip.click();

      // 1) Highlight updates immediately to the tapped chip.
      await expect(chip).toHaveAttribute("aria-current", "true", { timeout: 1500 });

      // 2) After the smooth scroll settles, the section's top sits near the
      //    top of the scroll container (within tolerance of the 12px offset
      //    plus minor browser easing variance), or scroll is clamped at max
      //    for sections that cannot fully reach the top.
      await page.waitForTimeout(800); // wait for smooth scroll to finish

      const { top, clamped, clientHeight } = await page.evaluate((sectionId) => {
        const root = document.querySelector("main") as HTMLElement | null;
        const el = document.querySelector(`#section-${sectionId}`) as HTMLElement | null;
        if (!root || !el) return { top: null as number | null, clamped: false, clientHeight: 0 };
        const r = root.getBoundingClientRect();
        const e = el.getBoundingClientRect();
        const clamped = root.scrollTop + root.clientHeight >= root.scrollHeight - 2;
        return { top: e.top - r.top, clamped, clientHeight: root.clientHeight };
      }, id);
      expect(top).not.toBeNull();

      if (clamped) {
        // Near-bottom of scroll: section may not reach the top, but it must
        // be at least partially visible inside the scroll container.
        expect(top!).toBeLessThan(clientHeight);
        expect(top!).toBeGreaterThan(-clientHeight);
      } else {
        // Should land ~12px from the top (with tolerance for browser easing).
        expect(top!).toBeGreaterThanOrEqual(-4);
        expect(top!).toBeLessThanOrEqual(40);
      }

      // 3) Chip is still active after scroll settles (lock + tracker agree).
      await expect(chip).toHaveAttribute("aria-current", "true");
    }
  });

  test("only one chip is active at a time", async ({ page }) => {
    const chips = await getChips(page);
    const count = await chips.count();
    for (let i = 0; i < Math.min(count, 4); i++) {
      await chips.nth(i).click();
      await page.waitForTimeout(300);
      const activeCount = await page.locator('[data-chip][aria-current="true"]').count();
      expect(activeCount).toBe(1);
    }
  });
});
