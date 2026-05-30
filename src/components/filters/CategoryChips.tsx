import { useNavigate } from 'react-router-dom';
import type { Category } from '@/types/link';
import { CATEGORIES } from '@/types/link';
import { CATEGORY_META } from '@/theme/categories';

// Mobile horizontal filter rail. The active chip is filled — with the category
// color in a single-category view, or solid primary for "All".
export function CategoryChips({ active }: { active: Category | 'all' }) {
  const navigate = useNavigate();

  const chip = (key: Category | 'all', label: string) => {
    const isActive = active === key;
    const activeCls =
      key === 'all'
        ? 'bg-primary text-on-primary'
        : CATEGORY_META[key as Category].chipActive;
    return (
      <button
        key={key}
        type="button"
        onClick={() => navigate(key === 'all' ? '/' : `/category/${key}`)}
        className={`shrink-0 rounded-full border px-4 py-1.5 text-body-medium transition-colors ${
          isActive
            ? `${activeCls} border-transparent`
            : 'border-line bg-surface text-ink-muted hover:text-ink'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
      {chip('all', 'All')}
      {CATEGORIES.map((c) => chip(c, CATEGORY_META[c].label))}
    </div>
  );
}
