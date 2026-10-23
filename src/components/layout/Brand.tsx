import Link from 'next/link';
import { Cloud } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function Brand() {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className="flex min-h-11 items-center gap-3"
    >
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-indigo-600 p-0.5"
      >
        <span className="flex size-full items-center justify-center rounded-[10px] bg-slate-950">
          <Cloud className="size-5 text-cyan-300" />
        </span>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-white">
        IK CLOUD <span className="text-cyan-300">SOLUTIONS</span>
      </span>
    </Link>
  );
}
