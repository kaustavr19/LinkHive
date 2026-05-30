// ─────────────────────────────────────────────────────────────────────────────
// TIER 3 — oEmbed title fetch (the async refinement behind the `enrich` seam).
//
// A handful of providers (YouTube, Vimoe, …) expose oEmbed endpoints that return
// the *real* page title from a plain client-side fetch — no backend, no proxy.
// These are exactly the domains where our offline slug heuristic is weakest
// (e.g. youtube.com/watch?v=… → "Watch"). Everything here degrades to `null` on
// any failure (offline, CORS rejection, non-OK, timeout, parse error), so the
// heuristic name simply stands. Generic <og:title> for arbitrary sites is NOT
// here — that needs a CORS proxy / backend and is deferred until one exists.
//
// To add a provider: drop another entry in PROVIDERS. To later add generic OG
// fetching, add a fallback branch that hits a proxy you control.
// ─────────────────────────────────────────────────────────────────────────────

interface OEmbedProvider {
  match: (host: string) => boolean;
  endpoint: (url: string) => string;
  pickTitle: (json: Record<string, unknown>) => string | null;
}

const PROVIDERS: OEmbedProvider[] = [
  {
    match: (h) => /(^|\.)youtube\.com$/.test(h) || h === 'youtu.be',
    endpoint: (u) => `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(u)}`,
    pickTitle: (j) => asString(j.title),
  },
  {
    match: (h) => /(^|\.)vimeo\.com$/.test(h),
    endpoint: (u) => `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(u)}`,
    pickTitle: (j) => asString(j.title),
  },
];

const TIMEOUT_MS = 4000;

export async function fetchTitle(rawUrl: string): Promise<string | null> {
  // Offline → don't even try; the heuristic name is the right answer.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;

  let host: string;
  try {
    host = new URL(rawUrl).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }

  const provider = PROVIDERS.find((p) => p.match(host));
  if (!provider) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(provider.endpoint(rawUrl), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = (await res.json()) as Record<string, unknown>;
    const title = provider.pickTitle(json);
    return title && title.trim() ? title.trim() : null;
  } catch {
    return null; // CORS / network / abort / parse — keep the heuristic name
  }
}

function asString(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}
