import { createFileRoute } from "@tanstack/react-router";
import { ProfileSubShell, PCard } from "@/components/profile/Shell";

const messages = [
  {
    id: 1, from: "أبونا داود عبد الملاك", role: "كاهن", color: "#8a6ec1",
    body: "اجتماع الخدام يوم السبت بعد القداس الإلهي مباشرة.", time: "منذ ساعتين", unread: true,
  },
  {
    id: 2, from: "إدارة الكنيسة", role: "كنيسة", color: "#d88a2a",
    body: "تم الموافقة على طلب نقل عضويتك من إيبارشية الإسكندرية.", time: "أمس", unread: true,
  },
  {
    id: 3, from: "خدمة مدارس الأحد", role: "خدمة", color: "#4a9e6e",
    body: "اجتماع تحضيري للرحلة الصيفية لجميع الخدام.", time: "الإثنين", unread: true,
  },
  {
    id: 4, from: "اللجنة الإدارية", role: "عضوية", color: "#4a86c1",
    body: "تم تجديد بطاقة العضوية لعام 2026 بنجاح.", time: "26 مايو", unread: false,
  },
];

export const Route = createFileRoute("/profile/messages")({
  ssr: false,
  head: () => ({ meta: [{ title: "ألفا — رسائل الكنيسة" }] }),
  component: () => (
    <ProfileSubShell title="رسائل الكنيسة">
      <div className="space-y-3">
        {messages.map((m) => (
          <PCard key={m.id} accent={m.color} className="p-3.5">
            <div className="flex items-start gap-3">
              <div
                className="shrink-0 grid h-10 w-10 place-items-center rounded-full border font-bold text-[13px]"
                style={{ background: `${m.color}22`, color: m.color, borderColor: `${m.color}55` }}
              >
                {m.from.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[13px] font-extrabold text-[#3a2a18] truncate">{m.from}</h3>
                  <span className="text-[10px] text-[#9a7e5a] shrink-0">{m.time}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${m.color}22`, color: m.color }}
                  >
                    {m.role}
                  </span>
                  {m.unread && <span className="h-1.5 w-1.5 rounded-full bg-[#d88a2a]" />}
                </div>
                <p className="text-[12px] text-[#3a2a18]/85 mt-1.5 leading-relaxed">{m.body}</p>
              </div>
            </div>
          </PCard>
        ))}
      </div>
    </ProfileSubShell>
  ),
});
