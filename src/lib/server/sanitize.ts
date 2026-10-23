import 'server-only';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes every interpolated value in the HTML email body. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

/** Defence in depth for header-bound values: CR and LF become a space. */
export function stripCrlf(value: string): string {
  return value.replace(/[\r\n]+/g, ' ');
}
