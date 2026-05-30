import { useUI } from '@/store/useUI';
import { HiveIcon, PlusIcon } from '@/components/icons';

// First-run / no-results empty state. Centered, muted, with an obvious CTA.
export function EmptyState({
  title = 'Your hive is empty',
  message = 'Paste a link to start saving and organizing your digital content.',
  showCta = true,
}: {
  title?: string;
  message?: string;
  showCta?: boolean;
}) {
  const openAdd = useUI((s) => s.openAdd);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="relative mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-surface-alt">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface shadow-card">
          <HiveIcon className="h-8 w-8 text-ink-muted" />
        </div>
      </div>
      <h2 className="text-headline-md text-ink">{title}</h2>
      <p className="mt-2 max-w-xs text-body-base text-ink-muted">{message}</p>
      {showCta && (
        <button
          type="button"
          onClick={openAdd}
          className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-body-medium text-on-primary transition-opacity hover:opacity-90"
        >
          <PlusIcon className="h-4 w-4" /> Add link
        </button>
      )}
    </div>
  );
}
