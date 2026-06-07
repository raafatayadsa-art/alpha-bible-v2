import { useId, type ReactNode } from "react";
import type { AlphaIconKind } from "@/components/controls/alpha-icon-registry";

type G = { fill: string; accent: string };

const R: Record<AlphaIconKind, (p: G) => ReactNode> = {
  home: ({ fill }) => <path d="M12 4.2L5.5 10v8.3c0 .9.7 1.7 1.6 1.7H9.8v-5.8h4.4v5.8h2.7c.9 0 1.6-.8 1.6-1.7V10L12 4.2z" fill={fill} />,
  bible: ({ fill, accent }) => (
    <>
      <path d="M5 6.5c0-1 .8-1.8 2-2h3.2v15.6H7c-1.2 0-2-.8-2-1.8V6.5z" fill={fill} />
      <path d="M19 6.5c0-1-.8-1.8-2-1.8h-3.2v15.6H17c1.2 0 2-.8 2-1.8V6.5z" fill={fill} opacity="0.88" />
      <path d="M12 5.2v14.1" stroke={accent} strokeWidth="1.2" opacity="0.45" />
    </>
  ),
  agpeya: ({ fill }) => (
    <>
      <path d="M8.2 8.5c0-2 1.5-3.4 3.8-3.4s3.8 1.4 3.8 3.4v1.2l1.4 4.2c.3.9-.3 1.8-1.3 1.8h-8.2c-1 0-1.6-.9-1.3-1.8l1.4-4.2V8.5z" fill={fill} />
      <path d="M6.5 14.8c1.8 2.2 4 3.4 5.5 3.4s3.7-1.2 5.5-3.4c.8 1.5.3 3.6-1.2 4.5-2.2 1.4-5.4 1.4-7.6 0-1.5-.9-2-3-1.2-4.5z" fill={fill} opacity="0.92" />
    </>
  ),
  prayer: ({ fill }) => R.agpeya({ fill, accent: fill }),
  katameros: ({ fill, accent }) => (
    <>
      <path d="M7 5.5h10c1 0 1.8.8 1.8 1.8v11.4c0 .7-.8 1.1-1.4.7l-4.4-2.8-4.4 2.8c-.6.4-1.4 0-1.4-.7V7.3c0-1 .8-1.8 1.8-1.8z" fill={fill} />
      <path d="M10 9.5h4M10 12h4" stroke={accent} strokeWidth="1" opacity="0.45" />
    </>
  ),
  synaxarium: ({ fill, accent }) => (
    <>
      <path d="M12 5.5c-2.8 0-5 2-5 4.5s2.2 6.2 5 8.5c2.8-2.3 5-5.8 5-8.5s-2.2-4.5-5-4.5z" fill={fill} />
      <path d="M12 8.5v5.5M9.8 11.2h4.4" stroke={accent} strokeWidth="1.3" opacity="0.55" />
    </>
  ),
  church: ({ fill, accent }) => (
    <>
      <path d="M12 3.5l-1.2 2.4H8.5v2.2h7V5.9h-2.3L12 3.5z" fill={accent} />
      <path d="M6.5 10.2h11v8.8c0 .8-.7 1.5-1.5 1.5h-8c-.8 0-1.5-.7-1.5-1.5v-8.8z" fill={fill} />
    </>
  ),
  library: ({ fill }) => (
    <>
      <path d="M5.5 6.5h3.8v12H6.8c-.7 0-1.3-.6-1.3-1.3V6.5z" fill={fill} />
      <path d="M10.1 5.8h3.8v12.7h-3.8V5.8z" fill={fill} opacity="0.92" />
      <path d="M14.7 6.8h3.8v11H16c-.7 0-1.3-.6-1.3-1.3V6.8z" fill={fill} opacity="0.84" />
    </>
  ),
  audio: ({ fill }) => (
    <>
      <path d="M9.5 8.5v7l5.5-3.5-5.5-3.5z" fill={fill} />
      <path d="M16.8 9.2c1 .8 1.6 1.9 1.6 2.8" stroke={fill} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </>
  ),
  children: ({ fill }) => (
    <>
      <circle cx="12" cy="9.5" r="3.2" fill={fill} />
      <path d="M7 18.5c.5-2.8 2.4-4.3 5-4.3s4.5 1.5 5 4.3" fill={fill} opacity="0.9" />
    </>
  ),
  meetings: ({ fill, accent }) => (
    <>
      <rect x="5" y="6" width="14" height="13" rx="2.2" fill={fill} />
      <path d="M8.5 4.5v3M15.5 4.5v3" stroke={fill} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="8" y="12" width="3" height="2.5" rx=".6" fill={accent} opacity="0.35" />
    </>
  ),
  family: ({ fill }) => (
    <>
      <circle cx="8.5" cy="9" r="2.2" fill={fill} />
      <circle cx="15.5" cy="9" r="2.2" fill={fill} opacity="0.9" />
      <circle cx="12" cy="7.2" r="2" fill={fill} />
      <path d="M5.5 18c.3-2.4 2-3.8 3-3.8s2.2 1 3.5 1 2.5-1.2 3.5-1.2 2.7 1.4 3 3.8" fill={fill} opacity="0.88" />
    </>
  ),
  notifications: ({ fill }) => (
    <>
      <path d="M12 4.2c-2.8 0-4.8 2.2-4.8 5v3.2l-1.4 2.4h12.4l-1.4-2.4V9.2c0-2.8-2-5-4.8-5z" fill={fill} />
      <path d="M9.8 18.8c.6 1 1.6 1.6 2.8 1.6s2.2-.6 2.8-1.6" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  settings: ({ fill, accent }) => (
    <>
      <path d="M12 6.8l1.1 2.2 2.4.4-.9 2.2 1.5 1.9-2.4.7-.7 2.4-2-1.2-2 1.2-.7-2.4-2.4-.7 1.5-1.9-.9-2.2 2.4-.4L12 6.8z" fill={fill} />
      <circle cx="12" cy="12" r="2.5" fill={accent} opacity="0.32" />
    </>
  ),
  profile: ({ fill }) => (
    <>
      <circle cx="12" cy="9" r="3.2" fill={fill} />
      <path d="M6.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8" fill={fill} opacity="0.9" />
    </>
  ),
  security: ({ fill, accent }) => (
    <>
      <path d="M12 4.5l-5.5 2.2v5.2c0 3.4 2.4 5.8 5.5 7.1 3.1-1.3 5.5-3.7 5.5-7.1V6.7L12 4.5z" fill={fill} />
      <path d="M10 12.2l1.6 1.6 3-3.2" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
    </>
  ),
  appearance: ({ fill }) => (
    <path d="M12 5.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm0 2.2a4.3 4.3 0 110 8.6 4.3 4.3 0 010-8.6z" fill={fill} />
  ),
  storage: ({ fill }) => (
    <>
      <path d="M6.5 14.5c0-3.8 2.5-6.8 5.5-6.8s5.5 3 5.5 6.8c0 1.2-1 2.2-2.2 2.2H8.7c-1.2 0-2.2-1-2.2-2.2z" fill={fill} />
      <path d="M12 11.5v3.8M10.2 13.4h3.6" stroke={fill} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </>
  ),
  support: ({ fill }) => (
    <>
      <path d="M6.5 13.5c0-3 2-5.2 5.5-5.2s5.5 2.2 5.5 5.2v2.2H6.5v-2.2z" fill={fill} />
      <path d="M6.5 15.7h-1.2c-.8 0-1.3.8-.9 1.5l1.1 2.2h1.4M17.5 15.7h1.2c.8 0 1.3.8.9 1.5l-1.1 2.2H17.5" fill={fill} opacity="0.9" />
    </>
  ),
  accessibility: ({ fill }) => (
    <>
      <path d="M12 6.8c1.5 0 2.7 1.2 2.7 2.7S13.5 12.2 12 12.2s-2.7-1.2-2.7-2.7 1.2-2.7 2.7-2.7z" fill={fill} />
      <path d="M7.5 16.5c1.2-2.4 2.8-3.5 4.5-3.5s3.3 1.1 4.5 3.5" stroke={fill} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </>
  ),
  reminders: ({ fill, accent }) => (
    <>
      <circle cx="12" cy="12" r="6.8" fill={fill} />
      <path d="M12 9v4l2.6 1.6" stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
    </>
  ),
  service: ({ fill }) => (
    <path d="M12 7.8c-1.8-2.8-5.2-1.6-5.2 1.2 0 2 2.1 3.4 5.2 5.2 3.1-1.8 5.2-3.2 5.2-5.2 0-2.8-3.4-4-5.2-1.2z" fill={fill} />
  ),
  personal: ({ fill }) => R.profile({ fill, accent: fill }),
  community: ({ fill }) => (
    <>
      <circle cx="8" cy="10" r="2" fill={fill} />
      <circle cx="16" cy="10" r="2" fill={fill} opacity="0.9" />
      <circle cx="12" cy="8.2" r="1.8" fill={fill} />
    </>
  ),
};

export function AlphaGlyph({ kind, size, color }: { kind: AlphaIconKind; size: number; color: string }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `ag-${kind}-${uid}`;
  const Render = R[kind];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id={gradId} x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.68" />
        </linearGradient>
      </defs>
      <g>{Render({ fill: `url(#${gradId})`, accent: color })}</g>
      <ellipse cx="12" cy="7.2" rx="5.5" ry="2.2" fill="white" opacity="0.2" />
    </svg>
  );
}
