import { useEffect, useMemo, useState } from "react";
import annualReadingsJson from "../../katameros-data/katameros-preparation/data/annual-readings.json";
import sundayReadingsJson from "../../katameros-data/katameros-preparation/data/sunday-readings.json";
import greatLentReadingsJson from "../../katameros-data/katameros-preparation/data/great-lent-readings.json";
import pentecostReadingsJson from "../../katameros-data/katameros-preparation/data/pentecost-readings.json";
import specialReadingsJson from "../../katameros-data/katameros-preparation/data/special-readings.json";
import {
  KatamerosResolveError,
  katamerosBookIdToAlphaName,
  resolveKatamerosReference,
} from "@/lib/katameros-references";

type ReadingRecord = Record<string, unknown>;

type TestSample = {
  category: string;
  date: string;
  season: string;
  record: ReadingRecord;
};

type ValidationFailureDetail = {
  expectedBook: string;
  actualResolvedBook: string;
  failedPart: string;
  errorReason: string;
};

type ValidationRow = {
  id: string;
  date: string;
  season: string;
  readingType: string;
  reference: string;
  status: "success" | "failed";
  error?: string;
  failure?: ValidationFailureDetail;
};

const REF_FIELDS = [
  "V_Psalm_Ref",
  "V_Gospel_Ref",
  "M_Psalm_Ref",
  "M_Gospel_Ref",
  "P_Gospel_Ref",
  "C_Gospel_Ref",
  "X_Gospel_Ref",
  "L_Psalm_Ref",
  "L_Gospel_Ref",
  "Prophecy",
] as const;

function asRecords(data: unknown): ReadingRecord[] {
  return Array.isArray(data) ? (data as ReadingRecord[]) : [];
}

function formatDate(record: ReadingRecord): string {
  if (record.Month_Name != null && record.Day != null) {
    return `${record.Month_Name} ${record.Day}`;
  }
  if (record.DayName) return String(record.DayName);
  if (record.Week != null && record.DayOfWeek != null) {
    return `Week ${record.Week}, Day ${record.DayOfWeek}`;
  }
  return "—";
}

function formatSeason(record: ReadingRecord, category: string): string {
  if (record.Season) return String(record.Season);
  if (category === "Great Lent") return String(record.Seasonal_Tune ?? "Great Lent").trim();
  return category;
}

function buildTestSamples(
  annual: ReadingRecord[],
  sundays: ReadingRecord[],
  lent: ReadingRecord[],
  pentecost: ReadingRecord[],
  special: ReadingRecord[],
): TestSample[] {
  const ordinary = annual.filter((r) => !String(r.DayName ?? "").trim());

  const picks: { category: string; record: ReadingRecord }[] = [
    { category: "Ordinary", record: ordinary[5] },
    { category: "Ordinary", record: ordinary[40] },
    { category: "Sunday", record: sundays[0] },
    { category: "Sunday", record: sundays[12] },
    { category: "Great Lent", record: lent[0] },
    { category: "Great Lent", record: lent[25] },
    { category: "Pentecost", record: pentecost[0] },
    { category: "Pentecost", record: pentecost[35] },
    { category: "Special feast", record: special[0] },
    { category: "Special feast", record: special[4] },
  ];

  return picks
    .filter((p) => p.record)
    .map((p) => ({
      category: p.category,
      date: formatDate(p.record),
      season: formatSeason(p.record, p.category),
      record: p.record,
    }));
}

function readingTypeLabel(field: string): string {
  return field.replace(/_Ref$/, "").replace(/_/g, " ");
}

function formatBookLabel(bookId: number): string {
  const alphaName = katamerosBookIdToAlphaName(bookId);
  return alphaName ? `${bookId} (${alphaName})` : String(bookId);
}

async function validateReference(ref: string): Promise<ValidationFailureDetail | null> {
  const trimmed = ref.trim();
  if (!trimmed) {
    throw new Error("Empty reference");
  }

  try {
    await resolveKatamerosReference(trimmed);
    return null;
  } catch (err) {
    if (err instanceof KatamerosResolveError) {
      const bookLabel = err.bookId != null ? formatBookLabel(err.bookId) : "—";
      return {
        expectedBook: bookLabel,
        actualResolvedBook: err.alphaBookName ?? bookLabel,
        failedPart: trimmed,
        errorReason: `${err.code}: ${err.message}`,
      };
    }
    throw err;
  }
}

async function validateSample(sample: TestSample, index: number): Promise<ValidationRow[]> {
  const rows: ValidationRow[] = [];

  for (const field of REF_FIELDS) {
    const raw = sample.record[field];
    const reference = raw == null ? "" : String(raw).trim();
    if (!reference) continue;

    const row: ValidationRow = {
      id: `${index}-${field}`,
      date: sample.date,
      season: sample.season,
      readingType: readingTypeLabel(field),
      reference,
      status: "success",
    };

    try {
      const failure = await validateReference(reference);
      if (failure) {
        row.status = "failed";
        row.failure = failure;
        row.error = failure.errorReason;
      }
    } catch (err) {
      row.status = "failed";
      row.error = err instanceof Error ? err.message : String(err);
      row.failure = {
        expectedBook: "—",
        actualResolvedBook: "—",
        failedPart: reference,
        errorReason: row.error,
      };
    }

    rows.push(row);
  }

  return rows;
}

