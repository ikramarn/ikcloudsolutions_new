'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStartedHref } from '@/config/links';
import { HEADER_CTA_LABEL, type NavItem } from '@/config/navigation';

/**
 * Disclosure pattern (not role="menu"): a button with aria-expanded/aria-controls toggles a
 * panel of ordinary links. Esc closes and returns focus to the button; the panel also closes
 * when focus leaves it, when the visitor clicks elsewhere, and on route change. The panel stays
 * in the server HTML (hidden) so its links are crawlable.
 */
export function MegaMenu({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Remembering WHERE it was opened closes the menu on navigation without an effect.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  const close = () => setOpenPath(null);

  const onKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.key === 'Escape' && open) {
      event.stopPropagation();
      close();
      buttonRef.current?.focus();
    }
  };

  const onBlur = (event: FocusEvent<HTMLLIElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    close();
  };

  return (
    <li className="relative" onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpenPath(open ? null : pathname)}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-200 hover:text-white"
      >
        {item.label}
        {item.badge ? <Badge tone="new">{item.badge}</Badge> : null}
        <ChevronDown
          aria-hidden="true"
          className={
            open ? 'size-4 rotate-180 transition-transform' : 'size-4 transition-transform'
          }
        />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="glass-panel-glow absolute top-full left-1/2 z-50 mt-2 w-[44rem] max-w-[90vw] -translate-x-1/2 rounded-2xl p-6"
      >
        <div className="grid gap-8 sm:grid-cols-[3fr_2fr]">
          {item.groups?.map((group) => (
            <div key={group.heading}>
              <p className="mb-3 font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
                {group.heading}
              </p>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      className="block min-h-11 rounded-lg px-3 py-2 hover:bg-white/10"
                    >
                      <span className="block text-sm font-semibold text-white">{link.label}</span>
                      {link.description ? (
                        <span className="block text-sm text-slate-300">{link.description}</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
          <Button href={getStartedHref()} size="sm" onClick={close}>
            {HEADER_CTA_LABEL}
          </Button>
        </div>
      </div>
    </li>
  );
}
