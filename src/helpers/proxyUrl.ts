/**
 * Rewrites an absolute external URL through a CORS proxy endpoint when one is
 * configured via NEXT_PUBLIC_CORS_PROXY_PATH (the standalone thorium-web app
 * sets it to its own /api/proxy route). Without it, URLs are returned
 * unchanged — hosts embedding thorium-web as a library have no such route and
 * typically serve covers from CORS-enabled or same-origin locations.
 * Relative and non-http(s) URLs are always returned unchanged.
 */
export const proxyUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;

  const proxyPath = process.env.NEXT_PUBLIC_CORS_PROXY_PATH;
  if (!proxyPath) return url;

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return `${ proxyPath }?url=${ encodeURIComponent(url) }`;
    }
  } catch {
    // relative or invalid — return as-is
  }

  return url;
}
