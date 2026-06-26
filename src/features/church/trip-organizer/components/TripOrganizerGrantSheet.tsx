import { useState } from "react";
import { X, ShieldCheck, UserPlus } from "lucide-react";
import { getCurrentUser } from "@/features/church/current-user";
import {
  grantTripOrganizerRole,
  listTripOrganizerGrants,
  revokeTripOrganizerRole,
  type TripOrganizerGrant,
} from "../trip-organizer-grants";

const GLASS =
  "rounded-[22px] border border-white/70 bg-white/55 backdrop-blur-xl shadow-[0_16px_36px_-20px_rgba(60,40,16,0.42),inset_0_1px_0_rgba(255,255,255,0.75)]";

export function TripOrganizerGrantSheet({
  churchId,
  onClose,
}: {
  churchId: string;
  onClose: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [scope, setScope] = useState<"permanent" | "single_trip">("permanent");
  const [grants, setGrants] = useState<TripOrganizerGrant[]>(() => listTripOrganizerGrants(churchId));
  const admin = getCurrentUser();

  function refreshGrants() {
    setGrants(listTripOrganizerGrants(churchId));
  }

  function grant() {
    const id = userId.trim();
    const name = userName.trim();
    if (!id || !name) return;
    grantTripOrganizerRole({
      userId: id,
      userName: name,
      churchId,
      scope,
      grantedBy: admin.id || "admin",
      grantedByName: admin.name || "مشرف",
    });
    setUserId("");
    setUserName("");
    refreshGrants();
  }

  return (
    <div role="dialog" aria-modal="true" dir="rtl" className="fixed inset-0 z-[75] flex flex-col bg-[#f4ead8]">
      <div className="sticky top-0 z-10 px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)] bg-[#f4ead8]/95 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button type="button" aria-label="إغلاق" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/80 border border-[#efe2c4]">
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-[15px] font-extrabold text-[#3a2a18]">منظم رحلات</h2>
          <span className="w-10" />
        </div>
        <p className="mt-1 text-center text-[10px] text-[#7a5a30] inline-flex items-center justify-center gap-1 w-full">
          <ShieldCheck className="h-3 w-3 text-[#1f8a5a]" /> صلاحية مستقلة عن إدارة الكنيسة
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
        <div className={GLASS + " p-4 space-y-3"}>
          <p className="text-[12px] font-bold text-[#6a543a]">
            يمكن للكاهن أو المشرف منح عضو صلاحية إنشاء رحلات ومؤتمرات وزيارات أديرة دون صلاحيات إدارية واسعة.
          </p>
          <label className="block text-[11px] font-extrabold text-[#7a5a9a]">معرّف العضو</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="user-id"
            className="w-full rounded-xl border border-[#efe2c4] bg-white/70 px-3 py-2.5 text-[13px]"
          />
          <label className="block text-[11px] font-extrabold text-[#7a5a9a]">اسم العضو</label>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="الاسم كما يظهر في التطبيق"
            className="w-full rounded-xl border border-[#efe2c4] bg-white/70 px-3 py-2.5 text-[13px]"
          />
          <div className="flex gap-2">
            {(["permanent", "single_trip"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                className={[
                  "flex-1 rounded-xl py-2 text-[11px] font-extrabold border",
                  scope === s ? "bg-[#1f8a5a] text-white border-[#1f8a5a]" : "bg-white/60 border-[#efe2c4] text-[#5a4030]",
                ].join(" ")}
              >
                {s === "permanent" ? "دائم" : "رحلة واحدة"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={grant}
            className="w-full min-h-[48px] rounded-2xl bg-gradient-to-l from-[#7a4a26] to-[#b8893a] text-white text-[14px] font-extrabold inline-flex items-center justify-center gap-2"
          >
            <UserPlus className="h-4 w-4" /> منح الصلاحية
          </button>
        </div>

        {grants.length > 0 ? (
          <div className={GLASS + " p-4"}>
            <p className="text-[12px] font-extrabold text-[#3a2a18] mb-2">المنظمون الحاليون</p>
            <ul className="space-y-2">
              {grants.map((g) => (
                <li key={`${g.userId}-${g.scope}`} className="flex items-center justify-between gap-2 rounded-xl bg-white/50 border border-[#efe2c4] px-3 py-2">
                  <div className="min-w-0 text-right">
                    <p className="text-[12px] font-extrabold text-[#3a2a18] truncate">{g.userName}</p>
                    <p className="text-[10px] text-[#8a6a3a]">{g.scope === "permanent" ? "دائم" : "رحلة واحدة"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      revokeTripOrganizerRole(g.userId, churchId);
                      refreshGrants();
                    }}
                    className="text-[10px] font-extrabold text-[#9a3030] px-2 py-1 rounded-lg bg-[#fde8e8]"
                  >
                    إلغاء
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
