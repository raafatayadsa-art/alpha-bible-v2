import { useState } from "react";
import {
  BookOpen,
  Church,
  Cross,
  Globe,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { ChurchDirectoryFullDetails } from "../types";
import { CHURCH_DIR } from "../tokens";
import { JoinChurchButton } from "@/features/church/JoinChurchButton";
import {
  ClaimChurchButton,
  ChurchCommunityHubLink,
  type ChurchPageStatus,
} from "@/features/church-page";
import { ChurchPublisherPageLink } from "@/features/publisher/components/ChurchPublisherPageLink";

type TabId = "about" | "location" | "links";

const TABS: { id: TabId; label: string; icon: typeof Church }[] = [
  { id: "about", label: "عن الكنيسة", icon: Church },
  { id: "location", label: "الموقع", icon: MapPin },
  { id: "links", label: "تواصل", icon: Globe },
];

type Props = {
  church: ChurchDirectoryFullDetails;
  pageStatus: ChurchPageStatus;
  isMember: boolean;
  onStatusChange: (status: ChurchPageStatus) => void;
};

export function ChurchDirectoryInfoTabs({
  church,
  pageStatus,
  isMember,
  onStatusChange,
}: Props) {
  const [tab, setTab] = useState<TabId>("about");
  const hasLinks =
    !!(church.email || church.websiteUrl || church.facebookUrl || church.youtubeUrl || church.churchUrl);

  return (
    <section
      className="overflow-hidden rounded-[24px] border backdrop-blur-xl"
      style={{
        borderColor: CHURCH_DIR.border,
        background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,242,237,0.88))",
      }}
    >
      <div
        className="flex gap-1 border-b p-1.5"
        style={{ borderColor: CHURCH_DIR.border, background: CHURCH_DIR.beige }}
        role="tablist"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          if (t.id === "links" && !hasLinks) return null;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={
                "flex flex-1 items-center justify-center gap-1 rounded-2xl py-2.5 text-[11px] font-extrabold transition-all active:scale-[0.98] " +
                (active ? "text-white shadow-md" : "")
              }
              style={
                active
                  ? { background: `linear-gradient(160deg, #7b4cb8, ${CHURCH_DIR.purple})` }
                  : { color: CHURCH_DIR.sub }
              }
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="p-4" role="tabpanel">
        {tab === "about" ? (
          <div className="space-y-3">
            {(church.priestsFull || church.priestName) ? (
              <InfoRow label="الكاهن" value={church.priestsFull ?? church.priestName ?? ""} multiline />
            ) : null}
            {church.patronSaint ? <InfoRow label="القديس الشفيع" value={church.patronSaint} /> : null}
            {church.patronFeasts ? <InfoRow label="الأعياد" value={church.patronFeasts} multiline /> : null}
            {church.description ? (
              <div
                className="rounded-2xl border px-3 py-2.5 text-right"
                style={{ borderColor: CHURCH_DIR.border, background: "rgba(255,255,255,0.65)" }}
              >
                <p className="text-[10px] font-bold" style={{ color: CHURCH_DIR.sub }}>
                  <Sparkles className="inline h-3 w-3 ml-1" />
                  نبذة
                </p>
                <p
                  className="mt-1 text-[13px] font-bold leading-relaxed whitespace-pre-line"
                  style={{ color: CHURCH_DIR.text }}
                >
                  {church.description}
                </p>
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <StatMini icon={Users} label="أعضاء" value={church.memberCount.toLocaleString("ar-EG")} />
              <StatMini icon={BookOpen} label="خدام" value={church.servantCount.toLocaleString("ar-EG")} />
            </div>
          </div>
        ) : null}

        {tab === "location" ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Chip label="الإيبارشية" value={church.diocese} />
              <Chip label="المحافظة" value={church.governorate} />
              <Chip label="المدينة" value={church.city} />
              <Chip label="الدولة" value={church.country ?? "مصر"} />
            </div>
            {church.address ? <InfoRow label="العنوان" value={church.address} multiline /> : null}
            {church.lat != null && church.lng != null ? (
              <p className="text-[10.5px] font-bold text-right" style={{ color: CHURCH_DIR.sub }}>
                {church.lat.toFixed(5)}, {church.lng.toFixed(5)}
              </p>
            ) : null}
          </div>
        ) : null}

        {tab === "links" && hasLinks ? (
          <div className="space-y-0">
            {church.email ? <LinkRow href={`mailto:${church.email}`} label="البريد" value={church.email} /> : null}
            {church.websiteUrl ? <LinkRow href={church.websiteUrl} label="الموقع" value="فتح الموقع" external /> : null}
            {church.churchUrl ? <LinkRow href={church.churchUrl} label="مرجع" value="st-takla.org" external /> : null}
            {church.facebookUrl ? <LinkRow href={church.facebookUrl} label="فيسبوك" value="Facebook" external /> : null}
            {church.youtubeUrl ? <LinkRow href={church.youtubeUrl} label="يوتيوب" value="YouTube" external /> : null}
          </div>
        ) : null}
      </div>

      <div
        className="space-y-3 border-t p-4"
        style={{ borderColor: CHURCH_DIR.border }}
      >
        <ChurchCommunityHubLink pageStatus={pageStatus} isMember={isMember} />
        <ChurchPublisherPageLink churchId={church.id} />
        <div
          className="rounded-[20px] border p-3"
          style={{ borderColor: CHURCH_DIR.border, background: CHURCH_DIR.glass }}
        >
          <p className="mb-2 text-right text-[11px] font-extrabold" style={{ color: CHURCH_DIR.text }}>
            <Cross className="inline h-3.5 w-3.5 ml-1" />
            الانضمام للكنيسة
          </p>
          <JoinChurchButton churchId={church.id} churchName={church.name} />
        </div>
        <div
          className="rounded-[20px] border p-3"
          style={{ borderColor: CHURCH_DIR.border, background: CHURCH_DIR.glass }}
        >
          <p className="mb-2 text-right text-[11px] font-extrabold" style={{ color: CHURCH_DIR.text }}>
            <ShieldCheck className="inline h-3.5 w-3.5 ml-1" />
            إدارة الصفحة
          </p>
          <ClaimChurchButton
            churchId={church.id}
            churchName={church.name}
            pageStatus={pageStatus}
            onStatusChange={onStatusChange}
          />
        </div>
      </div>
    </section>
  );
}

