/** White glyph paths in 24×24 viewBox — centered via transform in renderer */
export const SYMBOL_PATHS: Record<string, string> = {
  angel:
    '<path d="M12 2c-1.5 2.5-4 3.5-6 3 1 2.5.5 5-1 7 1.5 1 3.5 1.5 5.5 1-1 2-1 4 1.5 5.5 2-1.5 2.5-3.5 2.5-5.5 2 .5 4 0 5.5-1-1.5-2-2-4.5-1-7-2 .5-4.5-.5-6-3z"/>',
  lion:
    '<path d="M6 8c0-3 2.5-5 6-5s6 2 6 5c2 1 3 3 3 5 0 3-2 5-5 6l-1 4h-6l-1-4c-3-1-5-3-5-6 0-2 1-4 3-5z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/>',
  ox:
    '<path d="M7 10c-2 0-3 1.5-3 3.5S6 17 8 17h8c2 0 4-1.5 4-3.5S18 10 16 10H7zm-1-2h12v2H6V8z"/><path d="M9 6h6v2H9V6z"/>',
  eagle:
    '<path d="M12 3L8 9h3l-2 6 3-3 3 3-2-6h3L12 3zm-6 14c2 2 4 3 6 3s4-1 6-3l-2 2c-1.5 1-3 1.5-4 1.5s-2.5-.5-4-1.5l-2-2z"/>',
  keys:
    '<circle cx="8" cy="12" r="3"/><path d="M11 12h8v2h-2v4h-2v-4h-2"/><circle cx="16" cy="8" r="2.5"/>',
  quill:
    '<path d="M4 20l8-2 6-6-4-4-6 6-2 8 4-2z"/><path d="M14 6l4 4"/>',
  crossHill:
    '<path d="M12 4v12M8 8h8"/><path d="M4 18c3-2 6-2 8-2s5 0 8 2"/>',
  column:
    '<path d="M9 4h6v2H9V4zm0 14h6v2H9v-2zm1-12h4v10h-4V6z"/><path d="M7 8h10v1H7V8zm0 8h10v1H7v-1z"/>',
  church:
    '<path d="M12 3v4M10 5h4"/><path d="M6 9h12v11H6V9zm3 3h6v5H9v-5z"/>',
  anchor:
    '<circle cx="12" cy="6" r="2"/><path d="M12 8v10M8 14h8M6 18c2 2 4 3 6 3s4-1 6-3"/>',
  crown:
    '<path d="M4 16l2-8 4 4 2-6 2 6 4-4 2 8H4z"/><path d="M5 18h14v2H5v-2z"/>',
  crownThorns:
    '<path d="M4 14l2-4 2 2 2-3 2 3 2-2 2 4H4z"/><path d="M6 16h12"/>',
  shield:
    '<path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z"/>',
  staff:
    '<path d="M12 3v14M9 6c2-1 4-1 6 0M9 10c2-1 4-1 6 0"/><circle cx="12" cy="19" r="2"/>',
  sword:
    '<path d="M6 18l8-8 2 2-8 8-2-2z"/><path d="M14 6l4-4 2 2-4 4"/>',
  handshake:
    '<path d="M4 12c2-1 4-1 6 0l2 2 4-2 4 2-2 4-6 2-4-2-2 2-4 0-2-2z"/>',
  veil:
    '<path d="M6 6h12v12H6V6zm2 2v8h8V8H8z"/><path d="M12 8v8" stroke="white" stroke-width="1.5" fill="none"/>',
  heartLight:
    '<path d="M12 20s-6-4-6-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5-6 9-6 9z"/><path d="M12 5v3M10 7h4"/>',
  seal:
    '<circle cx="12" cy="12" r="8"/><path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>',
  house:
    '<path d="M4 11l8-6 8 6v9H4v-9zm4 2h8v7H8v-7z"/>',
  faithShield:
    '<path d="M12 4l6 2v5c0 4-2.5 6.5-6 7.5C8.5 17.5 6 15 6 11V6l6-2z"/><path d="M10 11l2 2 4-4" stroke="white" stroke-width="1.5" fill="none"/>',
  creation:
    '<circle cx="12" cy="10" r="5"/><path d="M4 18c2-3 5-4 8-4s6 1 8 4"/><path d="M12 5V3M8 6L7 4M16 6l1-2"/>',
  staffSea:
    '<path d="M11 3v14M11 3c2 0 3 1 3 2.5S13 8 11 8"/><path d="M4 16c2-2 5-3 8-3s6 1 8 3"/>',
  altar:
    '<path d="M6 10h12v2H6v-2zm2 4h8v4H8v-4z"/><path d="M10 6h4v4h-4V6z"/>',
  tablets:
    '<rect x="5" y="4" width="6" height="14" rx="1"/><rect x="13" y="4" width="6" height="14" rx="1"/><path d="M7 8h2M7 11h2M15 8h2M15 11h2"/>',
  tent:
    '<path d="M4 18l8-12 8 12H4z"/><path d="M12 10v8"/>',
  trumpet:
    '<path d="M4 14h10l4-2v6l-4-2H4v-4z"/><path d="M18 12c1 1 1 3 0 4"/>',
  scales:
    '<path d="M12 4v16M6 8h12M8 8l-2 4h4l-2-4zm4 0l-2 4h4l-2-4z"/>',
  wheat:
    '<path d="M12 20V8M9 10c0-2 1.5-3 3-3s3 1 3 3M8 13c0-2 1.5-3 3-3M16 13c0-2-1.5-3-3-3M10 16c0-2 1-3 2-3s2 1 2 3"/>',
  oil:
    '<path d="M10 6c0-2 2-3 2-5 0 2 2 3 2 5v2H10V6z"/><path d="M8 10h8v8c0 2-2 3-4 3s-4-1-4-3v-8z"/>',
  throne:
    '<path d="M6 8h12v8H6V8zm2 2v4h8v-4H8z"/><path d="M8 16v2h8v-2M10 6h4v2h-4V6z"/>',
  scroll:
    '<path d="M7 6c-2 0-3 1-3 3v8c0 2 1 3 3 3h10c2 0 3-1 3-3V9c0-2-1-3-3-3H7z"/><path d="M9 10h6M9 13h4"/>',
  wall:
    '<path d="M4 8h4v4H4V8zm6 0h4v4h-4V8zm6 0h4v4h-4V8zM7 14h4v4H7v-4zm6 0h4v4h-4v-4z"/>',
  scepter:
    '<path d="M11 4v14M11 4l3-2 2 2-3 2"/><circle cx="11" cy="19" r="2"/><path d="M8 8h6"/>',
  ashes:
    '<path d="M8 8c0-2 2-4 4-4s4 2 4 4c2 0 3 2 3 4H5c0-2 1-4 3-4z"/><path d="M6 16h12v2H6v-2z"/>',
  harp:
    '<path d="M8 6v12M8 6c3 0 6 2 6 6s-3 6-6 6"/><path d="M10 9v6M13 10v4M15 11v2"/>',
  lamp:
    '<path d="M10 4h4v4c0 2-1 3-2 4v2h-2v6h-2v-6H8v-2c-1-1-2-2-2-4V4z"/>',
  sun:
    '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  rose:
    '<circle cx="12" cy="10" r="3"/><path d="M12 13c-3 2-5 5-5 8h10c0-3-2-6-5-8z"/><path d="M9 8l1 2M15 8l-1 2"/>',
  wing:
    '<path d="M4 14c3-4 6-5 8-5s5 1 8 5c-2-1-4-1.5-6-1-2-.5-4 0-6 1-2 1-3 2.5-4 4z"/><path d="M12 9V5"/>',
  vessel:
    '<path d="M9 6h6l-1 4c2 1 3 3 3 5 0 3-2 5-5 5s-5-2-5-5c0-2 1-4 3-5l-1-4z"/>',
  tears:
    '<path d="M12 4c-2 4-4 6-4 9a4 4 0 0 0 8 0c0-3-2-5-4-9z"/><path d="M10 16h4"/>',
  wheel:
    '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2"/>',
  lionDen:
    '<circle cx="9" cy="11" r="2"/><circle cx="15" cy="11" r="2"/><path d="M6 16c1-2 3-3 6-3s5 1 6 3"/><path d="M12 6v2"/>',
  covenant:
    '<path d="M12 20s-6-4-6-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5-6 9-6 9z"/><path d="M8 12h8"/>',
  locust:
    '<ellipse cx="12" cy="12" rx="5" ry="3"/><path d="M7 12H5M17 12h2M9 9l-2-2M15 9l2-2M9 15l-2 2M15 15l2 2"/>',
  plumb:
    '<path d="M12 4v12"/><circle cx="12" cy="18" r="2"/><path d="M10 8h4"/>',
  mountain:
    '<path d="M4 18l4-8 4 5 4-9 4 12H4z"/>',
  fish:
    '<ellipse cx="12" cy="12" rx="7" ry="4"/><path d="M5 12L3 10v4l2-2z"/><circle cx="14" cy="11" r="1"/>',
  watchtower:
    '<path d="M8 18V8l4-3 4 3v10H8z"/><path d="M10 11h4M10 14h4"/><path d="M12 5v1"/>',
  fire:
    '<path d="M12 4c-2 3-4 4-4 7a4 4 0 0 0 8 0c0-3-2-4-4-7z"/><path d="M12 14c-1 1-2 2-2 3h4c0-1-1-2-2-3z"/>',
  temple:
    '<path d="M5 9h14v9H5V9zm2 2v5h10v-5H7z"/><path d="M12 4v3M9 6h6"/>',
  lampstand:
    '<path d="M12 4v3M10 7h4M11 10h2v8h-2v-8z"/><path d="M8 18h8"/>',
  sunRays:
    '<circle cx="12" cy="12" r="3"/><path d="M12 4v2M12 20v-2M4 12h2M20 12h-2M6 6l1.5 1.5M16.5 16.5L18 18M6 18l1.5-1.5M16.5 7.5L18 6"/>',
  letter:
    '<rect x="5" y="6" width="14" height="12" rx="1"/><path d="M5 8l7 5 7-5"/>',
  chains:
    '<ellipse cx="8" cy="12" rx="3" ry="4"/><ellipse cx="16" cy="12" rx="3" ry="4"/><path d="M11 12h2"/>',
  dawn:
    '<path d="M4 16h16"/><path d="M12 6v6M8 10l4-4 4 4"/><path d="M6 14c2-2 4-3 6-3s4 1 6 3"/>',
  mirror:
    '<ellipse cx="12" cy="10" rx="5" ry="6"/><path d="M8 16h8v2H8v-2z"/>',
  lily:
    '<path d="M12 20V10M9 12c0-2 1.5-4 3-4s3 2 3 4M8 8c1-1 2.5-1 4 0M16 8c-1-1-2.5-1-4 0"/>',
  fishAnchor:
    '<circle cx="12" cy="7" r="2"/><path d="M12 9v8M9 14h6"/><ellipse cx="16" cy="14" rx="3" ry="2"/>',
  growth:
    '<path d="M12 20V10M8 14c0-3 2-5 4-5s4 2 4 5"/>',
};
