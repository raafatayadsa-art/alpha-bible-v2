import { describe, it, expect } from "vitest";
import {
  rankAndDedupe,
  type LookupRow,
} from "@/lib/dictionary-search-ranking";

const row = (
  word: string,
  extra: Partial<LookupRow> = {},
): LookupRow => ({
  word,
  category: null,
  short_meaning_ar: null,
  arabic_content: null,
  ...extra,
});

describe("rankAndDedupe — exact → starts-with → contains → description", () => {
  it("orders 'موسى' results: exact first, then starts-with, then contains, then description", () => {
    const rows: LookupRow[] = [
      row("سفر موسى"), // contains       → bucket 2
      row("موسى بن عمران"), // starts-with → bucket 1
      row("هارون", { short_meaning_ar: "أخو موسى" }), // description → bucket 3
      row("موسى"), // exact          → bucket 0
      row("موسى النبي"), // starts-with → bucket 1
    ];

    const out = rankAndDedupe(rows, "موسى", { strict: false });

    const titles = out.map((r) => r.row.word);

    expect(titles[0]).toBe("موسى");
    // The two starts-with hits come next, shorter first.
    expect(titles[1]).toBe("موسى النبي");
    expect(titles[2]).toBe("موسى بن عمران");
    expect(titles[3]).toBe("سفر موسى");
    expect(titles[4]).toBe("هارون");

    // Bucket assignments are correct.
    expect(out[0].bucket).toBe(0);
    expect(out[1].bucket).toBe(1);
    expect(out[2].bucket).toBe(1);
    expect(out[3].bucket).toBe(2);
    expect(out[4].bucket).toBe(3);
  });

  it("orders 'موسى بن عمران' results: exact first, then starts-with, then contains", () => {
    const rows: LookupRow[] = [
      row("سفر موسى بن عمران"), // contains
      row("موسى بن عمران النبي"), // starts-with
      row("موسى بن عمران"), // exact
      row("هارون", { short_meaning_ar: "ذكر موسى بن عمران" }), // description
    ];

    const out = rankAndDedupe(rows, "موسى بن عمران", { strict: false });
    const titles = out.map((r) => r.row.word);

    expect(titles[0]).toBe("موسى بن عمران");
    expect(titles[1]).toBe("موسى بن عمران النبي");
    expect(titles[2]).toBe("سفر موسى بن عمران");
    expect(titles[3]).toBe("هارون");

    expect(out[0].bucket).toBe(0);
    expect(out[1].bucket).toBe(1);
    expect(out[2].bucket).toBe(2);
    expect(out[3].bucket).toBe(3);
  });

  it("dedupes identical titles, keeping the best bucket", () => {
    const rows: LookupRow[] = [
      row("موسى", { short_meaning_ar: "alt entry" }),
      row("موسى"),
    ];
    const out = rankAndDedupe(rows, "موسى");
    expect(out).toHaveLength(1);
    expect(out[0].bucket).toBe(0);
  });

  it("drops description-only hits when no precise title hit exists is false (kept) — and drops fuzzy when precise exists", () => {
    // With a precise hit present, fuzzy noise must not appear.
    const rows: LookupRow[] = [
      row("موسى"), // bucket 0
      row("ميشا"), // bucket 4 fuzzy candidate
    ];
    const out = rankAndDedupe(rows, "موسى");
    expect(out.map((r) => r.row.word)).toEqual(["موسى"]);
  });
});
