import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ChevronLeft, MapPin, Navigation, Phone, Globe, Radio,
  Crown, CalendarDays, Sparkles, BookOpen, Users, Church,
} from "lucide-react";
import {
  fetchApprovedChurchById,
  pushRecentChurchId,
  directoryChurchImage,
  directoryChurchLocation,
  mapsUrlForChurch,
  type DirectoryChurch,
} from "@/features/church/churches-directory-api";
import { JoinChurchButton } from "@/features/church/JoinChurchButton";

export const Route = createFileRoute("/church/directory/$placeId")({
  ssr: false,
  loader: async ({ params }) => {
    const church = await fetchApprovedChurchById(params.placeId);
    if (!church) throw notFound();
    return { church };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.church ? `${loaderData.church.name} — ألفا` : "تفاصيل — ألفا" },
      { name: "description", content: loaderData?.church?.name ?? "تفاصيل الكنيسة" },
    ],
  }),
  notFoundComponent: () => (
    <div dir="rtl" className="min-h-screen grid place-items-center bg-[#fbf6ec] text-center p-6">
      <div>
        <p className="text-[15px] font-extrabold text-[#3a3258] mb-2">لم نجد هذه الكنيسة</p>
        <Link to="/church/directory" className="text-[12px] font-bold text-[#5a3e8a] underline">
          العودة إلى الدليل
        </Link>
      </div>
    </div>
  ),
  component: PlaceDetailsScreen,
});

const SKY = "rgba(140,180,220,";
const LAV = "rgba(170,150,210,";
const BORDER = "rgba(220,210,235,0.7)";
const TEXT = "#3a3258";
const SUB = "#6b658a";

function PlaceDetailsScreen() {
  const { church } = Route.useLoaderData() as { church: DirectoryChurch };

  useEffect(() => { pushRecentChurchId(church.id); }, [church.id]);

  const location = directoryChurchLocation(church);
  const mapsUrl = mapsUrlForChurch(church);

  return (
    <div
      dir="rtl"
      className="min-h-screen pb-[calc(env(safe-area-inset-bottom,0px)+96px)]"
      style={{ background: "radial-gradient(120% 80% at 50% 0%, #fbf6ec 0%, #f1ecf7 45%, #e8eef8 100%)" }}
    >
      <header
        className="sticky top-0 z-20 px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-2xl"
        style={{ background: "linear-gradient(180deg, rgba(251,246,236,0.92), rgba(241,236,247,0.75))", borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center justify-between">
          <Link
            to="/church/directory"
            aria-label="رجوع"
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/85 border text-[#3a3258] active:scale-90"
            style={{ borderColor: BORDER }}
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
          </Link>
          <h1 className="text-[15px] font-extrabold" style={{ color: TEXT }}>تفاصيل الكنيسة</h1>
          <span className="w-10" />
        </div>
      </header>

      <div className="relative h-[220px] w-full">
        <img src={directoryChurchImage(church)} alt={church.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1030]/80 via-[#1a1030]/25 to-transparent" />
        <div className="absolute bottom-4 right-4 left-4 text-right text-white">
          <p className="text-[11px] font-bold text-white/85">كنيسة معتمدة</p>
          <h2 className="font-arabic-serif text-[22px] font-extrabold leading-tight">{church.name}</h2>
          {location ? (
            <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-white/90">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </p>
          ) : null}
        </div>
      </div>

      <main className="relative mx-auto w-full max-w-[440px] px-4 -mt-6 space-y-4">
        <Card>
          <div className="text-right space-y-3">
            {church.priestName ? (
              <div className="flex items-center gap-2 justify-end">
                <div>
                  <p className="text-[10px] font-bold" style={{ color: SUB }}>الكاهن المسؤول</p>
                  <p className="text-[14px] font-extrabold" style={{ color: TEXT }}>{church.priestName}</p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#5a4e8a]/15 text-[#5a4e8a]">
                  <Church className="h-5 w-5" />
                </span>
              </div>
            ) : null}
            {church.address ? (
              <p className="text-[12.5px] leading-relaxed" style={{ color: TEXT }}>{church.address}</p>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <StatMini icon={Users} label="أعضاء" value={church.memberCount.toLocaleString("ar-EG")} />
              <StatMini icon={BookOpen} label="خدام" value={church.servantCount.toLocaleString("ar-EG")} />
            </div>
          </div>
        </Card>

        <Card>
          <JoinChurchButton churchId={church.id} churchName={church.name} />
        </Card>

        <Card>
          <div className="grid grid-cols-2 gap-2">
            {church.phone ? (
              <a href={`tel:${church.phone}`} className="action-btn">
                <Phone className="h-4 w-4" />
                اتصال
              </a>
            ) : null}
            {mapsUrl !== "#" ? (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="action-btn">
                <Navigation className="h-4 w-4" />
                الخريطة
              </a>
            ) : null}
          </div>
        </Card>
      </main>

      <style>{`
        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          height: 2.75rem;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 800;
          color: white;
          background: linear-gradient(160deg, ${SKY}0.95), #2f5a8a);
        }
      `}</style>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[24px] border p-4 backdrop-blur-xl"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(241,236,247,0.85))",
        borderColor: BORDER,
        boxShadow: "0 20px 40px -24px rgba(120,110,180,0.5), inset 0 1px 0 rgba(255,255,255,0.95)",
      }}
    >
      {children}
    </div>
  );
}

function StatMini({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 border px-3 py-2 text-center" style={{ borderColor: BORDER }}>
      <Icon className="mx-auto h-4 w-4" style={{ color: "#5a4e8a" }} strokeWidth={2.2} />
      <p className="mt-1 text-[16px] font-extrabold" style={{ color: TEXT }}>{value}</p>
      <p className="text-[10px] font-bold" style={{ color: SUB }}>{label}</p>
    </div>
  );
}
