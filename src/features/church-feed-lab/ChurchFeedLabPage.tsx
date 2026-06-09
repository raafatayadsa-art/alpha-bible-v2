import { LabFeedCard } from "./LabFeedCard";
import { LAB_DEMO_POSTS } from "./mock-posts";

export function ChurchFeedLabPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f4ead8] pb-12">
      <div className="mx-auto max-w-[440px] px-3 pt-4">
        <p className="rounded-2xl border border-dashed border-[#7a5fc9]/40 bg-[#7a5fc9]/10 px-3 py-2 text-center text-[11px] font-semibold text-[#5a3d8a]">
          Experimental Page
          <br />
          Not connected to production
        </p>

        <header className="mb-4 mt-4 text-center">
          <h1 className="text-[20px] font-bold text-[#3d2e1c]">Church Feed Lab</h1>
          <p className="mt-1 text-[11px] text-[#8a7355]">
            Visual prototypes only · mock data
          </p>
        </header>

        <div className="flex flex-col gap-2">
          {LAB_DEMO_POSTS.map((post) => (
            <LabFeedCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
