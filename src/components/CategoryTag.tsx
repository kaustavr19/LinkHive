import type { Category } from '@/types/link';
import { CATEGORY_META } from '@/theme/categories';

// Color-coded pill: ~10% accent tint background, solid accent text. Used on
// cards in the All view and as the category label everywhere.
export function CategoryTag({ category }: { category: Category }) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-label-xs font-medium uppercase tracking-wide ${meta.tint} ${meta.text}`}
    >
      {meta.label}
    </span>
  );
}
