import katamerosReadingBg from "@/assets/katameros-reading-bg.png";

import type { KatamerosCurvePreviewVariant } from "@/features/katameros/katameros-curve-preview";

import {

  alphaTopDebugBorderStyle,

  isAlphaTopDebugActive,

  useAlphaTopDebugTarget,

} from "@/components/alpha/alpha-top-debug";



type KatamerosScreenBackgroundProps = {

  /** Preview-only — omit for production behaviour. */

  previewVariant?: KatamerosCurvePreviewVariant | null;

  /** fixed = full viewport (production). absolute = inside dev phone frame. */

  scope?: "fixed" | "absolute";

};



/**

 * Full-screen parchment background for all Katameros screens.

 * Same layering as ControlCenterScreenBackground — fixed cover + light tint.

 */

export function KatamerosScreenBackground({

  previewVariant,

  scope = "fixed",

}: KatamerosScreenBackgroundProps = {}) {

  const topDebug = useAlphaTopDebugTarget();

  const pngBgActive = isAlphaTopDebugActive(7, topDebug);

  const pngBorder = alphaTopDebugBorderStyle(pngBgActive);

  const positionClass =

    scope === "fixed" ? "pointer-events-none fixed inset-0 -z-10 overflow-hidden" : "pointer-events-none absolute inset-0 z-0 overflow-hidden";



  /* Variant A — hide PNG (flat shell only) */

  if (previewVariant === "a") {

    return (

      <div

        aria-hidden

        data-alpha-png-bg

        data-alpha-top-debug={pngBgActive ? "png-background" : undefined}

        className={positionClass}

        data-katameros-bg-preview="a"

        style={{ backgroundColor: "#f4ead8", ...pngBorder }}

      />

    );

  }



  return (

    <div

      aria-hidden

      data-alpha-png-bg

      data-alpha-top-debug={pngBgActive ? "png-background" : undefined}

      className={positionClass}

      data-katameros-bg-preview={previewVariant ?? "production"}

      style={pngBorder}

    >

      <img

        src={katamerosReadingBg}

        alt=""

        className="absolute inset-0 h-full w-full object-cover object-center"

        decoding="async"

      />

      <div className="absolute inset-0 bg-[#f5edd8]/08" />

    </div>

  );

}


