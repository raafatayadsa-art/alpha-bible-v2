import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/use-locale";
import type { AppLocale } from "@/lib/i18n";
import { notifySuccess } from "@/lib/i18n/notify";

const OPTIONS: { value: AppLocale; labelKey: "arabic" | "english" }[] = [
  { value: "ar", labelKey: "arabic" },
  { value: "en", labelKey: "english" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation("common");
  const { locale, setLocale } = useLocale();

  return (
    <div className={cn("rounded-[18px] border border-[#efe2c4]/90 bg-white/55 px-4 py-3.5", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#1a6b50]">
          <Languages className="h-4 w-4" strokeWidth={2.4} />
          <span className="text-[12px] font-extrabold">{t("language.label")}</span>
        </div>
        <span className="text-[10px] font-medium text-[#6a543a]">{t("language.switchHint")}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option) => {
          const active = locale === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (active) return;
                void setLocale(option.value).then(() => {
                  notifySuccess("languageChanged");
                });
              }}
              className={cn(
                "rounded-[14px] border px-3 py-2.5 text-[12px] font-extrabold transition active:scale-[0.98]",
                active
                  ? "border-[#3f9d6e]/40 bg-gradient-to-l from-[#2f9d6e] to-[#45b888] text-white shadow-[0_8px_20px_-10px_rgba(47,157,110,0.55)]"
                  : "border-[#efe2c4]/90 bg-white/70 text-[#6a543a] hover:bg-white",
              )}
            >
              {t(`language.${option.labelKey}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
