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

      const top = await sectionTopRelativeToScroller(page, id);
      expect(top).not.toBeNull();

      const clamped = await page.evaluate(() => {
        const root = document.querySelector("main") as HTMLElement | null;
        if (!root) return false;
        return root.scrollTop + root.clientHeight >= root.scrollHeight - 2;
      });

      if (clamped) {
        // Near-bottom: section can't reach the top; just assert it's visible.
        expect(top!).toBeLessThan(800);
        expect(top!).toBeGreaterThan(-50);
      } else {
        // Should land ~12px from the top (with some tolerance for sub-pixel rounding).
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
