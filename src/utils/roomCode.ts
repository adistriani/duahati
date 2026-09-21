// Utility to normalize room codes on the client
// Handles user typos, mobile keyboard en-dashes / em-dashes, spaces, prefixes, etc.
export function normalizeRoomCode(input: string): string {
  if (!input) return '';
  let str = input.trim();
  // Strip "kode ruang:", "room code:", etc.
  str = str.replace(/^(kode|room)\s*(ruang|code)?\s*[:=-]?\s*/i, '');
  // Normalize all unicode hyphens/dashes to standard ASCII '-'
  str = str.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u002D]/g, '-');
  // Remove whitespace
  str = str.replace(/\s+/g, '').toUpperCase();
  // Ensure US- prefix
  if (str.startsWith('US') && !str.startsWith('US-')) {
    str = 'US-' + str.slice(2);
  }
  if (!str.startsWith('US-') && str.length >= 4) {
    str = 'US-' + str;
  }
  return str;
}
