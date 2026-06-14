import { AlphaHeader, AlphaHeaderShell } from "@/components/navigation";
import { BottomDock } from "@/components/bible/BottomDock";
import { TrustSafetyScreenBackground } from "./components/TrustSafetyScreenBackground";
import { useTrustContent } from "./use-trust-content";
import { useLocale } from "@/lib/i18n/use-locale";
import {
  TrustDataProtectionSection,
  TrustSafetyFeatureGrid,
  TrustSafetyFooter,
  TrustSafetyHeroCard,
  TrustSafetySectionList,
} from "./trust-safety-ui";

export function TrustSafetyCenter() {
  const content = useTrustContent();
  const { dir } = useLocale();

  return (
    <div dir={dir} className="relative min-h-screen w-full overflow-x-hidden">
      <TrustSafetyScreenBackground />

      <div className="relative mx-auto w-full max-w-[440px] px-4 pb-36">
        <AlphaHeaderShell className="pb-0">
          <AlphaHeader
            variant="internal"
            title={content.pageTitle}
            subtitle={content.pageSubtitle}
            backTo="/settings"
          />
        </AlphaHeaderShell>

        <div className="mt-4 space-y-0">
          <TrustSafetyHeroCard />
          <TrustSafetyFeatureGrid />
          <TrustDataProtectionSection />
          <TrustSafetySectionList />
          <TrustSafetyFooter />
        </div>
      </div>

      <BottomDock />
    </div>
  );
}
