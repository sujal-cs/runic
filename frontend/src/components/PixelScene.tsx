import { useId } from "react";

/**
 * Decorative pixel-art landscape used inside the editorial panels.
 *
 * Everything is inline SVG so the art scales cleanly, follows the page width,
 * and adds no image requests. `shapeRendering="crispEdges"` keeps the stepped
 * 8-bit silhouette instead of smoothing it into vector curves.
 */
export default function PixelScene({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const sky = `sky-${uid}`;
  const sun = `sun-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 1200 320"
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b74ff" />
          <stop offset="100%" stopColor="#6fa1ff" />
        </linearGradient>
        <linearGradient id={sun} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9a3" />
          <stop offset="100%" stopColor="#ffd166" />
        </linearGradient>
      </defs>

      <rect width="1200" height="320" fill={`url(#${sky})`} />

      {/* Sun, built from stacked blocks to keep the pixel silhouette. */}
      <g fill={`url(#${sun})`}>
        <rect x="966" y="42" width="68" height="68" />
        <rect x="954" y="54" width="92" height="44" />
        <rect x="978" y="30" width="44" height="92" />
      </g>

      {/* Clouds */}
      <g fill="#ffffff" opacity="0.9">
        <g transform="translate(120 58)">
          <rect x="0" y="14" width="104" height="14" />
          <rect x="14" y="7" width="76" height="10" />
          <rect x="34" y="0" width="38" height="10" />
          <rect x="8" y="28" width="118" height="8" />
        </g>
        <g transform="translate(420 34) scale(0.72)">
          <rect x="0" y="14" width="104" height="14" />
          <rect x="14" y="7" width="76" height="10" />
          <rect x="34" y="0" width="38" height="10" />
          <rect x="8" y="28" width="118" height="8" />
        </g>
        <g transform="translate(790 96) scale(1.18)">
          <rect x="0" y="14" width="104" height="14" />
          <rect x="14" y="7" width="76" height="10" />
          <rect x="34" y="0" width="38" height="10" />
          <rect x="8" y="28" width="118" height="8" />
        </g>
      </g>

      {/* Distant tree line */}
      <g fill="#2a7a44">
        <rect x="0" y="196" width="1200" height="28" />
        <rect x="60" y="184" width="26" height="12" />
        <rect x="70" y="172" width="10" height="12" />
        <rect x="300" y="186" width="34" height="10" />
        <rect x="312" y="174" width="12" height="12" />
        <rect x="610" y="182" width="28" height="14" />
        <rect x="620" y="170" width="10" height="12" />
        <rect x="900" y="186" width="40" height="10" />
        <rect x="914" y="174" width="12" height="12" />
      </g>

      {/* Field */}
      <rect x="0" y="224" width="1200" height="96" fill="#2f8f4a" />
      <rect x="0" y="224" width="1200" height="8" fill="#49b563" />
      <g fill="#25783c">
        <rect x="0" y="252" width="1200" height="4" />
        <rect x="0" y="286" width="1200" height="4" />
        <rect x="120" y="238" width="8" height="12" />
        <rect x="360" y="246" width="8" height="14" />
        <rect x="640" y="236" width="8" height="12" />
        <rect x="880" y="250" width="8" height="14" />
        <rect x="1080" y="240" width="8" height="12" />
      </g>

      {/* Pixel pines */}
      <g fill="#1d6b35">
        <g transform="translate(180 176)">
          <rect x="14" y="40" width="8" height="12" />
          <rect x="4" y="28" width="28" height="12" />
          <rect x="8" y="16" width="20" height="12" />
          <rect x="12" y="4" width="12" height="12" />
        </g>
        <g transform="translate(1040 168) scale(1.15)">
          <rect x="14" y="40" width="8" height="12" />
          <rect x="4" y="28" width="28" height="12" />
          <rect x="8" y="16" width="20" height="12" />
          <rect x="12" y="4" width="12" height="12" />
        </g>
      </g>

      {/* Flowers */}
      <g fill="#ffe9a3">
        <rect x="520" y="262" width="5" height="5" />
        <rect x="700" y="272" width="5" height="5" />
        <rect x="860" y="258" width="5" height="5" />
        <rect x="400" y="286" width="5" height="5" />
      </g>
    </svg>
  );
}
