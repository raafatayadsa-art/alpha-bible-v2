import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "اهتماماتك — ألفا" },
      { name: "description", content: "اختر اهتماماتك لنبدأ رحلتك الروحية." },
    ],
  }),
  component: OnboardingScreen,
});

function OnboardingScreen() {
  return (
    <div dir="rtl" className="min-h-screen w-full bg-[#f4ead8] px-6 py-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-[#3a2a14]">اهتماماتك</h1>
        <p className="mt-2 text-[#6b5836]">
          اختر ما يلامس قلبك لنخصص لك رحلة روحية مميزة.
        </p>
        <div className="mt-8">
          <Link
            to="/books"
            className="inline-block rounded-full bg-[#c9a44c] px-6 py-3 text-white shadow"
          >
            متابعة إلى الكتاب المقدس
          </Link>
        </div>
      </div>
    </div>
  );
}
