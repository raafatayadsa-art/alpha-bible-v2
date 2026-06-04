import { describe, it, expect } from "vitest";
import { normalizeEntityTab, isPlaceEntity, isPersonEntity } from "@/lib/entity-category";

describe("normalizeEntityTab", () => {
  it("routes كوش to map (place) even when category is 'name'", () => {
    expect(
      normalizeEntityTab("name", "كوش", "أرض في جنوب مصر، أحد أبناء حام، صارت اسماً لشعب وبلاد"),
    ).toBe("map");
    expect(isPlaceEntity("name", "كوش", "أرض جنوب مصر")).toBe(true);
  });

  it("routes أشور to map when description mentions kingdom/nation/land", () => {
    expect(
      normalizeEntityTab("name", "أشور", "مملكة وبلاد في شمال بين النهرين، أمة عظيمة"),
    ).toBe("map");
    expect(isPlaceEntity("name", "أشور", "مملكة في الشمال")).toBe(true);
  });

  it("keeps an actual person under people", () => {
    expect(normalizeEntityTab("نبي", "موسى", "نبي الله ومحرر بني إسرائيل")).toBe("people");
    expect(isPersonEntity("نبي", "موسى", "نبي الله")).toBe(true);
  });

  it("does not override a person whose description mentions a land", () => {
    // إبراهيم's bio mentions land/region but he is explicitly a prophet/patriarch
    expect(
      normalizeEntityTab("بطريرك", "إبراهيم", "أبو الآباء، خرج من أرض كلدان إلى أرض كنعان"),
    ).toBe("people");
  });

  it("maps city / land categories to map", () => {
    expect(normalizeEntityTab("city")).toBe("map");
    expect(normalizeEntityTab("مدينة")).toBe("map");
    expect(normalizeEntityTab("nation")).toBe("map");
    expect(normalizeEntityTab("شعب")).toBe("map");
  });

  it("falls back to general for unknown categories (never people)", () => {
    expect(normalizeEntityTab(undefined, "كلمة", "تعبير لاهوتي")).toBe("general");
    expect(normalizeEntityTab("", "", "")).toBe("general");
    expect(normalizeEntityTab("unknown_category")).toBe("general");
  });
});
