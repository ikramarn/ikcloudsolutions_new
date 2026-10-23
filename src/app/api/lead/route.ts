import { createLeadDeps, handleLead, handleLeadOptions } from '@/lib/server/handler';

export const runtime = 'nodejs';
// Turnstile (4 s) plus the mail provider (8 s) is 12 s worst case. The headroom lets the handler
// return its documented 502/503 instead of a platform 504.
export const maxDuration = 20;

export async function POST(request: Request): Promise<Response> {
  return handleLead(request, createLeadDeps());
}

export function OPTIONS(): Response {
  return handleLeadOptions();
}
