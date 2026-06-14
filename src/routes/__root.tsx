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
import "@/lib/i18n";
import { DictionaryDebugBadge } from "@/components/DictionaryDebugBadge";
import { Toaster } from "@/components/ui/sonner";
import { GlobalBackButton } from "@/components/GlobalBackButton";
import { AlphaNavigationProvider } from "@/components/navigation/AlphaNavigationProvider";
import { BibleSearchProvider } from "@/features/bible-search";
import { AuthBootstrap } from "@/features/auth";
import { I18nBootstrap } from "@/lib/i18n/use-locale";
import { useTranslation } from "react-i18next";

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
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Amiri:wght@400;700&display=swap" },
      { rel: "stylesheet", href: appCss },
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
        <HeadContent />
      </head>
      <body className="font-arabic-serif antialiased">
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

  return (
    <QueryClientProvider client={queryClient}>
      <I18nBootstrap />
      <AuthBootstrap />
      <AlphaNavigationProvider>
        <BibleSearchProvider>
          <Outlet />
          <GlobalBackButton />
          <Toaster />
          {/* <DictionaryDebugBadge /> — disabled with smart highlight */}
        </BibleSearchProvider>
      </AlphaNavigationProvider>
    </QueryClientProvider>
  );
}
