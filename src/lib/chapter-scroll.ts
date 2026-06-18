/** Scroll helpers for chapter reader — works with AlphaScreenFrame (.alpha-viewport-scroll) or window. */

export function resolveScrollRoot(from: HTMLElement | null): HTMLElement {
  if (!from) return document.documentElement;
  const frame = from.closest(".alpha-viewport-scroll") as HTMLElement | null;
  return frame ?? document.documentElement;
}

export function scrollMetrics(root: HTMLElement) {
  const isDoc = root === document.documentElement || root === document.body;
  if (isDoc) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    return {
      y,
      max,
      pct: max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0,
    };
  }
  const max = root.scrollHeight - root.clientHeight;
  const y = root.scrollTop;
  return {
    y,
    max,
    pct: max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0,
  };
}

export function scrollToY(root: HTMLElement, y: number) {
  if (root === document.documentElement || root === document.body) {
    window.scrollTo({ top: y, behavior: "auto" });
    return;
  }
  root.scrollTo({ top: y, behavior: "auto" });
}

export function scrollToTop(root: HTMLElement) {
  scrollToY(root, 0);
}

export function scrollToBottom(root: HTMLElement) {
  scrollToY(root, scrollMetrics(root).max);
}

export function bindScroll(root: HTMLElement, handler: () => void) {
  const target: EventTarget = root === document.documentElement ? window : root;
  target.addEventListener("scroll", handler, { passive: true });
  return () => target.removeEventListener("scroll", handler);
}

/** Scroll progress (0–100) through a chapter article inside the scroll root. */
export function articleScrollProgress(root: HTMLElement, article: HTMLElement): number {
  const isDoc = root === document.documentElement || root === document.body;
  const scrollTop = isDoc ? window.scrollY : root.scrollTop;
  const viewportH = isDoc ? window.innerHeight : root.clientHeight;

  let top = 0;
  let el: HTMLElement | null = article;
  while (el && el !== root) {
    top += el.offsetTop;
    el = el.offsetParent as HTMLElement | null;
  }

  const height = article.offsetHeight;
  const start = top;
  const end = top + height - viewportH * 0.35;
  const max = end - start;
  if (max <= 0) return height <= viewportH ? 100 : 0;
  return Math.min(100, Math.max(0, ((scrollTop - start) / max) * 100));
}