async function runValidation(samples: TestSample[]): Promise<ValidationRow[]> {
  const allRows: ValidationRow[] = [];
  for (let i = 0; i < samples.length; i++) {
    const rows = await validateSample(samples[i], i);
    allRows.push(...rows);
  }
  return allRows;
}

export default function KatamerosTest() {
  const samples = useMemo(
    () =>
      buildTestSamples(
        asRecords(annualReadingsJson),
        asRecords(sundayReadingsJson),
        asRecords(greatLentReadingsJson),
        asRecords(pentecostReadingsJson),
        asRecords(specialReadingsJson),
      ),
    [],
  );

  const [rows, setRows] = useState<ValidationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await runValidation(samples);
        if (!cancelled) setRows(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [samples]);

  const passed = rows.filter((r) => r.status === "success").length;
  const failed = rows.filter((r) => r.status === "failed").length;
  const failedRows = rows.filter((r) => r.status === "failed");

  return (
    <main className="min-h-screen bg-[#111] px-4 py-8 text-[#eee]">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-1 border-b border-[#333] pb-4">
          <p className="text-xs uppercase tracking-wide text-[#888]">Temporary test page</p>
          <h1 className="text-xl font-bold">Katameros Validation</h1>
          <p className="text-sm text-[#aaa]">
            /katameros-test — validates Katameros references against Alpha Bible (Supabase only)
          </p>
        </header>

        <section className="rounded border border-[#333] p-4">
          <h2 className="mb-3 text-sm font-semibold text-[#ccc]">Sample dates</h2>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {samples.map((s) => (
              <li key={`${s.category}-${s.date}`} className="rounded bg-[#1a1a1a] px-3 py-2">
                <span className="text-[#9fd4ff]">{s.category}</span>
                <span className="text-[#666]"> · </span>
                <span>{s.date}</span>
                <span className="mt-1 block text-xs text-[#888]">{s.season}</span>
              </li>
            ))}
          </ul>
        </section>

        {loading && <p className="text-sm text-[#aaa]">Running validation…</p>}

        {error && (
          <div className="rounded border border-red-800 bg-red-950/40 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {!loading && rows.length > 0 && (
          <section className="space-y-4 rounded border border-[#333] p-4">
            <h2 className="text-sm font-semibold text-[#ccc]">Validation report</h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#444] text-[#aaa]">
                    <th className="px-2 py-2 font-medium">Date</th>
                    <th className="px-2 py-2 font-medium">Season</th>
                    <th className="px-2 py-2 font-medium">Reading Type</th>
                    <th className="px-2 py-2 font-medium">Reference</th>
                    <th className="px-2 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-[#2a2a2a] last:border-b-0">
                      <td className="px-2 py-2 align-top">{row.date}</td>
                      <td className="px-2 py-2 align-top text-[#bbb]">{row.season}</td>
                      <td className="px-2 py-2 align-top">{row.readingType}</td>
                      <td dir="ltr" className="px-2 py-2 align-top font-mono text-xs text-[#9fd4ff]">
                        {row.reference}
                      </td>
                      <td
                        className="px-2 py-2 align-top whitespace-nowrap"
                        title={row.error}
                      >
                        {row.status === "success" ? (
                          <span className="text-green-400">✅ Success</span>
                        ) : (
                          <span className="text-red-400">❌ Failed</span>
                        )}
                        {row.error && (
                          <p className="mt-1 max-w-xs text-xs text-red-300/80">{row.error}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-[#333] pt-4 text-sm">
              <div className="rounded bg-[#1a1a1a] px-3 py-2">
                <p className="text-[#888]">Total tests</p>
                <p className="text-lg font-semibold">{rows.length}</p>
              </div>
              <div className="rounded bg-[#0d1a0d] px-3 py-2">
                <p className="text-[#888]">Passed</p>
                <p className="text-lg font-semibold text-green-400">{passed}</p>
              </div>
              <div className="rounded bg-[#1a0d0d] px-3 py-2">
                <p className="text-[#888]">Failed</p>
                <p className="text-lg font-semibold text-red-400">{failed}</p>
              </div>
            </div>
          </section>
        )}

        {!loading && failedRows.length > 0 && (
          <section className="space-y-4 rounded border border-red-900/60 bg-red-950/20 p-4">
            <h2 className="text-sm font-semibold text-red-200">
              Failed references ({failedRows.length})
            </h2>
            <ul className="space-y-2 text-sm">
              {failedRows.map((row) => (
                <li key={row.id} className="rounded bg-[#1a0d0d] px-3 py-2">
                  <span className="text-[#9fd4ff]">{row.readingType}</span>
                  <span className="text-[#666]"> · </span>
                  <span>{row.date}</span>
                  <p dir="ltr" className="mt-1 font-mono text-xs text-[#ccc]">
                    {row.reference}
                  </p>
                  <p className="mt-1 text-red-200">{row.error}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
