import type { Category } from '@/types/link';
import type { SVGProps } from 'react';
import {
  BriefcaseIcon,
  UsersIcon,
  PlayIcon,
  FileTextIcon,
  InboxIcon,
} from './icons';

const MAP: Record<Category, (p: SVGProps<SVGSVGElement>) => JSX.Element> = {
  jobs: BriefcaseIcon,
  socials: UsersIcon,
  videos: PlayIcon,
  articles: FileTextIcon,
  uncategorized: InboxIcon,
};

export function CategoryIcon({
  category,
  ...props
}: { category: Category } & SVGProps<SVGSVGElement>) {
  const Cmp = MAP[category];
  return <Cmp {...props} />;
}