function Chip({ label, value }: { label: string; value: string | null }) {
  return (
    <div
      className="rounded-2xl border px-2 py-2 text-center"
      style={{ borderColor: CHURCH_DIR.border, background: "rgba(255,255,255,0.7)" }}
    >
      <p className="text-[9px] font-bold" style={{ color: CHURCH_DIR.sub }}>{label}</p>
      <p className="mt-1 text-[11px] font-extrabold line-clamp-2" style={{ color: CHURCH_DIR.text }}>
        {value ?? "—"}
      </p>
    </div>
  );
}

function InfoRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div
      className="rounded-2xl border px-3 py-2.5 text-right"
      style={{ borderColor: CHURCH_DIR.border, background: "rgba(255,255,255,0.65)" }}
    >
      <p className="text-[10px] font-bold" style={{ color: CHURCH_DIR.sub }}>{label}</p>
      <p
        className={`mt-1 text-[13px] font-extrabold ${multiline ? "leading-relaxed whitespace-pre-line" : ""}`}
        style={{ color: CHURCH_DIR.text }}
      >
        {value}
      </p>
    </div>
  );
}

function StatMini({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div
      className="rounded-2xl border px-3 py-2 text-center"
      style={{ borderColor: CHURCH_DIR.border, background: "rgba(255,255,255,0.7)" }}
    >
      <Icon className="mx-auto h-4 w-4" style={{ color: CHURCH_DIR.purple }} strokeWidth={2.2} />
      <p className="mt-1 text-[16px] font-extrabold" style={{ color: CHURCH_DIR.text }}>{value}</p>
      <p className="text-[10px] font-bold" style={{ color: CHURCH_DIR.sub }}>{label}</p>
    </div>
  );
}

function LinkRow({
  href,
  label,
  value,
  external,
}: {
  href: string;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="mb-2 flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 last:mb-0"
      style={{ borderColor: CHURCH_DIR.border, background: "rgba(255,255,255,0.72)" }}
    >
      <span className="text-[12px] font-extrabold truncate" style={{ color: CHURCH_DIR.text }}>{value}</span>
      <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold" style={{ color: CHURCH_DIR.sub }}>
        {label}
        <Globe className="h-4 w-4" style={{ color: CHURCH_DIR.purple }} strokeWidth={2.2} />
      </span>
    </a>
  );
}
