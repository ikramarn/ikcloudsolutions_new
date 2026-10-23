'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStartedHref } from '@/config/links';
import { HEADER_CTA_LABEL, headerItems } from '@/config/navigation';

/** Mobile drawer: a Radix Dialog (focus trap, Esc, scroll lock) with the same typed nav data. */
export function MobileNav() {
  const pathname = usePathname();
  // Remembering WHERE it was opened closes the drawer on navigation without an effect.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const close = () => setOpenPath(null);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => setOpenPath(next ? pathname : null)}>
      <Dialog.Trigger
        aria-label="Open menu"
        className="inline-flex size-11 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 lg:hidden"
      >
        <Menu aria-hidden="true" className="size-6" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          aria-describedby={undefined}
          className="glass-panel fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <Dialog.Title className="text-lg font-extrabold text-white">Menu</Dialog.Title>
            <Dialog.Close
              aria-label="Close menu"
              className="inline-flex size-11 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10"
            >
              <X aria-hidden="true" className="size-6" />
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile">
            <ul className="space-y-1">
              {headerItems.map((item) => (
                <li key={item.label}>
                  {item.groups ? (
                    <div className="py-2">
                      <p className="flex items-center gap-2 px-3 text-sm font-bold text-white">
                        {item.label}
                        {item.badge ? <Badge tone="new">{item.badge}</Badge> : null}
                      </p>
                      {item.groups.map((group) => (
                        <div key={group.heading} className="mt-3">
                          <p className="px-3 font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
                            {group.heading}
                          </p>
                          <ul>
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  onClick={close}
                                  className="flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-200 hover:bg-white/10"
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : item.href ? (
                    <Link
                      href={item.href}
                      onClick={close}
                      className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-white hover:bg-white/10"
                    >
                      {item.label}
                      {item.badge ? <Badge tone="demo">{item.badge}</Badge> : null}
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6">
            <Button href={getStartedHref()} onClick={close} className="w-full">
              {HEADER_CTA_LABEL}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
