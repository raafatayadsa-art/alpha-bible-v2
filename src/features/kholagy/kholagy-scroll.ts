/** Picks the section whose vertical center is closest to the scroll viewport center. */
export function computeKholagyScrollState(root: HTMLElement, sectionIds: string[]) {
  const max = Math.max(0, root.scrollHeight - root.clientHeight);
  const progress = max > 0 ? root.scrollTop / max : 0;
  const rootRect = root.getBoundingClientRect();
  const centerY = rootRect.top + rootRect.height * 0.5;

  const fills = sectionIds.map((id) => {
    const el = root.querySelector(`[data-section-id="${CSS.escape(id)}"]`) as HTMLElement | null;
    if (!el) return 0;
    const elRect = el.getBoundingClientRect();
    const visible = Math.min(elRect.bottom, rootRect.bottom) - Math.max(elRect.top, rootRect.top);
    const ratio = visible / Math.max(1, elRect.height);
    const passed = elRect.top < rootRect.top + 80 ? 1 : 0;
    return Math.max(passed * 0.35, Math.min(1, ratio));
  });

  let activeId = sectionIds[0] ?? "";
  let bestDistance = Infinity;

  for (const id of sectionIds) {
    const el = root.querySelector(`[data-section-id="${CSS.escape(id)}"]`) as HTMLElement | null;
    if (!el) continue;
    const elRect = el.getBoundingClientRect();
    const elCenter = elRect.top + elRect.height * 0.5;
    const distance = Math.abs(elCenter - centerY);
    if (distance < bestDistance) {
      bestDistance = distance;
      activeId = id;
    }
  }

  return { progress, fills, activeId };
}
