import Link from 'next/link';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { asRoute } from '@/config/links';

interface ChannelCardProps {
  channel: 'voice' | 'whatsapp';
  title: string;
  description: string;
  href: string;
}

/** The heading is an h3: the surrounding Section provides the h2. */
export function ChannelCard({ channel, title, description, href }: ChannelCardProps) {
  const Icon = channel === 'voice' ? Phone : MessageCircle;
  return (
    <Card className="flex h-full flex-col">
      <Icon aria-hidden="true" className="mb-3 size-7 text-cyan-300" />
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 flex-1 text-slate-300">{description}</p>
      <Link
        href={asRoute(href)}
        className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-cyan-300 hover:underline"
      >
        Learn more<span className="sr-only"> about the {title}</span>
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </Card>
  );
}
