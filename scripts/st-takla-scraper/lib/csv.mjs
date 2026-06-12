export function toCsv(rows, columns) {
  const escape = (value) => {
    if (value == null) return "";
    const s = typeof value === "object" ? JSON.stringify(value) : String(value);
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const header = columns.join(",");
  const lines = rows.map((row) => columns.map((c) => escape(row[c])).join(","));
  return [header, ...lines].join("\n");
}

export const SYNAXARIUM_DAY_COLUMNS = [
  "id",
  "coptic_year",
  "coptic_month",
  "coptic_day",
  "heading_ar",
  "intro_ar",
  "church_reading_suppressed",
  "church_reading_note_ar",
  "source_url_ar",
  "saint_count",
];

export const SYNAXARIUM_SAINT_COLUMNS = [
  "id",
  "day_id",
  "display_order",
  "slug",
  "name_ar",
  "title_ar",
  "occasion_type",
  "occasion_type_ar",
  "summary_ar",
  "bio_ar",
  "closing_ar",
  "coptic_date_label_ar",
  "source_url_ar",
  "source_kind",
];

export const KATAMAROS_DAY_COLUMNS = [
  "id",
  "coptic_year",
  "coptic_month",
  "coptic_day",
  "coptic_date_label_ar",
  "gregorian_date_label_ar",
  "liturgical_day_ar",
  "occasion_ar",
  "season",
  "source_url",
  "reading_count",
];

export const KATAMAROS_READING_COLUMNS = [
  "day_id",
  "reading_key",
  "reading_type",
  "title_ar",
  "reference_ar",
  "source_ar",
  "display_order",
  "season",
  "body_ar",
  "estimated_min",
];
