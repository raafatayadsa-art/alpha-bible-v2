import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  TRUST_GUARANTEE_ACCENTS,
  TRUST_GUARANTEE_IDS,
  TRUST_SECTION_ACCENTS,
  TRUST_SECTION_IDS,
  type TrustContentBlock,
  type TrustGuaranteeId,
  type TrustSectionId,
} from "./trust-safety-types";

type GuaranteeItem = {
  id: TrustGuaranteeId;
  tab: string;
  title: string;
  accent: string;
  summary: string;
  points: string[];
  metric: string;
  metricValue: string;
};

type DetailSection = {
  id: TrustSectionId;
  title: string;
  description: string;
  accent: string;
  blocks: TrustContentBlock[];
};

export function useTrustContent() {
  const { t } = useTranslation("trust");

  return useMemo(() => {
    const guarantees: GuaranteeItem[] = TRUST_GUARANTEE_IDS.map((id) => ({
      id,
      tab: t(`guarantees.${id}.tab`),
      title: t(`guarantees.${id}.title`),
      accent: TRUST_GUARANTEE_ACCENTS[id],
      summary: t(`guarantees.${id}.summary`),
      points: t(`guarantees.${id}.points`, { returnObjects: true }) as string[],
      metric: t(`guarantees.${id}.metric`),
      metricValue: t(`guarantees.${id}.metricValue`),
    }));

    const detailSections: DetailSection[] = TRUST_SECTION_IDS.map((id) => ({
      id,
      title: t(`sections.${id}.title`),
      description: t(`sections.${id}.description`),
      accent: TRUST_SECTION_ACCENTS[id],
      blocks: t(`sections.${id}.blocks`, { returnObjects: true }) as TrustContentBlock[],
    }));

    const dataProtectionSummary = t("dataProtection.summary", { returnObjects: true }) as Array<{
      title: string;
      subtitle: string;
    }>;

    return {
      pageTitle: t("pageTitle"),
      pageSubtitle: t("pageSubtitle"),
      hero: {
        title: t("hero.title"),
        summary: t("hero.summary"),
        protectionLevel: t("hero.protectionLevel"),
      },
      guaranteesIntro: t("guaranteesIntro"),
      guaranteesLabel: t("guaranteesLabel"),
      guarantees,
      dataProtection: {
        title: t("dataProtection.title"),
        subtitle: t("dataProtection.subtitle"),
        summary: dataProtectionSummary,
        detailsTitle: t("dataProtection.detailsTitle"),
        detailsPoints: t("dataProtection.detailsPoints", { returnObjects: true }) as string[],
        readFullDetails: t("readFullDetails", { ns: "legal" }),
      },
      detailSectionsLabel: t("detailSectionsLabel"),
      detailSectionsIntro: t("detailSectionsIntro"),
      detailSections,
      footer: {
        commitment: t("footer.commitment"),
        goal: t("footer.goal"),
        tagline: t("footer.tagline"),
      },
    };
  }, [t]);
}
