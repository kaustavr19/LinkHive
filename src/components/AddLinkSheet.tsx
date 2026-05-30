import { useEffect, useMemo, useState } from 'react';
import type { Category } from '@/types/link';
import { CATEGORIES } from '@/types/link';
import { CATEGORY_META } from '@/theme/categories';
import { categorize } from '@/lib/categorize';
import { useLinks } from '@/store/useLinks';
import { useUI } from '@/store/useUI';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { CategoryIcon } from '@/components/CategoryIcon';
import { CloseIcon, LinkIcon, PlusIcon } from '@/components/icons';

// Pull the real title out of pasted rich text (text/html). Prefers the anchor
// matching the pasted URL, else the first anchor, else the document <title>.
// Ignores text that is just a URL. Fully offline. Returns null when unavailable.
function extractTitleFromHtml(html: string, pastedUrl: string): string | null {
  if (!html) return null;
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const anchors = Array.from(doc.querySelectorAll('a[href]'));
    const match = anchors.find((a) => a.getAttribute('href') === pastedUrl) ?? anchors[0];
    const candidates = [match?.textContent, doc.querySelector('title')?.textContent];
    for (const raw of candidates) {
      const text = raw?.trim();
      if (text && text !== pastedUrl && !/^https?:\/\//i.test(text)) return text;
    }
    return null;
  } catch {
    return null;
  }
}

