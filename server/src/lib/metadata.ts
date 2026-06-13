import { parse } from 'node-html-parser';

export interface Metadata {
  title: string | null;
  image: string | null;
  description: string | null;
}

const TIMEOUT_MS = 8000;
const MAX_HTML_SIZE = 1024 * 512;

export async function scrapeMetadata(url: string): Promise<Metadata> {
  const empty: Metadata = { title: null, image: null, description: null };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'LinkHive-Bot/1.0 (+https://linkhive.app)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });
    clearTimeout(timer);

    if (!res.ok) return empty;

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return empty;

    const html = await res.text();
    if (html.length > MAX_HTML_SIZE) {
      const headEnd = html.indexOf('</head>');
      if (headEnd === -1) return empty;
      return parseHead(html.slice(0, headEnd + 7), url);
    }

    return parseHead(html, url);
  } catch {
    return empty;
  }
}

function parseHead(html: string, baseUrl: string): Metadata {
  const root = parse(html);

  const ogTitle = getMeta(root, 'og:title');
  const ogImage = getMeta(root, 'og:image');
  const ogDesc = getMeta(root, 'og:description');

  const title = ogTitle || root.querySelector('title')?.textContent?.trim() || null;
  const image = ogImage ? resolveUrl(ogImage, baseUrl) : null;
  const description = ogDesc || getMeta(root, 'description') || null;

  return { title, image, description };
}

function getMeta(root: ReturnType<typeof parse>, property: string): string | null {
  const el =
    root.querySelector(`meta[property="${property}"]`) ||
    root.querySelector(`meta[name="${property}"]`);
  const content = el?.getAttribute('content')?.trim();
  return content || null;
}

function resolveUrl(url: string, base: string): string | null {
  try {
    return new URL(url, base).href;
  } catch {
    return null;
  }
}
