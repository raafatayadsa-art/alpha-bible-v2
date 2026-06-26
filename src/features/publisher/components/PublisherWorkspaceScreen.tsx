import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { Link } from "@tanstack/react-router";

import {

  Eye,

  FileEdit,

  Headphones,

  LayoutGrid,

  Layers,

  LoaderCircle,

  Pencil,

  Plus,

  QrCode,

  Send,

  Settings2,

  ShieldCheck,

  Sparkles,

  Users,

  type LucideIcon,

} from "lucide-react";

import {

  buildReadinessChecks,

  canManagePublisherContent,

  canManagePublisherProfile,

  canSubmitForPublication,

  computeReadinessScore,

  PUBLISHER_CONTENT_KIND_LABELS,

  PUBLISHER_CONTENT_STATUS_LABELS,

  PUBLISHER_STATUS_LABELS,

  PUBLISHER_TYPE_LABELS,

  type PublisherContentItem,

  type PublisherContentKind,

  type PublisherRecord,

  type PublisherTeamPermissions,

} from "../types";

import {

  fetchPublisherById,

  fetchPublisherContent,

  submitPublisherForPublication,

} from "../publisher-api";

import { fetchPublisherAccess } from "../publisher-team-api";

import { pickHeroSlides } from "../publisher-public-content";
import { publisherContentDateLabel } from "../publisher-content-ui";

import { PublisherDraftBanner } from "./PublisherDraftBanner";

import { PublisherReadinessCard } from "./PublisherReadinessCard";

import { PublisherTeamPanel } from "./PublisherTeamPanel";

import { PublisherTeamSheet } from "./PublisherTeamSheet";

import { PublisherQrSheet } from "./PublisherQrSheet";

import { PublisherAddContentSheet, type AddContentChoice } from "./PublisherAddContentSheet";

import { PublisherContentWizard } from "./PublisherContentWizard";

import { PublisherAlbumWizard } from "./PublisherAlbumWizard";

import { PublisherProfileSheet } from "./PublisherProfileSheet";

import { PublisherHeroSheet } from "./PublisherHeroSheet";

import cardChurch from "@/assets/home/card-church.jpg";



type Props = {

  publisherId: string;

};



type WorkspaceTab = "overview" | "content" | "page";

type PageSubTab = "profile" | "team";



const CHOICE_TO_KIND: Partial<Record<AddContentChoice, PublisherContentKind>> = {

  album: "album",

  hymn: "hymn",

  video: "video",

  book: "book",

  other: "article",

};



const MAIN_TABS: { id: WorkspaceTab; label: string; icon: LucideIcon }[] = [

  { id: "overview", label: "نظرة عامة", icon: LayoutGrid },

  { id: "content", label: "المحتوى", icon: Layers },

  { id: "page", label: "الصفحة", icon: Settings2 },

];



const PAGE_SUB_TABS: { id: PageSubTab; label: string; icon: LucideIcon }[] = [

  { id: "profile", label: "بيانات الصفحة", icon: Settings2 },

  { id: "team", label: "فريق المساعدين", icon: Users },

];



function statusBadgeClass(status: PublisherContentItem["status"]): string {

  switch (status) {

    case "approved":

      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "rejected":

    case "needs_changes":

      return "bg-red-50 text-red-700 border-red-200";

    case "pending_review":

      return "bg-amber-50 text-amber-800 border-amber-200";

    default:

      return "bg-[#5D3291]/8 text-[#5D3291] border-[#5D3291]/15";

  }

}



