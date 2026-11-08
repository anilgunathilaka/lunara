import { notFound } from 'next/navigation';

/**
 * Component QA pages (docs/3-components.md §7) are a development tool,
 * not part of the shop. In production builds every /[locale]/dev/* route
 * is a 404 — they are not deployed as reachable pages. Use `next dev` to
 * reach them.
 */
export default function DevQaLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  return children;
}
