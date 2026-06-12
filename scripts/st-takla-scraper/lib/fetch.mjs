import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";

const DEFAULT_HEADERS = {
  "User-Agent": "AlphaBibleScraper/1.0 (+https://github.com/alpha-bible; phase1-extraction)",
  Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ar,en;q=0.8",
};

export async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchHtml(url, options = {}) {
  const {
    retries = 2,
    delayMs = 400,
    cacheDir = null,
    cacheKey = null,
    timeoutMs = 45000,
  } = options;

  if (cacheDir && cacheKey) {
    const cachePath = `${cacheDir}/${cacheKey}.html`;
    if (existsSync(cachePath)) {
      return { html: await readFile(cachePath, "utf8"), url, fromCache: true };
    }
  }

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, {
        headers: DEFAULT_HEADERS,
        redirect: "follow",
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      const html = await res.text();
      if (!html || html.length < 200) {
        throw new Error(`Empty or tiny response (${html?.length ?? 0} bytes)`);
      }

      if (cacheDir && cacheKey) {
        const cachePath = `${cacheDir}/${cacheKey}.html`;
        await mkdir(dirname(cachePath), { recursive: true });
        await writeFile(cachePath, html, "utf8");
      }

      return { html, url, fromCache: false };
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await sleep(delayMs * attempt);
      }
    }
  }

  throw lastError;
}

export async function fetchWithRateLimit(url, options = {}) {
  const { minIntervalMs = 600, lastFetchAt = { t: 0 } } = options;
  const elapsed = Date.now() - lastFetchAt.t;
  if (elapsed < minIntervalMs) {
    await sleep(minIntervalMs - elapsed);
  }
  const result = await fetchHtml(url, options);
  lastFetchAt.t = Date.now();
  return result;
}