export function PublisherWorkspaceScreen({ publisherId }: Props) {

  const [publisher, setPublisher] = useState<PublisherRecord | null>(null);

  const [access, setAccess] = useState<PublisherTeamPermissions | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [feedback, setFeedback] = useState<string | null>(null);

  const [content, setContent] = useState<Awaited<ReturnType<typeof fetchPublisherContent>>>([]);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");

  const [pageSubTab, setPageSubTab] = useState<PageSubTab>("profile");

  const [teamRefreshKey, setTeamRefreshKey] = useState(0);

  const [qrOpen, setQrOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const [heroOpen, setHeroOpen] = useState(false);

  const [teamOpen, setTeamOpen] = useState(false);

  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const [wizardOpen, setWizardOpen] = useState(false);

  const [albumWizardOpen, setAlbumWizardOpen] = useState(false);

  const [wizardKind, setWizardKind] = useState<PublisherContentKind>("album");

  const [editItem, setEditItem] = useState<PublisherContentItem | null>(null);



  const reload = useCallback(async () => {

    const [pub, items, accessRow] = await Promise.all([

      fetchPublisherById(publisherId),

      fetchPublisherContent(publisherId),

      fetchPublisherAccess(publisherId),

    ]);

    setPublisher(pub);

    setContent(items);

    setAccess(accessRow);

  }, [publisherId]);



  useEffect(() => {

    let cancelled = false;

    setLoading(true);

    void reload().finally(() => {

      if (!cancelled) setLoading(false);

    });

    return () => {

      cancelled = true;

    };

  }, [reload]);



  const handleWizardSuccess = (message: string) => {

    setWizardOpen(false);

    setEditItem(null);

    setAddSheetOpen(false);

    setFeedback(message);

    void reload();

  };



  const hasQualifyingContent = useMemo(

    () => content.some((c) => ["album", "book", "hymn", "lecture", "playlist"].includes(c.contentKind)),

    [content],

  );



  const readinessChecks = useMemo(

    () => (publisher ? buildReadinessChecks(publisher, hasQualifyingContent) : []),

    [publisher, hasQualifyingContent],

  );



  const readinessScore = publisher?.readinessScore ?? computeReadinessScore(readinessChecks);



  const heroSlides = useMemo(

    () => (publisher ? pickHeroSlides(content, publisher) : []),

    [content, publisher],

  );



  const configuredHeroCount = publisher?.heroContentIds?.length ?? 0;



  const sendForPublication = async () => {

    setSaving(true);

    const result = await submitPublisherForPublication(publisherId);

    setSaving(false);

    if (result.ok) {

      setFeedback("تم إرسال الصفحة للمراجعة النهائية.");

      await reload();

    } else {

      setFeedback(result.message ?? "تعذّر الإرسال.");

    }

  };



  const openWizard = (kind: PublisherContentKind, item?: PublisherContentItem | null) => {

    setAddSheetOpen(false);

    if (kind === "album" && !item) {

      setAlbumWizardOpen(true);

      return;

    }

    setWizardKind(kind);

    setEditItem(item ?? null);

    setWizardOpen(true);

  };



  const selectPageSubTab = (sub: PageSubTab) => {

    setActiveTab("page");

    setPageSubTab(sub);

  };



  if (loading) {

    return (

      <div className="flex flex-col items-center py-20">

        <LoaderCircle className="h-8 w-8 animate-spin text-[#5D3291]" />

      </div>

    );

  }



  if (!publisher || !access) {

    return (

      <p className="py-16 text-center text-[13px] font-extrabold text-[#3a3258]">

        لم نجد مساحة الناشر أو لا تملك صلاحية الدخول.

      </p>

    );

  }



  const canEditProfile = canManagePublisherProfile(publisher.status, access);

  const canManageContent = canManagePublisherContent(publisher.status, access);

  const canSubmitPub = access.canSubmitPublication;

  const canManageTeam = access.canManageTeam && publisher.status !== "suspended";

  const logo = publisher.logoUrl?.trim() || publisher.coverUrl?.trim() || cardChurch;



  const visiblePageSubTabs = PAGE_SUB_TABS.filter((tab) => {

    if (tab.id === "profile") return canEditProfile;

    if (tab.id === "team") return canManageTeam;

    return false;

  });



  return (

    <div className="space-y-4 pb-4">

      <PublisherDraftBanner status={publisher.status} />



      {access.role === "assistant" ? (

        <p className="rounded-2xl border border-[#5D3291]/20 bg-[#5D3291]/5 px-3 py-2 text-center text-[10px] font-bold text-[#5D3291]">

          أنت مساعد على هذه الصفحة — الصلاحيات حسب ما حدّده المالك.

        </p>

      ) : null}



      <section

        className="overflow-hidden rounded-[24px] border border-[rgba(93,50,145,0.14)] shadow-[0_16px_40px_-20px_rgba(93,50,145,0.35)]"

        style={{ background: "linear-gradient(145deg, #fff 0%, #f3ebff 55%, #ebe2f8 100%)" }}

      >

        <div className="flex items-center gap-3 p-4">

          <div className="relative shrink-0">

            <div className="h-[76px] w-[76px] overflow-hidden rounded-2xl ring-2 ring-[var(--gold)]/35 shadow-lg">

              <img src={logo} alt="" className="h-full w-full object-cover" />

            </div>

            {publisher.isTrusted ? (

              <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full bg-[#5D3291] text-white ring-2 ring-white">

                <ShieldCheck className="h-3.5 w-3.5" />

              </span>

            ) : null}

          </div>

          <div className="min-w-0 flex-1 text-right">

            <p className="text-[10px] font-bold text-[#8a84a8]">{PUBLISHER_TYPE_LABELS[publisher.publisherType]}</p>

            <p className="truncate text-[16px] font-extrabold text-[#3a3258]">{publisher.name}</p>

            <p className="mt-0.5 text-[10px] font-extrabold text-[#5D3291]">

              {PUBLISHER_STATUS_LABELS[publisher.status]}

            </p>

          </div>

        </div>

        <div className="grid grid-cols-4 gap-px bg-[rgba(93,50,145,0.08)] px-4 pb-4">

          <StatChip label="المحتوى" value={String(content.length)} />

          <StatChip label="الجاهزية" value={`${readinessScore}%`} />

          <StatChip label="المتابعون" value={String(publisher.followerCount)} />

          <StatChip label="كروت الهيرو" value={String(configuredHeroCount || heroSlides.length)} />

        </div>

      </section>



      <WorkspaceQuickActions

        publisherId={publisherId}

        published={publisher.status === "published"}

        canManageHero={canManageContent}

        onQr={() => setQrOpen(true)}

        onHero={() => setHeroOpen(true)}

      />



      <nav

        className="flex gap-1 rounded-2xl border border-[rgba(93,50,145,0.12)] bg-white/90 p-1"

        aria-label="أقسام مساحة الناشر"

      >

        {MAIN_TABS.map((tab) => (

          <TabButton

            key={tab.id}

            active={activeTab === tab.id}

            label={tab.label}

            icon={tab.icon}

            onClick={() => setActiveTab(tab.id)}

          />

        ))}

      </nav>



      {activeTab === "overview" ? (

        <OverviewPanel

          readinessScore={readinessScore}

          checks={readinessChecks}

          publisher={publisher}

          saving={saving}

          canSubmitPub={canSubmitPub}

          onPublish={() => void sendForPublication()}

        />

      ) : null}



      {activeTab === "content" ? (

        <ContentPanel

          content={content}

          canManageContent={canManageContent}

          onAdd={() => setAddSheetOpen(true)}

          onEdit={(item) => openWizard(item.contentKind, item)}

        />

      ) : null}



      {activeTab === "page" && visiblePageSubTabs.length ? (

        <section className="space-y-3">

          <div

            className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-[rgba(93,50,145,0.12)] bg-[#faf8fc] p-1"

            aria-label="إعدادات الصفحة"

          >

            {visiblePageSubTabs.map((tab) => (

              <TabButton

                key={tab.id}

                active={pageSubTab === tab.id}

                label={tab.label}

                icon={tab.icon}

                compact

                onClick={() => selectPageSubTab(tab.id)}

              />

            ))}

          </div>



          {pageSubTab === "profile" && canEditProfile ? (

            <PanelCard

              title="بيانات الصفحة"

              subtitle="الشعار، الغلاف، التواصل"

              action={

                <PanelEditButton label="تعديل" onClick={() => setProfileOpen(true)} />

              }

            >

              <ProfileSummaryPanel publisher={publisher} logo={logo} />

            </PanelCard>

          ) : null}

          {pageSubTab === "team" && canManageTeam ? (

            <PanelCard title="فريق المساعدين" subtitle="صلاحيات المساعدين على الصفحة">

              <PublisherTeamPanel

                publisherId={publisherId}

                refreshKey={teamRefreshKey}

                onAddClick={() => setTeamOpen(true)}

              />

            </PanelCard>

          ) : null}

        </section>

      ) : null}



      {activeTab === "page" && !visiblePageSubTabs.length ? (

        <PanelCard>

          <p className="py-6 text-center text-[11px] font-bold text-[#6b658a]">

            لا تملك صلاحية تعديل إعدادات الصفحة.

          </p>

        </PanelCard>

      ) : null}



      {feedback ? (

        <p className="rounded-xl bg-[#5D3291]/8 px-3 py-2 text-center text-[11px] font-bold text-[#5D3291]">{feedback}</p>

      ) : null}



      <PublisherQrSheet publisher={qrOpen ? publisher : null} onClose={() => setQrOpen(false)} />



      <PublisherProfileSheet

        open={profileOpen}

        publisher={publisher}

        onClose={() => setProfileOpen(false)}

        onSaved={(next) => {

          setPublisher(next);

          setFeedback("تم حفظ بيانات الصفحة.");

          void reload();

        }}

      />



      <PublisherHeroSheet

        open={heroOpen}

        publisher={publisher}

        content={content}

        onClose={() => setHeroOpen(false)}

        onSaved={(heroContentIds) => {

          setPublisher((prev) => (prev ? { ...prev, heroContentIds } : prev));

          setFeedback("تم حفظ كروت الهيرو.");

          void reload();

        }}

      />



      {canManageTeam ? (

        <PublisherTeamSheet

          open={teamOpen}

          publisherId={publisherId}

          onClose={() => setTeamOpen(false)}

          onAdded={(message) => {

            setFeedback(message);

            setTeamRefreshKey((k) => k + 1);

          }}

        />

      ) : null}



      <PublisherAddContentSheet

        open={addSheetOpen}

        onClose={() => setAddSheetOpen(false)}

        onSelect={(choice: AddContentChoice) => {

          if (choice === "album") {

            setAlbumWizardOpen(true);

            return;

          }

          const kind = CHOICE_TO_KIND[choice] ?? "article";

          openWizard(kind);

        }}

      />



      <PublisherContentWizard

        open={wizardOpen}

        publisherId={publisherId}

        kind={wizardKind}

        hymns={content}

        editItem={editItem}

        onClose={() => {

          setWizardOpen(false);

          setEditItem(null);

        }}

        onSuccess={handleWizardSuccess}

      />



      <PublisherAlbumWizard

        open={albumWizardOpen}

        publisherId={publisherId}

        onClose={() => setAlbumWizardOpen(false)}

        onSuccess={() => handleWizardSuccess("تم إرسال الألبوم للمراجعة")}

      />

    </div>

  );

}



function OverviewPanel({

  readinessScore,

  checks,

  publisher,

  saving,

  canSubmitPub,

  onPublish,

}: {

  readinessScore: number;

  checks: ReturnType<typeof buildReadinessChecks>;

  publisher: PublisherRecord;

  saving: boolean;

  canSubmitPub: boolean;

  onPublish: () => void;

}) {

  return (

    <div className="space-y-3">

      <PublisherReadinessCard score={readinessScore} checks={checks} />



      {canSubmitForPublication(publisher.status, readinessScore) && canSubmitPub ? (

        <button

          type="button"

          onClick={onPublish}

          disabled={saving}

          className="inline-flex w-full items-center justify-center gap-1 rounded-full py-3 text-[12px] font-extrabold text-white disabled:opacity-60"

          style={{ background: "linear-gradient(160deg, #7b4cb8, #5D3291)" }}

        >

          <Send className="h-4 w-4" />

          إرسال الصفحة للنشر

        </button>

      ) : null}

    </div>

  );

}



function ContentPanel({

  content,

  canManageContent,

  onAdd,

  onEdit,

}: {

  content: PublisherContentItem[];

  canManageContent: boolean;

  onAdd: () => void;

  onEdit: (item: PublisherContentItem) => void;

}) {

  return (

    <PanelCard

      title="محتواك"

      subtitle={`${content.length} عنصر`}

      action={

        canManageContent ? (

          <button

            type="button"

            onClick={onAdd}

            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[10px] font-extrabold text-white"

            style={{ background: "linear-gradient(160deg, #7b4cb8, #5D3291)" }}

          >

            <Plus className="h-3.5 w-3.5" />

            إضافة

          </button>

        ) : null

      }

    >

      <div className="space-y-2">

        {content.map((item) => (

          <div

            key={item.id}

            className="flex items-center gap-2 rounded-2xl border border-[rgba(93,50,145,0.1)] bg-[#faf8fc] px-3 py-2.5"

          >

            {canManageContent ? (

              <button

                type="button"

                onClick={() => onEdit(item)}

                className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-[#5D3291]/20 bg-white px-2 py-1.5 text-[9px] font-extrabold text-[#5D3291]"

              >

                <Pencil className="h-3 w-3" />

                تعديل

              </button>

            ) : null}

            <span

              className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${statusBadgeClass(item.status)}`}

            >

              {PUBLISHER_CONTENT_STATUS_LABELS[item.status]}

            </span>

            <div className="min-w-0 flex-1 text-right">

              <p className="truncate text-[12px] font-extrabold text-[#3a3258]">{item.title}</p>

              <p className="text-[10px] font-bold text-[#6b658a]">

                {PUBLISHER_CONTENT_KIND_LABELS[item.contentKind]}

                {item.mediaUrl ? " · ملف مرفوع" : ""}

              </p>

              <p className="mt-0.5 text-[9px] font-bold text-[#8a84a8]">{publisherContentDateLabel(item)}</p>

            </div>

          </div>

        ))}

        {!content.length ? (

          <div className="rounded-2xl border border-dashed border-[rgba(93,50,145,0.16)] px-4 py-10 text-center">

            <FileEdit className="mx-auto mb-2 h-8 w-8 text-[#5D3291]/40" />

            <p className="text-[11px] font-extrabold text-[#3a3258]">لا يوجد محتوى بعد</p>

            {canManageContent ? (

              <button type="button" onClick={onAdd} className="mt-2 text-[10px] font-extrabold text-[#5D3291]">

                ابدأ بإضافة أول ترنيمة أو ألبوم

              </button>

            ) : null}

          </div>

        ) : null}

      </div>

    </PanelCard>

  );

}



function WorkspaceQuickActions({

  publisherId,

  published,

  canManageHero,

  onQr,

  onHero,

}: {

  publisherId: string;

  published: boolean;

  canManageHero: boolean;

  onQr: () => void;

  onHero: () => void;

}) {

  return (

    <div className="grid grid-cols-2 gap-2">

      <Link

        to="/publisher/preview/$publisherId"

        params={{ publisherId }}

        className="inline-flex items-center justify-center gap-1 rounded-2xl border border-[rgba(93,50,145,0.18)] bg-white/95 py-2.5 text-[11px] font-extrabold text-[#5D3291] shadow-sm active:scale-[0.99]"

      >

        <Eye className="h-4 w-4" />

        معاينة الصفحة

      </Link>

      <button

        type="button"

        onClick={onQr}

        className="inline-flex items-center justify-center gap-1 rounded-2xl border border-[rgba(93,50,145,0.18)] bg-white/95 py-2.5 text-[11px] font-extrabold text-[#5D3291] shadow-sm active:scale-[0.99]"

      >

        <QrCode className="h-4 w-4" />

        باركود الصفحة

      </button>

      {canManageHero ? (

        <button

          type="button"

          onClick={onHero}

          className="col-span-2 inline-flex items-center justify-center gap-1 rounded-2xl border border-[var(--gold)]/35 bg-gradient-to-l from-[var(--gold)]/12 to-white py-2.5 text-[11px] font-extrabold text-[#5a4218] shadow-sm active:scale-[0.99]"

        >

          <Sparkles className="h-4 w-4 text-[var(--gold-deep)]" />

          كروت الهيرو — ترتيب واختيار الترانيم

        </button>

      ) : null}

      {published ? (

        <Link

          to="/publisher/$publisherId"

          params={{ publisherId }}

          className="col-span-2 inline-flex items-center justify-center gap-1 rounded-2xl border border-emerald-200 bg-emerald-50 py-2.5 text-[11px] font-extrabold text-emerald-800 active:scale-[0.99]"

        >

          <Headphones className="h-4 w-4" />

          الصفحة المنشورة

        </Link>

      ) : null}

    </div>

  );

}



function PanelEditButton({ label, onClick }: { label: string; onClick: () => void }) {

  return (

    <button

      type="button"

      onClick={onClick}

      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#5D3291]/20 bg-white px-3 py-1.5 text-[10px] font-extrabold text-[#5D3291] active:scale-[0.98]"

    >

      <Pencil className="h-3.5 w-3.5" />

      {label}

    </button>

  );

}



function ProfileSummaryPanel({

  publisher,

  logo,

}: {

  publisher: PublisherRecord;

  logo: string;

}) {

  return (

    <div className="flex items-start gap-3">

      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-1 ring-[var(--gold)]/25">

        <img src={logo} alt="" className="h-full w-full object-cover" />

      </div>

      <div className="min-w-0 flex-1 text-right">

        <p className="text-[14px] font-extrabold text-[#3a3258]">{publisher.name}</p>

        <p className="mt-1 line-clamp-3 text-[11px] font-bold leading-relaxed text-[#6b658a]">

          {publisher.bio?.trim() || "لم تُضف نبذة بعد."}

        </p>

        <p className="mt-2 text-[10px] font-bold text-[#8a84a8]">

          {[publisher.phone, publisher.email, publisher.websiteUrl].filter(Boolean).join(" · ") || "لا توجد بيانات تواصل"}

        </p>

      </div>

    </div>

  );

}



function HeroSummaryPanel({

  heroSlides,

  configuredCount,

}: {

  heroSlides: PublisherContentItem[];

  configuredCount: number;

}) {

  return (

    <div className="space-y-3">

      <p className="text-right text-[11px] font-bold text-[#6b658a]">

        {configuredCount

          ? `${configuredCount} كارت مُحدَّد يدوياً في أعلى الصفحة.`

          : `${heroSlides.length} كارت يُعرض تلقائياً من المحتوى.`}

      </p>

      <div className="space-y-1.5">

        {heroSlides.slice(0, 6).map((slide, i) => (

          <div

            key={slide.id}

            className="flex items-center justify-between gap-2 rounded-xl border border-[rgba(93,50,145,0.08)] bg-white px-2.5 py-2"

          >

            <span className="text-[10px] font-black text-[#5D3291]">{i + 1}</span>

            <p className="min-w-0 flex-1 truncate text-right text-[11px] font-extrabold text-[#3a3258]">{slide.title}</p>

          </div>

        ))}

        {heroSlides.length > 6 ? (

          <p className="text-center text-[10px] font-bold text-[#8a84a8]">+{heroSlides.length - 6} كروت أخرى</p>

        ) : null}

      </div>

    </div>

  );

}



function PanelCard({

  title,

  subtitle,

  action,

  children,

}: {

  title?: string;

  subtitle?: string;

  action?: ReactNode;

  children: ReactNode;

}) {

  return (

    <section className="rounded-[22px] border border-[rgba(93,50,145,0.12)] bg-white/95 p-4">

      {title ? (

        <div className="mb-3 flex items-center justify-between gap-2">

          {action ?? <span />}

          <div className="text-right">

            <h2 className="text-[13px] font-extrabold text-[#3a3258]">{title}</h2>

            {subtitle ? <p className="text-[10px] font-bold text-[#8a84a8]">{subtitle}</p> : null}

          </div>

        </div>

      ) : null}

      {children}

    </section>

  );

}



function TabButton({

  active,

  label,

  icon: Icon,

  onClick,

  compact,

}: {

  active: boolean;

  label: string;

  icon: LucideIcon;

  onClick: () => void;

  compact?: boolean;

}) {

  return (

    <button

      type="button"

      onClick={onClick}

      className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl font-extrabold transition active:scale-[0.98] ${

        compact ? "px-2 py-2 text-[10px]" : "px-2 py-2.5 text-[11px]"

      } ${active ? "text-white shadow-[0_6px_16px_-8px_rgba(93,50,145,0.55)]" : "text-[#5D3291]"}`}

      style={active ? { background: "linear-gradient(160deg, #7b4cb8, #5D3291)" } : undefined}

    >

      <Icon className={compact ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0"} />

      <span className="truncate">{label}</span>

    </button>

  );

}



function StatChip({ label, value }: { label: string; value: string }) {

  return (

    <div className="rounded-xl bg-white/80 px-2 py-2 text-center">

      <p className="text-[13px] font-extrabold text-[#3a3258]">{value}</p>

      <p className="text-[9px] font-bold text-[#8a84a8]">{label}</p>

    </div>

  );

}


