"use client";

import { useCallback, useEffect, useState } from "react";
import { useIsClient } from "./useIsClient";
import { isIOSish } from "../Helpers/getPlatform";

export const useFullscreen = (onChange?: (isFullscreen: boolean) => void) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isClient, isClientRef } = useIsClient();
  const isSupported = isClient && !isIOSish() && Boolean(document.fullscreenEnabled);

  const handleFullscreen = useCallback(() => {
    if (!isClientRef.current || isIOSish()) return;

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, [isClientRef]);

  useEffect(() => {
    const onFSchange = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsFullscreen(isFs);
      onChange && onChange(isFs);
    };
    document.addEventListener("fullscreenchange", onFSchange);

    return () => {
      document.removeEventListener("fullscreenchange", onFSchange);
    };
  }, [onChange]);

  return { isFullscreen, isSupported, handleFullscreen };
};
