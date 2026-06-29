import { useState } from "react";
import { Loader2, Mail, UserPlus, Users, X } from "lucide-react";
import { CyberBtn, CyberPanel, CyberSearch } from "../mission-control-ui";
import { MC } from "../platform-store";
import { PP_GOLD } from "../PlatformPremiumUI";
import { getCommunityFriends, type CommunityFriend } from "@/features/community/community-friends-store";
import { useAdminPermissions } from "./useAdminPermissions";
import { addFriendAsAdmin, inviteAdminTeamMember } from "./admin-team-api";
import { AvatarWithDisplayShield } from "@/components/alpha/AvatarWithDisplayShield";

type Props = {
  open: boolean;
  onClose: () => void;
  onSent: () => void;
};

function isRealUserId(id?: string): id is string {
  return !!id && !id.startsWith("demo-") && id.includes("-");
}

export function AlphaTeamInviteSheet({ open, onClose, onSent }: Props) {
  const { isHiddenOwner } = useAdminPermissions();
  const friends = getCommunityFriends();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [roleKey, setRoleKey] = useState<"super_admin" | "admin">("admin");
  const [sending, setSending] = useState(false);
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  if (!open) return null;

  const reset = () => {
    setFullName("");
    setUsername("");
    setEmail("");
    setPhone("");
    setAvatarUrl("");
    setRoleKey("admin");
    setError(null);
    setInviteUrl(null);
    setAddingFriendId(null);
  };

  const applyFriend = (friend: CommunityFriend) => {
    setFullName(friend.name);
    setUsername(friend.alphaId?.replace(/^A-/, "") || friend.name.replace(/\s+/g, "").slice(0, 12));
    setAvatarUrl(friend.avatarUrl ?? "");
    setRoleKey("admin");
    setError(null);
  };

  const addFriendAdmin = async (friend: CommunityFriend) => {
    setError(null);
    if (!isRealUserId(friend.linkedUserId)) {
      applyFriend(friend);
      setError("هذا صديق تجريبي — أكمل البريد ثم أرسل الدعوة يدوياً");
      return;
    }
    setAddingFriendId(friend.id);
    const result = await addFriendAsAdmin({ linkedUserId: friend.linkedUserId, roleKey: "admin" });
    setAddingFriendId(null);
    if (!result.ok) {
      setError(result.error ?? "تعذّر إضافة الصديق كمسؤول");
      return;
    }
    onSent();
    reset();
    onClose();
  };

  const send = async () => {
    setError(null);
    if (!fullName.trim() || !username.trim() || !email.trim()) {
      setError("الاسم وUsername والبريد مطلوبة");
      return;
    }
    setSending(true);
    const result = await inviteAdminTeamMember({
      fullName,
      username,
      email,
      phone: phone || undefined,
      avatarUrl: avatarUrl || undefined,
      roleKey,
    });
    setSending(false);
    if (!result.ok) {
      setError(result.error ?? "تعذّر إرسال الدعوة");
      return;
    }
    setInviteUrl(result.inviteUrl ?? null);
    onSent();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" dir="rtl">
      <button type="button" aria-label="إغلاق" className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div
        className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[20px] border p-4 sm:rounded-[20px]"
        style={{ background: MC.midnight, borderColor: MC.panelBorder }}
      >
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border" style={{ borderColor: MC.panelBorder }}>
            <X className="h-5 w-5" style={{ color: MC.muted }} />
          </button>
          <div className="flex items-center gap-2">
            <UserPlus className="h-6 w-6" style={{ color: PP_GOLD }} />
            <p className="text-[16px] font-extrabold" style={{ color: MC.white }}>
              دعوة عضو جديد
            </p>
          </div>
        </div>

        {inviteUrl ? (
          <CyberPanel glow={MC.green}>
            <p className="mb-2 text-[15px] font-extrabold" style={{ color: MC.green }}>
              تم إنشاء الدعوة
            </p>
            <p className="mb-3 text-[13px] font-medium leading-relaxed" style={{ color: MC.muted }}>
              أرسل الرابط للعضو ليحدد كلمة المرور بنفسه.
            </p>
            <p className="break-all rounded-[12px] border p-3 font-mono text-[11px]" style={{ borderColor: MC.panelBorder, color: MC.cyan }}>
              {inviteUrl}
            </p>
            <CyberBtn
              label="نسخ الرابط"
              className="mt-3 w-full"
              onClick={() => void navigator.clipboard?.writeText(inviteUrl)}
            />
          </CyberPanel>
        ) : (
          <>
            {isHiddenOwner && friends.length > 0 ? (
              <CyberPanel glow={PP_GOLD} className="mb-3">
                <div className="mb-2 flex items-center justify-end gap-2">
                  <Users className="h-5 w-5" style={{ color: PP_GOLD }} />
                  <p className="text-[14px] font-extrabold" style={{ color: MC.white }}>
                    إضافة من الأصدقاء
                  </p>
                </div>
                <p className="mb-3 text-[12px] font-medium" style={{ color: MC.muted }}>
                  اختر صديقاً ليصبح مسؤولاً فوراً (admin) — للمؤسس فقط
                </p>
                <ul className="max-h-44 space-y-2 overflow-y-auto">
                  {friends.map((friend) => (
                    <li
                      key={friend.id}
                      className="flex items-center gap-2 rounded-[12px] border px-2 py-2"
                      style={{ borderColor: MC.panelBorder, background: "rgba(0,0,0,0.2)" }}
                    >
                      <AvatarWithDisplayShield
                        userName={friend.name}
                        userAvatar={friend.avatarUrl}
                        shieldRole="official"
                        shieldSize="sm"
                      >
                        {friend.avatarUrl?.trim() ? (
                          <img
                            src={friend.avatarUrl}
                            alt=""
                            className="h-10 w-10 rounded-full border object-cover"
                            style={{ borderColor: `${PP_GOLD}44` }}
                          />
                        ) : (
                          <div
                            className="grid h-10 w-10 place-items-center rounded-full border text-[13px] font-black"
                            style={{ borderColor: `${PP_GOLD}44`, background: `${PP_GOLD}18`, color: PP_GOLD }}
                          >
                            {friend.name?.trim()?.charAt(0) ?? "?"}
                          </div>
                        )}
                      </AvatarWithDisplayShield>
                      <div className="min-w-0 flex-1 text-right">
                        <p className="truncate text-[13px] font-extrabold text-slate-100">{friend.name}</p>
                        <p className="truncate text-[11px] font-medium" style={{ color: MC.muted }}>
                          {friend.role ?? "صديق"}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          disabled={addingFriendId === friend.id}
                          onClick={() => void addFriendAdmin(friend)}
                          className="rounded-lg border px-2 py-1 text-[10px] font-extrabold disabled:opacity-50"
                          style={{ borderColor: `${MC.green}55`, color: MC.green }}
                        >
                          {addingFriendId === friend.id ? "…" : "مسؤول"}
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFriend(friend)}
                          className="rounded-lg border px-2 py-1 text-[10px] font-extrabold"
                          style={{ borderColor: `${MC.cyan}55`, color: MC.cyan }}
                        >
                          تعبئة
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CyberPanel>
            ) : null}

            <CyberSearch value={fullName} onChange={setFullName} placeholder="الاسم الكامل" />
            <CyberSearch value={username} onChange={setUsername} placeholder="Username" />
            <CyberSearch value={email} onChange={setEmail} placeholder="البريد الإلكتروني" />
            <CyberSearch value={phone} onChange={setPhone} placeholder="رقم الهاتف (اختياري)" />
            <CyberSearch value={avatarUrl} onChange={setAvatarUrl} placeholder="رابط الصورة (اختياري)" />

            <label className="mb-3 block text-right text-[13px] font-bold" style={{ color: MC.muted }}>
              الدور
              <select
                value={roleKey}
                onChange={(e) => setRoleKey(e.target.value as "super_admin" | "admin")}
                className="mt-1.5 w-full rounded-lg border bg-black/40 px-3 py-3 text-[14px] font-bold text-white outline-none"
                style={{ borderColor: MC.panelBorder }}
              >
                <option value="admin">مسؤول</option>
                <option value="super_admin">مسؤول أعلى</option>
              </select>
            </label>

            {error ? (
              <p className="mb-2 text-[13px] font-bold" style={{ color: MC.red }}>
                {error}
              </p>
            ) : null}

            <CyberBtn
              label={sending ? "جاري الإرسال…" : "إرسال الدعوة"}
              className="w-full !text-[14px]"
              disabled={sending}
              onClick={() => void send()}
            />
          </>
        )}

        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-1 text-[10px] font-bold"
          style={{ color: MC.muted }}
          onClick={() => {
            reset();
            onClose();
          }}
        >
          <Mail className="h-3.5 w-3.5" />
          إغلاق
        </button>
      </div>
    </div>
  );
}
