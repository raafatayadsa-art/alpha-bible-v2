import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { PublisherWorkspaceScreen } from "@/features/publisher";

export const Route = createFileRoute("/publisher/workspace/$publisherId")({
  ssr: false,
  component: PublisherWorkspaceRoute,
});

function PublisherWorkspaceRoute() {
  const { publisherId } = Route.useParams();

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F2ED] pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-2xl border-b border-[rgba(93,50,145,0.12)] bg-[rgba(245,242,237,0.92)]">
        <Link
          to="/publisher"
          aria-label="رجوع"
          className="inline-grid h-10 w-10 place-items-center rounded-full border bg-white/85 text-[#3a3258] active:scale-90"
        >
          <ChevronLeft className="h-5 w-5 -scale-x-100" strokeWidth={2} />
        </Link>
        <h1 className="text-[15px] font-extrabold text-[#3a3258]">مساحة الناشر</h1>
        <span className="w-10" />
      </header>
      <main className="mx-auto w-full max-w-[var(--alpha-content-max-width)] px-4 pt-4">
        <PublisherWorkspaceScreen publisherId={publisherId} />
      </main>
    </div>
  );
}
