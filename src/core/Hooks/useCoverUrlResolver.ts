"use client";

import { createContext, useCallback, useContext } from "react";

/**
 * Rewrites an absolute http(s) cover URL before it is fetched, e.g. to route
 * it through a CORS proxy, sign it, or point it at a CDN.
 */
export type ThCoverUrlResolver = (url: string) => string;

export const ThCoverUrlResolverContext = createContext<ThCoverUrlResolver | undefined>(undefined);

/**
 * Returns a function applying the resolver from ThCoverUrlResolverContext.
 * Without one, URLs are returned unchanged. Relative, blob: and other
 * non-http(s) URLs are never passed to the resolver.
 */
export const useCoverUrlResolver = () => {
  const resolver = useContext(ThCoverUrlResolverContext);

  return useCallback((url: string | undefined): string | undefined => {
    if (!url || !resolver) return url;

    try {
      const parsed = new URL(url);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return resolver(url);
      }
    } catch {
      // relative or invalid — return as-is
    }

    return url;
  }, [resolver]);
};
