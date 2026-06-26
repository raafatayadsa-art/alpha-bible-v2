import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Library } from "lucide-react";
import { BottomDock } from "@/components/bible/BottomDock";
import { CopticWatermark } from "@/components/coptic";
import {
  fetchDiscoveryContent,
  fetchDiscoveryPublishers,
  LIBRARY_PUBLISHER_TYPES,
  type DiscoveryContentItem,
} from "@/features/publisher/publisher-discovery-api";
import type { PublisherRecord } from "@/features/publisher/types";
import { LatestBooksSection, TrustedLibrariesSection } from "./LibraryScreen";
import { usePlatformModules } from "@/lib/platform-modules";

export function LibraryHubScreen() {
  const { isModuleEnabled } = usePlatformModules();
  const audioOn = isModuleEnabled("audio");
  const [libraries, setLibraries] = useState<PublisherRecord[]>([]);
  const [books, setBooks] = useState<DiscoveryContentItem[]>([]);

  useEffect(() => {
    void Promise.all([
      fetchDiscoveryPublishers(LIBRARY_PUBLISHER_TYPES, { trustedOnly: true, limit: 10 }),
      fetchDiscoveryContent(["book", "pdf"], 8),
    ]).then(([libs, b]) => {
      setLibraries(libs);
      setBooks(b);
    });
  }, []);

  return (
    <main dir="rtl" className="relative min-h-dvh bg-[#F4EEE6] pb-28">
      <CopticWatermark />
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-2xl border-b border-[rgba(93,50,145,0.12)] bg-[rgba(244,238,230,0.92)]">
        <button
          type="button"
          onClick={() => window.history.back()}
          aria-label="رجوع"
          className="inline-grid h-10 w-10 place-items-center rounded-full border bg-white/85 text-[#3a3258] active:scale-90"
        >
          <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2">
          <Library className="h-5 w-5 text-[#5D3291]" />
          <h1 className="text-[15px] font-extrabold text-[#3a3258]">المكتبة</h1>
        </div>
        {audioOn ? (
          <Link to="/audio" className="text-[10px] font-extrabold text-[#5D3291]">
            الصوتيات
          </Link>
        ) : (
          <span className="w-10" aria-hidden />
        )}
      </header>

      <div className="relative mx-auto w-full max-w-[var(--alpha-content-narrow-width)]">
        <TrustedLibrariesSection libraries={libraries} />
        <LatestBooksSection books={books} />
        {!libraries.length && !books.length ? (
          <p className="px-5 py-16 text-center text-[12px] font-bold text-[#6b658a]">
            لا توجد مكتبات منشورة بعد — ستظهر هنا بعد اعتماد الناشرين.
          </p>
        ) : null}
      </div>

      <BottomDock />
    </main>
  );
}
