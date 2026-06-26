import { useMemo, useState } from "react";
import { CheckCircle2, Clock, Loader2, Shield, XCircle } from "lucide-react";
import { useApprovalsCenter } from "./approvals-store";
import {
  RefFilterTab,
  RefListCard,
  RefSearchRow,
  RefStatCard,
} from "./approvals-reference-ui";
import { MissionControlShell, MissionHeader } from "./mission-control-ui";
import type { ApprovalItem } from "./types";
import { kindMatchesFilter, normalizeApprovalStatus } from "./types";
import { MC } from "./platform-store";

type ListFilter = "all" | "churches" | "priests" | "servants" | "saints" | "reports" | "publishers";

const FILTERS: { key: ListFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "churches", label: "Churches" },
  { key: "publishers", label: "Publishers" },
  { key: "priests", label: "Priests" },
  { key: "servants", label: "Servants" },
  { key: "saints", label: "Saint Images" },
  { key: "reports", label: "Reports" },
];

function categoryCount(items: ApprovalItem[], key: ListFilter): number {
  if (key === "all") return items.length;
  return items.filter((i) => kindMatchesFilter(i.kind, key)).length;
}

function matchesSearch(item: ApprovalItem, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  return [
    item.title,
    item.churchName,
    item.priestName,
    item.requestNo,
    item.saintName,
    item.submittedBy,
    item.diocese,
    item.verificationTarget,
  ]
    .filter(Boolean)
    .some((v) => v!.toLowerCase().includes(s));
}

export function ApprovalsCenterScreen() {
  const { items, dashboardCounts, loading, loadError, reload } = useApprovalsCenter();
  const [filter, setFilter] = useState<ListFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"latest" | "oldest">("latest");

  const filtered = useMemo(() => {
    const list = items
      .filter((i) => kindMatchesFilter(i.kind, filter) && matchesSearch(i, search))
      .sort((a, b) => {
        const pa = normalizeApprovalStatus(a.status) === "pending" ? 0 : 1;
        const pb = normalizeApprovalStatus(b.status) === "pending" ? 0 : 1;
        if (pa !== pb) return pa - pb;
        return sort === "latest" ? b.submittedAt - a.submittedAt : a.submittedAt - b.submittedAt;
      });
    return list;
  }, [items, filter, search, sort]);

  return (
    <MissionControlShell toolbarActive="approvals" toolbarBadges={{ approvals: dashboardCounts.pending }}>
      <MissionHeader />

      <div className="mb-3 text-right">
        <h2 className="text-[16px] font-extrabold" style={{ color: MC.white }}>
          Approvals Center
        </h2>
        <p className="text-[10px] font-semibold" style={{ color: MC.muted }}>
          إدارة ومراجعة طلبات الاعتماد
        </p>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-1.5">
        <RefStatCard label="Pending" value={dashboardCounts.pending} color={MC.purple} icon={Clock} />
        <RefStatCard label="Under Review" value={dashboardCounts.underReview} color={MC.gold} icon={Shield} />
        <RefStatCard label="Approved Today" value={dashboardCounts.approvedToday} color={MC.green} icon={CheckCircle2} />
        <RefStatCard label="Rejected Today" value={dashboardCounts.rejectedToday} color={MC.red} icon={XCircle} />
      </div>

      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map((f) => (
          <RefFilterTab
            key={f.key}
            label={f.label}
            count={categoryCount(items, f.key)}
            active={filter === f.key}
            onClick={() => setFilter(f.key)}
          />
        ))}
      </div>

      <RefSearchRow search={search} onSearch={setSearch} sort={sort} onSort={setSort} />

      {loading ? (
        <div className="flex flex-col items-center py-16">
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: MC.purple }} />
          <p className="mt-2 text-[11px] font-bold" style={{ color: MC.muted }}>
            جاري تحميل الطلبات…
          </p>
        </div>
      ) : loadError ? (
        <div className="rounded-[16px] border py-8 text-center" style={{ borderColor: MC.panelBorder, background: MC.panel }}>
          <p className="text-[12px] font-bold" style={{ color: MC.red }}>
            {loadError}
          </p>
          <button type="button" onClick={() => void reload()} className="mt-3 text-[11px] font-bold" style={{ color: MC.purple }}>
            إعادة المحاولة
          </button>
        </div>
      ) : (
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-[16px] border py-8 text-center" style={{ borderColor: MC.panelBorder, background: MC.panel }}>
            <p className="text-[12px] font-bold" style={{ color: MC.muted }}>
              No requests found
            </p>
          </div>
        ) : (
          filtered.map((item) => <RefListCard key={item.id} item={item} />)
        )}
      </div>
      )}
    </MissionControlShell>
  );
}
