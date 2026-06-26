import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { fetchPublishedPublisherByChurchId } from "../publisher-api";
import { CHURCH_DIR } from "@/features/church-directory/tokens";

type Props = {
  churchId: string;
};

export function ChurchPublisherPageLink({ churchId }: Props) {
  const [publisherId, setPublisherId] = useState<string | null>(null);
  const [publisherName, setPublisherName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const pub = await fetchPublishedPublisherByChurchId(churchId);
      if (cancelled || !pub) return;
      setPublisherId(pub.id);
      setPublisherName(pub.name);
    })();
    return () => {
      cancelled = true;
    };
  }, [churchId]);

  if (!publisherId) return null;

  return (
    <div
      className="rounded-[22px] border p-3.5"
      style={{ borderColor: CHURCH_DIR.border, background: CHURCH_DIR.glass }}
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/publisher/$publisherId"
          params={{ publisherId }}
          className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] font-extrabold text-white active:scale-[0.98]"
          style={{ background: `linear-gradient(160deg, #7b4cb8, ${CHURCH_DIR.purple})` }}
        >
          <BookOpen className="h-4 w-4" />
          صفحة الناشر
        </Link>
        <div className="text-right">
          <p className="text-[12px] font-extrabold" style={{ color: CHURCH_DIR.text }}>
            محتوى الكنيسة
          </p>
          <p className="mt-0.5 text-[10px] font-bold" style={{ color: CHURCH_DIR.sub }}>
            {publisherName ?? "ترانيم · كتب · محاضرات"}
          </p>
        </div>
      </div>
    </div>
  );
}
