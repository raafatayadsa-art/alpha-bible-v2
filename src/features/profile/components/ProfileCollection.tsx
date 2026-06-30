import { useMemo } from "react";
import { PremiumHorizontalPostCard } from "@/features/church/ChurchPostsFeed";
import { getProfileCollection } from "../profile-collection-storage";
import { ProfileGlassCard } from "./shared";

export function ProfileCollection() {
  const items = useMemo(() => getProfileCollection(), []);

  if (items.length === 0) {
    return (
      <ProfileGlassCard className="p-5 text-center">
        <p className="text-[12px] font-bold text-[#6a543a]">
          لم تُضف محتوى إلى مجموعتك بعد
        </p>
        <p className="mt-1 text-[11px] text-[#9a7e5a]">
          استخدم «أضف إلى ملفي» من أي محتوى في Alpha
        </p>
      </ProfileGlassCard>
    );
  }

  return (
    <div className="space-y-5 -mx-1">
      {items.map((item) =>
        item.post ? (
          <div key={item.id} className="space-y-2">
            <p className="px-1 text-[10.5px] font-semibold text-[#9a7e5a]">
              أضافه {item.addedByName} · {item.addedAgo}
            </p>
            <div className="flex justify-center">
              <PremiumHorizontalPostCard post={item.post} />
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}
