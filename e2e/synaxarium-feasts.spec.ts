import { test, expect } from "@playwright/test";

test.describe("Synaxarium — mobile RTL", () => {
  test("home renders header, hero, timeline CTA, and upcoming list", async ({ page }) => {
    await page.goto("/synaxarium");

    // RTL container
    await expect(page.locator("div[dir='rtl']").first()).toBeVisible();

    // Header title
    await expect(page.getByRole("heading", { name: "السنكسار" })).toBeVisible();
    await expect(page.getByText("قراءات اليوم").first()).toBeVisible();

    // Hero today saint
    await expect(page.getByText("القديس شنودة رئيس المتوحدين").first()).toBeVisible();
    await expect(page.getByText("اللون الطقسي:")).toBeVisible();

    // CTA
    const cta = page.getByRole("link", { name: /اقرأ السيرة كاملة/ });
    await expect(cta).toBeVisible();

    // Upcoming section
    await expect(page.getByText("قديسو الأيام القادمة")).toBeVisible();
    await expect(page.getByText("القديس أنبا أنطونيوس الكبير")).toBeVisible();
  });

  test("hero CTA navigates to saint details", async ({ page }) => {
    await page.goto("/synaxarium");
    await page.getByRole("link", { name: /اقرأ السيرة كاملة/ }).click();
    await expect(page).toHaveURL(/\/synaxarium\/shenouda/);
    await expect(page.getByText("نبذة عن حياته")).toBeVisible();
    await expect(page.getByText("أهم الأحداث في حياته")).toBeVisible();
    // Info grid tiles
    await expect(page.getByText("تاريخ نياحته")).toBeVisible();
    await expect(page.getByText("مكان نياحته")).toBeVisible();
    await expect(page.getByText("خدمته")).toBeVisible();
  });
});

test.describe("Feasts & Events — mobile RTL", () => {
  test("home renders chips, today hero, list and quick actions", async ({ page }) => {
    await page.goto("/feasts");

    await expect(page.locator("div[dir='rtl']").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "الأعياد والمناسبات" })).toBeVisible();

    // Filter chips
    for (const label of ["الكل", "الأعياد", "أصوام", "قديسين", "مناسبات"]) {
      await expect(page.getByRole("button", { name: label })).toBeVisible();
    }

    // Today hero
    await expect(page.getByText("اليوم", { exact: true })).toBeVisible();
    await expect(page.getByText("خميس العهد").first()).toBeVisible();
    await expect(page.getByText("تعرف على المناسبة")).toBeVisible();

    // List includes multiple feasts
    await expect(page.getByText("الجمعة العظيمة").first()).toBeVisible();
    await expect(page.getByText("عيد القيامة المجيد").first()).toBeVisible();

    // Quick actions
    for (const label of ["قراءات اليوم", "الصوم الحالي", "التقويم الكامل", "التنبيهات"]) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });

  test("category filter narrows the list", async ({ page }) => {
    await page.goto("/feasts");
    await page.getByRole("button", { name: "أصوام" }).click();
    // No items in fasts category in mock data — list should not show feast titles
    await expect(page.getByText("الجمعة العظيمة")).toHaveCount(0);
    // Switch back
    await page.getByRole("button", { name: "الكل" }).click();
    await expect(page.getByText("الجمعة العظيمة").first()).toBeVisible();
  });

  test("tapping a list item opens event details", async ({ page }) => {
    await page.goto("/feasts");
    await page.getByRole("link", { name: /عيد القيامة المجيد/ }).first().click();
    await expect(page).toHaveURL(/\/feasts\/resurrection/);
    await expect(page.getByRole("heading", { name: "عيد القيامة المجيد" })).toBeVisible();
    for (const section of ["عن المناسبة", "الطقس والصلوات", "قراءات اليوم", "مناسبات ذات صلة"]) {
      await expect(page.getByText(section).first()).toBeVisible();
    }
  });
});
