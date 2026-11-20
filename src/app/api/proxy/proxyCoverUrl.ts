// Routes cover URLs through the app's own CORS proxy (see ./route.ts)
export const proxyCoverUrl = (url: string): string =>
  `/api/proxy?url=${ encodeURIComponent(url) }`;
