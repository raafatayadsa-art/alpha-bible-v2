import { useId } from "react";
import { cn } from "@/lib/utils";

const SIZE_MAP = {
  sm: { width: 50, height: 56 },
  md: { width: 82, height: 92 },
  lg: { width: 130, height: 143 },
  hero: { width: 190, height: 210 },
} as const;

export type AlphaConnectLogoSize = keyof typeof SIZE_MAP;

type AlphaConnectLogoProps = {
  size?: AlphaConnectLogoSize;
  animated?: boolean;
  className?: string;
};

export function AlphaConnectLogo({ size = "md", animated = true, className }: AlphaConnectLogoProps) {
  const uid = useId().replace(/:/g, "");
  const { width, height } = SIZE_MAP[size];
  const rootClass = cn(
    "alpha-connect-logo shrink-0",
    animated && "alpha-connect-logo--animated",
    size === "hero" && "alpha-connect-logo--hero",
    size === "lg" && "alpha-connect-logo--lg",
    className,
  );

  return (
    <div className={rootClass}>
      <svg width={width} height={height} viewBox="-95 -105 190 210" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id={`${uid}-shieldBody`} x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#1e3a22" />
            <stop offset="28%" stopColor="#142a18" />
            <stop offset="62%" stopColor="#0c1e10" />
            <stop offset="100%" stopColor="#060e08" />
          </linearGradient>
          <radialGradient id={`${uid}-sheen`} cx="32%" cy="22%" r="58%">
            <stop offset="0%" stopColor="#00ff50" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#00ff50" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#00ff50" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-bottomRef`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00ff50" stopOpacity="0" />
            <stop offset="100%" stopColor="#00ff50" stopOpacity="0.07" />
          </linearGradient>
          <linearGradient id={`${uid}-rimG`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff50" stopOpacity="1" />
            <stop offset="22%" stopColor="#00cc40" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#007820" stopOpacity="0.3" />
            <stop offset="78%" stopColor="#00cc40" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#00ff50" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id={`${uid}-ridgeG`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff50" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00ff50" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id={`${uid}-micG`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff70" />
            <stop offset="45%" stopColor="#00dd55" />
            <stop offset="100%" stopColor="#009933" />
          </linearGradient>
          <linearGradient id={`${uid}-micSheen`} x1="0%" y1="0%" x2="55%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${uid}-nodeG`} cx="35%" cy="28%" r="65%">
            <stop offset="0%" stopColor="#00ff70" />
            <stop offset="100%" stopColor="#008830" />
          </radialGradient>
          <linearGradient id={`${uid}-scanG`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff50" stopOpacity="0" />
            <stop offset="30%" stopColor="#00ff50" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#00ff50" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00ff50" stopOpacity="0" />
          </linearGradient>
          <filter id={`${uid}-blur3`}>
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id={`${uid}-blur5`}>
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id={`${uid}-blur8`}>
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <clipPath id={`${uid}-shieldClip`}>
            <path d="M0,-90 C20,-86 58,-72 74,-52 C80,-32 78,10 62,40 C46,62 24,78 0,90 C-24,78 -46,62 -62,40 C-78,10 -80,-32 -74,-52 C-58,-72 -20,-86 0,-90 Z" />
          </clipPath>
        </defs>

        {animated ? (
          <>
            <circle cx="0" cy="0" r="52" fill="none" stroke="#00ff50" strokeWidth="1.5" className="ac-logo-pulse-1" />
            <circle cx="0" cy="0" r="52" fill="none" stroke="#00ff50" strokeWidth="1" className="ac-logo-pulse-2" />
          </>
        ) : null}

        <ellipse cx="0" cy="-5" rx="75" ry="82" fill="#00ff50" fillOpacity="0.05" filter={`url(#${uid}-blur8)`} />

        <path
          d="M0,-90 C20,-86 58,-72 74,-52 C80,-32 78,10 62,40 C46,62 24,78 0,90 C-24,78 -46,62 -62,40 C-78,10 -80,-32 -74,-52 C-58,-72 -20,-86 0,-90 Z"
          fill="none"
          stroke="#00ff50"
          strokeWidth="8"
          strokeOpacity="0.2"
          filter={`url(#${uid}-blur5)`}
        />
        <path
          d="M0,-90 C20,-86 58,-72 74,-52 C80,-32 78,10 62,40 C46,62 24,78 0,90 C-24,78 -46,62 -62,40 C-78,10 -80,-32 -74,-52 C-58,-72 -20,-86 0,-90 Z"
          fill={`url(#${uid}-shieldBody)`}
        />
        <path
          d="M0,-90 C20,-86 58,-72 74,-52 C80,-32 78,10 62,40 C46,62 24,78 0,90 C-24,78 -46,62 -62,40 C-78,10 -80,-32 -74,-52 C-58,-72 -20,-86 0,-90 Z"
          fill={`url(#${uid}-sheen)`}
        />
        <path
          d="M0,-90 C20,-86 58,-72 74,-52 C80,-32 78,10 62,40 C46,62 24,78 0,90 C-24,78 -46,62 -62,40 C-78,10 -80,-32 -74,-52 C-58,-72 -20,-86 0,-90 Z"
          fill={`url(#${uid}-bottomRef)`}
        />

        {animated ? (
          <g clipPath={`url(#${uid}-shieldClip)`}>
            <rect x="-74" y="-2" width="148" height="2.5" fill={`url(#${uid}-scanG)`} className="ac-logo-scan" />
          </g>
        ) : null}

        <path
          d="M0,-80 C17,-76 50,-64 64,-46 C70,-28 68,8 54,34 C40,54 20,68 0,78 C-20,68 -40,54 -54,34 C-68,8 -70,-28 -64,-46 C-50,-64 -17,-76 0,-80 Z"
          fill="none"
          stroke={`url(#${uid}-ridgeG)`}
          strokeWidth="1"
        />

        <line x1="0" y1="-55" x2="-36" y2="34" stroke="#00ff50" strokeWidth="1.2" className={animated ? "ac-logo-conn-1" : undefined} strokeOpacity={animated ? 1 : 0.45} />
        <line x1="0" y1="-55" x2="36" y2="34" stroke="#00ff50" strokeWidth="1.2" className={animated ? "ac-logo-conn-2" : undefined} strokeOpacity={animated ? 1 : 0.45} />
        <line x1="-36" y1="34" x2="36" y2="34" stroke="#00ff50" strokeWidth="1.2" className={animated ? "ac-logo-conn-3" : undefined} strokeOpacity={animated ? 1 : 0.45} />

        <circle cx="0" cy="-55" r="9" fill="#00ff50" fillOpacity="0.2" filter={`url(#${uid}-blur3)`} />
        <circle cx="-36" cy="34" r="9" fill="#00ff50" fillOpacity="0.2" filter={`url(#${uid}-blur3)`} />
        <circle cx="36" cy="34" r="9" fill="#00ff50" fillOpacity="0.2" filter={`url(#${uid}-blur3)`} />

        <circle cx="0" cy="-55" r="5" fill={`url(#${uid}-nodeG)`} className={animated ? "ac-logo-node-a" : undefined} />
        <circle cx="-36" cy="34" r="5" fill={`url(#${uid}-nodeG)`} className={animated ? "ac-logo-node-b" : undefined} />
        <circle cx="36" cy="34" r="5" fill={`url(#${uid}-nodeG)`} className={animated ? "ac-logo-node-c" : undefined} />

        <g className={animated ? "ac-logo-mic" : undefined}>
          {size !== "sm" ? (
            <>
              <path d="M -20,-12 C -25,-7 -25,3 -20,8" fill="none" stroke="#00ff50" strokeWidth="2" strokeLinecap="round" strokeDasharray="24" className={animated ? "ac-logo-arc-l1" : undefined} strokeOpacity={animated ? 1 : 0.8} />
              <path d="M -28,-18 C -36,-11 -36,7 -28,14" fill="none" stroke="#00ff50" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="40" className={animated ? "ac-logo-arc-l2" : undefined} strokeOpacity={animated ? 1 : 0.6} />
              <path d="M -36,-24 C -47,-15 -47,11 -36,20" fill="none" stroke="#00ff50" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="56" className={animated ? "ac-logo-arc-l3" : undefined} strokeOpacity={animated ? 1 : 0.45} />
              <path d="M 20,-12 C 25,-7 25,3 20,8" fill="none" stroke="#00ff50" strokeWidth="2" strokeLinecap="round" strokeDasharray="24" className={animated ? "ac-logo-arc-r1" : undefined} strokeOpacity={animated ? 1 : 0.8} />
              <path d="M 28,-18 C 36,-11 36,7 28,14" fill="none" stroke="#00ff50" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="40" className={animated ? "ac-logo-arc-r2" : undefined} strokeOpacity={animated ? 1 : 0.6} />
              <path d="M 36,-24 C 47,-15 47,11 36,20" fill="none" stroke="#00ff50" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="56" className={animated ? "ac-logo-arc-r3" : undefined} strokeOpacity={animated ? 1 : 0.45} />
            </>
          ) : (
            <>
              <path d="M -20,-12 C -25,-7 -25,3 -20,8" fill="none" stroke="#00ff50" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.8" />
              <path d="M 20,-12 C 25,-7 25,3 20,8" fill="none" stroke="#00ff50" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.8" />
            </>
          )}

          <rect x="-10" y="-24" width="20" height="28" rx="10" fill="#00ff50" fillOpacity="0.18" filter={`url(#${uid}-blur3)`} />
          <rect x="-9" y="-23" width="18" height="26" rx="9" fill={`url(#${uid}-micG)`} />
          <rect x="-9" y="-23" width="18" height="26" rx="9" fill={`url(#${uid}-micSheen)`} />
          <rect x="-9" y="-23" width="18" height="26" rx="9" fill="none" stroke="#00ff70" strokeWidth="0.8" strokeOpacity="0.55" />
          <path d="M -14,4 C -14,16 14,16 14,4" fill="none" stroke={`url(#${uid}-micG)`} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="0" y1="16" x2="0" y2="24" stroke={`url(#${uid}-micG)`} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="-8" y1="24" x2="8" y2="24" stroke={`url(#${uid}-micG)`} strokeWidth="2.6" strokeLinecap="round" />
        </g>

        <path
          d="M0,-90 C20,-86 58,-72 74,-52 C80,-32 78,10 62,40 C46,62 24,78 0,90 C-24,78 -46,62 -62,40 C-78,10 -80,-32 -74,-52 C-58,-72 -20,-86 0,-90 Z"
          fill="none"
          stroke={`url(#${uid}-rimG)`}
          strokeWidth="2.6"
        />
        <path
          d="M0,-90 C20,-86 58,-72 74,-52 C80,-32"
          fill="none"
          stroke="#00ff50"
          strokeWidth="1.6"
          strokeOpacity="0.95"
          strokeLinecap="round"
        />

        {animated && size !== "sm" ? (
          <>
            <g className="ac-logo-spark-1">
              <circle cx="60" cy="-68" r="2" fill="#00ff50" />
              <line x1="60" y1="-74" x2="60" y2="-62" stroke="#00ff50" strokeWidth="0.9" strokeOpacity="0.7" />
              <line x1="54" y1="-68" x2="66" y2="-68" stroke="#00ff50" strokeWidth="0.9" strokeOpacity="0.7" />
            </g>
            <g className="ac-logo-spark-2">
              <circle cx="-57" cy="-65" r="1.5" fill="#00ff50" />
              <line x1="-57" y1="-70" x2="-57" y2="-60" stroke="#00ff50" strokeWidth="0.8" strokeOpacity="0.6" />
              <line x1="-62" y1="-65" x2="-52" y2="-65" stroke="#00ff50" strokeWidth="0.8" strokeOpacity="0.6" />
            </g>
            <g className="ac-logo-spark-3">
              <circle cx="54" cy="56" r="1.5" fill="#00cc40" />
              <line x1="54" y1="51" x2="54" y2="61" stroke="#00cc40" strokeWidth="0.8" strokeOpacity="0.5" />
              <line x1="49" y1="56" x2="59" y2="56" stroke="#00cc40" strokeWidth="0.8" strokeOpacity="0.5" />
            </g>
          </>
        ) : null}
      </svg>
    </div>
  );
}

/** Nav / compact contexts — same v3 artwork, smaller. */
export function AlphaConnectShieldIcon({ className }: { className?: string }) {
  return <AlphaConnectLogo size="sm" animated={false} className={className} />;
}
