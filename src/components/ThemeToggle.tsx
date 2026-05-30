import { useTheme } from '@/theme/useTheme';
import { MoonIcon, SunIcon } from './icons';

export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="flex items-center gap-2 rounded-md p-2 text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
    >
      {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      {withLabel && <span className="text-body-medium">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>}
    </button>
  );
}
