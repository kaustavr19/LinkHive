import type { JobStatus } from '@/types/link';
import { STATUS_META } from '@/theme/categories';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from './icons';

const ICON: Record<JobStatus, (p: { className?: string }) => JSX.Element> = {
  applied: CheckCircleIcon,
  not_applied: ClockIcon,
  rejected: XCircleIcon,
};

interface StatusPillProps {
  status: JobStatus;
  // Mobile cards cycle on tap; desktop uses discrete pills. When onClick is
  // provided the pill is an actual button.
  onClick?: () => void;
  // Solid (filled) variant for the active/selected look; otherwise tinted.
  solid?: boolean;
}

export function StatusPill({ status, onClick, solid }: StatusPillProps) {
  const meta = STATUS_META[status];
  const Icon = ICON[status];
  const cls = solid ? meta.solid : `${meta.tint} ${meta.text}`;
  const common = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm font-medium ${cls}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${common} transition-colors`}
        aria-label={`Status: ${meta.label}. Tap to change.`}
      >
        <Icon className="h-3.5 w-3.5" />
        {meta.label}
      </button>
    );
  }

  return (
    <span className={common}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}
