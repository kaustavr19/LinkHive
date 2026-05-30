import { useUI } from '@/store/useUI';
import { PlusIcon } from '@/components/icons';
import type { Category } from '@/types/link';
import { CATEGORY_META } from '@/theme/categories';

// Mobile FAB for the primary "Add link" action. Tinted to the active category
// when inside a single-category view (per the brief).
export function Fab({ category }: { category?: Category }) {
  const openAdd = useUI((s) => s.openAdd);
  const tint = category && category !== 'uncategorized' ? CATEGORY_META[category].accentBar : 'bg-primary';

  return (
    <button
      type="button"
      onClick={openAdd}
      aria-label="Add link"
      className={`fixed bottom-20 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full text-on-primary shadow-fab transition-transform active:scale-95 ${tint}`}
    >
      <PlusIcon className="h-6 w-6" />
    </button>
  );
}
