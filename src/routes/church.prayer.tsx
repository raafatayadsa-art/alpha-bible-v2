import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Heart, Sparkles, Users, Clock, HandHeart } from "lucide-react";

export const Route = createFileRoute("/church/prayer")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "طلبات الصلاة — ألفا" },
      { name: "description", content: "طلبات الصلاة في كنيستك. شارك في الصلاة من أجل إخوتك." },
    ],
  }),
  component: PrayerRequestsScreen,
});

const PRAYER_REQUESTS = [
  {
    id: "1",
    name: "مينا س.",
    request: "صلاة من أجل الشفاء العاجل لأبي من العملية الجراحية",
    time: "منذ ساعتين",
    prayers: 42,
    category: "شفاء",
  },
  {
    id: "2",
    name: "مريم ج.",
    request: "أطلب صلواتكم من أجل نجاحي في الامتحانات الجامعية",
    time: "منذ ٥ ساعات",
    prayers: 28,
    category: "دراسة",
  },
  {
    id: "3",
    name: "أبو تادرس",
    request: "صلاة من أجل ابني الذي يمر بضائقة مالية",
    time: "منذ يوم",
    prayers: 67,
    category: "معيشة",
  },
  {
    id: "4",
    name: "سارة م.",
    request: "أرجوكم ادعوا لأختي بالزواج المبارك",
    time: "منذ يومين",
    prayers: 35,
    category: "زواج",
  },
  {
    id: "5",
    name: "جورج ع.",
    request: "صلوا من أجل راحة نفس جدتي الراحلة",
    time: "منذ ٣ أيام",
    prayers: 89,
    category: "راحة نفس",
  },
];

function PrayerRequestsScreen() {
  return (
    <main
      dir="rtl"
      className="relative min-h-screen w-full overflow-x-hidden bg-[#f4ead8]"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,231,184,0.6), transparent 60%)," +
            "radial-gradient(70% 60% at 100% 30%, rgba(167,139,217,0.18), transparent 65%)," +
            "radial-gradient(80% 60% at 0% 85%, rgba(214,168,98,0.22), transparent 65%)",
        }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(244,234,216,0.95) 0%, rgba(244,234,216,0.6) 70%, rgba(244,234,216,0) 100%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/church"
            aria-label="رجوع"
            className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/80 border border-[#efe2c4] text-[#3a2a18] active:scale-90 transition-transform shadow-[0_8px_20px_-14px_rgba(120,80,30,0.45)]"
          >
            <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
          </Link>

          <h1 className="text-[15px] font-extrabold text-[#3a2a18]">طلبات الصلاة</h1>

          <div className="h-10 w-10" />
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-[440px] px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+120px)] space-y-5">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[24px] border border-white/70 bg-[#fbf3e1]/80 backdrop-blur-xl p-4 text-center shadow-[0_16px_40px_-22px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)]">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-white/70 bg-gradient-to-br from-[#8a6ec1]/25 to-[#8a6ec1]/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <Sparkles className="h-5 w-5 text-[#8a6ec1]" strokeWidth={2} />
            </div>
            <p className="mt-2 text-[22px] font-extrabold text-[#3a2a18] leading-none">24</p>
            <p className="mt-1 text-[11px] font-bold text-[#6a543a]">طلب نشط</p>
          </div>
          <div className="rounded-[24px] border border-white/70 bg-[#fbf3e1]/80 backdrop-blur-xl p-4 text-center shadow-[0_16px_40px_-22px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)]">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-white/70 bg-gradient-to-br from-[#1f8a5a]/25 to-[#1f8a5a]/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <Users className="h-5 w-5 text-[#1f8a5a]" strokeWidth={2} />
            </div>
            <p className="mt-2 text-[22px] font-extrabold text-[#3a2a18] leading-none">128</p>
            <p className="mt-1 text-[11px] font-bold text-[#6a543a]">صليّ</p>
          </div>
        </div>

        {/* Requests list */}
        <section>
          <h2 className="mb-3 text-[14px] font-extrabold text-[#3a2a18]">الطلبات الحالية</h2>
          <div className="space-y-3">
            {PRAYER_REQUESTS.map((req) => (
              <button
                key={req.id}
                type="button"
                className="w-full text-right rounded-[24px] border border-white/70 bg-[#fbf3e1]/80 backdrop-blur-xl p-4 shadow-[0_16px_40px_-22px_rgba(120,80,30,0.45),inset_0_1px_0_rgba(255,255,255,0.85)] active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#8a6ec1]/20 to-[#8a6ec1]/40 border border-white/70">
                    <HandHeart className="h-4 w-4 text-[#8a6ec1]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-extrabold text-[#3a2a18]">{req.name}</span>
                      <span className="shrink-0 rounded-full bg-[#8a6ec1]/12 px-2 py-0.5 text-[10px] font-bold text-[#8a6ec1] border border-[#8a6ec1]/20">
                        {req.category}
                      </span>
                    </div>
                    <p className="mt-1 text-[12.5px] text-[#3a2a18] leading-relaxed">{req.request}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10.5px] text-[#6a543a]">
                        <Clock className="h-3 w-3" />
                        {req.time}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1f8a5a]/12 px-2 py-0.5 text-[10.5px] font-bold text-[#1f8a5a] border border-[#1f8a5a]/20">
                        <Heart className="h-3 w-3" strokeWidth={2.5} />
                        {req.prayers} صلاة
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </main>
  );
}