// Add-link sheet (mobile) / modal (desktop). URL → live auto-detected, editable
// category + name → Save. Save is optimistic: the link is written instantly
// (saveRaw → categorizeRecord), then user overrides are applied as edits while
// an async oEmbed title upgrade (enrich) may refine the name shortly after.
export function AddLinkSheet() {
  const isDesktop = useIsDesktop();
  const addOpen = useUI((s) => s.addOpen);
  const closeAdd = useUI((s) => s.closeAdd);
  const showToast = useUI((s) => s.showToast);
  const addLink = useLinks((s) => s.addLink);
  const rename = useLinks((s) => s.rename);
  const setCategory = useLinks((s) => s.setCategory);

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  // Tier 2: a real title lifted from the clipboard's rich text on paste. Takes
  // precedence over the URL heuristic, but yields to an explicit user edit.
  const [pastedTitle, setPastedTitle] = useState<string | null>(null);
  const [categoryOverride, setCategoryOverride] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  // Live auto-detect from the pasted URL (pure, instant — no network).
  const preview = useMemo(() => (url.trim() ? categorize(url) : null), [url]);
  const effectiveCategory: Category = categoryOverride ?? preview?.category ?? 'uncategorized';

  // Name precedence: user edit > pasted title > URL heuristic.
  useEffect(() => {
    if (!nameEdited && !pastedTitle) setName(preview?.name ?? '');
  }, [preview, nameEdited, pastedTitle]);

  // Reset everything whenever the sheet closes.
  useEffect(() => {
    if (!addOpen) {
      setUrl('');
      setName('');
      setNameEdited(false);
      setPastedTitle(null);
      setCategoryOverride(null);
      setSaving(false);
    }
  }, [addOpen]);

  // Tier 2: when a link is pasted, the clipboard often carries text/html whose
  // anchor text is the real page title — fully offline. Capture it if present.
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const plain = e.clipboardData.getData('text/plain').trim();
    if (!plain) return; // let the default paste happen
    e.preventDefault();
    setUrl(plain);
    const title = extractTitleFromHtml(e.clipboardData.getData('text/html'), plain);
    if (title) {
      setPastedTitle(title);
      setName(title);
      setNameEdited(false);
    } else {
      setPastedTitle(null);
    }
  }

  if (!addOpen) return null;

  const canSave = url.trim().length > 0 && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    const created = await addLink(url.trim());
    // Only override the name when the user actually supplied one (typed edit or
    // pasted title). Otherwise leave it to auto-detect — including the async
    // oEmbed upgrade that may land a moment after save.
    const userName = name.trim();
    const userProvidedName = nameEdited || pastedTitle !== null;
    if (userProvidedName && userName && userName !== created.name) {
      await rename(created.id, userName);
    }
    if (effectiveCategory !== created.category) {
      await setCategory(created.id, effectiveCategory);
    }
    showToast('Link saved');
    closeAdd();
  }

  const panel = (
    <div
      className={
        isDesktop
          ? 'w-full max-w-lg rounded-xl bg-surface p-6 shadow-card-hover'
          : 'w-full rounded-t-xl bg-surface p-5 pb-8 shadow-card-hover'
      }
      onClick={(e) => e.stopPropagation()}
    >
      {!isDesktop && <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />}

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-headline-md text-ink">{isDesktop ? 'Add new link' : 'Save Link'}</h2>
        <button
          type="button"
          onClick={closeAdd}
          aria-label="Close"
          className="rounded-md p-1 text-ink-muted hover:text-ink"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      {/* URL */}
      <label className="mb-1 block text-label-sm uppercase tracking-wide text-ink-muted">URL</label>
      <div className="flex items-center gap-2 rounded-md border border-line px-3 focus-within:border-primary">
        <LinkIcon className="h-4 w-4 shrink-0 text-ink-muted" />
        <input
          autoFocus
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setPastedTitle(null); // typing invalidates a captured paste title
          }}
          onPaste={handlePaste}
          placeholder="https://…"
          className="w-full bg-transparent py-2.5 text-body-base text-ink outline-none placeholder:text-ink-muted"
        />
      </div>

      {/* Title */}
      <label className="mb-1 mt-4 block text-label-sm uppercase tracking-wide text-ink-muted">
        Title
      </label>
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setNameEdited(true);
        }}
        placeholder="Auto-filled from the link"
        className="w-full rounded-md border border-line bg-transparent px-3 py-2.5 text-body-base text-ink outline-none placeholder:text-ink-muted focus:border-primary"
      />

      {/* Category (auto-detected, editable) */}
      <div className="mb-2 mt-4 flex items-center gap-2">
        <span className="text-label-sm uppercase tracking-wide text-ink-muted">Category</span>
        {preview && !categoryOverride && (
          <span className="text-label-xs text-ink-muted">(auto-detected)</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const isActive = effectiveCategory === c;
          const meta = CATEGORY_META[c];
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryOverride(c)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-body-medium transition-colors ${
                isActive
                  ? `${meta.tint} ${meta.text} border-transparent`
                  : 'border-line text-ink-muted hover:text-ink'
              }`}
            >
              <CategoryIcon category={c} className="h-3.5 w-3.5" />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          FUTURE (v2): TAG SELECTOR plugs in HERE.
          The data model already carries `tags: string[]` (indexed into
          searchBlob), so this is purely a UI add — no migration. Stubbed for v1
          because retrieval, not tagging, is the priority and a half-built tag UI
          is worse than none.

          <label>TAGS (optional)</label>
          <TagInput value={tags} onChange={setTags} />  // comma-separated chips
          …then pass `tags` through to a store action on save.
          ─────────────────────────────────────────────────────────────────────── */}

      <div className="mt-6 flex items-center justify-end gap-3">
        {isDesktop && (
          <button
            type="button"
            onClick={closeAdd}
            className="rounded-lg px-4 py-2.5 text-body-medium text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className={`flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-body-medium text-on-primary transition-opacity ${
            canSave ? 'hover:opacity-90' : 'opacity-40'
          } ${isDesktop ? '' : 'flex-1'}`}
        >
          <PlusIcon className="h-4 w-4" /> Save Link
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-40 flex bg-black/40 ${
        isDesktop ? 'items-center justify-center p-4' : 'items-end'
      }`}
      onClick={closeAdd}
      role="dialog"
      aria-modal="true"
      aria-label="Add link"
    >
      {panel}
    </div>
  );
}
