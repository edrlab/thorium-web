import { useState, useEffect, useRef } from "react";
import { useCoverUrlResolver } from "@/core/Hooks/useCoverUrlResolver";

export const useCoverBlobUrl = (coverUrl: string | undefined): { coverBlobUrl: string | undefined; coverReady: boolean } => {
  const [coverBlobUrl, setCoverBlobUrl] = useState<string | undefined>(undefined);
  const [coverFailed, setCoverFailed] = useState(false);
  const revokeRef = useRef<(() => void) | undefined>(undefined);
  const resolveCoverUrl = useCoverUrlResolver();

  useEffect(() => {
    if (!coverUrl) return;
    const fetched = resolveCoverUrl(coverUrl) ?? coverUrl;

    // Deliberately not aborted on cleanup: aborting this fetch on unmount
    // (React StrictMode's dev double-mount does this immediately) poisons
    // Chromium's cache entry for the URL, making every subsequent fetch of
    // the same URL fail instantly. The cover is small — let the request
    // finish and just discard the result if the effect was cleaned up.
    let cancelled = false;
    fetch(fetched)
      .then(r => {
        if (!r.ok) throw new Error(`Cover request failed: ${ r.status }`);
        return r.blob();
      })
      .then(blob => {
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(blob);
        revokeRef.current = () => URL.revokeObjectURL(objectUrl);
        setCoverBlobUrl(objectUrl);
      })
      .catch(() => {
        if (cancelled) return;
        setCoverFailed(true);
      });
    return () => {
      cancelled = true;
      revokeRef.current?.();
      revokeRef.current = undefined;
    };
  }, [coverUrl, resolveCoverUrl]);

  return {
    coverBlobUrl,
    coverReady: !coverUrl || !!coverBlobUrl || coverFailed,
  };
};
