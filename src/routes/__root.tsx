import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import "@/lib/alpha-theme/alpha-theme.css";
import "@/lib/i18n";
import "@/components/alpha/styles.css";
import "@/components/alpha/alpha-responsive.css";
import "@/components/alpha/alpha-viewport.css";
import "@/components/alpha/alpha-identity-layout.css";
import "@/components/alpha/alpha-dock-system.css";
import { DictionaryDebugBadge } from "@/components/DictionaryDebugBadge";
import { Toaster } from "@/components/ui/sonner";
import { GlobalBackButton } from "@/components/GlobalBackButton";
import { AlphaScreenFrame, shouldUseAlphaScreenFrame } from "@/components/alpha/AlphaScreenFrame";
import { AlphaViewportSync } from "@/components/alpha/alpha-viewport";
import { AlphaBackgroundProvider } from "@/components/alpha/AlphaBackgroundProvider";
import { AlphaTopDebugLabel } from "@/components/alpha/AlphaTopDebugLabel";
import { AlphaTopDebugSafeArea } from "@/components/alpha/AlphaTopDebugSafeArea";
import { AlphaNavigationProvider } from "@/components/navigation/AlphaNavigationProvider";
import { BibleSearchProvider } from "@/features/bible-search";
import { AuthBootstrap } from "@/features/auth";
import { I18nBootstrap } from "@/lib/i18n/use-locale";
import { useTranslation } from "react-i18next";
import { PlatformModuleGate, PlatformModulesBootstrap } from "@/lib/platform-modules";
import { AlphaThemeBootstrap } from "@/lib/alpha-theme";
import { AlphaShareSheetHost } from "@/lib/alpha-share-sheet";

const ALPHA_THEME_BOOT_SCRIPT = `(function(){try{var r=localStorage.getItem("ab:alpha-settings");var m="light";if(r){var s=JSON.parse(r);m=s.themeMode||"light";}var d=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var t=d?"dark":"light";document.documentElement.setAttribute("data-theme",t);if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;


function NotFoundComponent() {
  const { t } = useTranslation("common");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("errors.notFoundTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("errors.notFoundBody")}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("actions.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t } = useTranslation("common");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t("errors.loadFailedTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("errors.loadFailedBody")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("actions.tryAgain")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("actions.goHome")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Alpha Coptic" },
      { name: "description", content: "Alpha Bible Connect is a web application that displays Bible verses from a Supabase database." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Alpha Coptic" },
      { property: "og:description", content: "Alpha Bible Connect is a web application that displays Bible verses from a Supabase database." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Alpha Coptic" },
      { name: "twitter:description", content: "Alpha Bible Connect is a web application that displays Bible verses from a Supabase database." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/QYdr1GjV2FgB9HXoHJo3a5NKgKp2/social-images/social-1779501291200-photo_2026-05-23_04-51-02.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/QYdr1GjV2FgB9HXoHJo3a5NKgKp2/social-images/social-1779501291200-photo_2026-05-23_04-51-02.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Coptic:wght@400;500;600;700&display=swap",
      },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ALPHA_THEME_BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Onboarding routes render outside the app shell — no navigation providers,
  // no global buttons, no overlays, no layout constraints of any kind.
  const isOnboarding = pathname === "/intro";

  if (isOnboarding) {
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    );
  }

  const useScreenFrame = shouldUseAlphaScreenFrame(pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <AlphaThemeBootstrap />
      <I18nBootstrap />
      <AuthBootstrap />
      <PlatformModulesBootstrap />
      <AlphaNavigationProvider>
        <BibleSearchProvider>
          <AlphaBackgroundProvider>
            <AlphaViewportSync pathname={pathname} />
            {useScreenFrame ? (
              <AlphaScreenFrame mode="flow">
                <PlatformModuleGate>
                  <Outlet />
                </PlatformModuleGate>
              </AlphaScreenFrame>
            ) : (
              <PlatformModuleGate>
                <Outlet />
              </PlatformModuleGate>
            )}
            <GlobalBackButton />
            <AlphaShareSheetHost />
            <Toaster />
            <AlphaTopDebugSafeArea />
            <AlphaTopDebugLabel />
          </AlphaBackgroundProvider>
          {/* <DictionaryDebugBadge /> — disabled with smart highlight */}
        </BibleSearchProvider>
      </AlphaNavigationProvider>
    </QueryClientProvider>
  );
}
