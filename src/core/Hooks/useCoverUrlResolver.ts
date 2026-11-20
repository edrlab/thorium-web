"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useRef } from "react";

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
  // Read through a ref so inline resolvers don't change identity and refetch the cover
  const resolverRef = useRef(resolver);
  useLayoutEffect(() => { resolverRef.current = resolver; }, [resolver]);

  return useCallback((url: string | undefined): string | undefined => {
    const currentResolver = resolverRef.current;
    if (!url || !currentResolver) return url;

    try {
      const parsed = new URL(url);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return currentResolver(url);
      }
    } catch {
      // relative or invalid — return as-is
    }

    return url;
  }, []);
};
