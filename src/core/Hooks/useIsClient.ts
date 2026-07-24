"use client";

import { useEffect, useRef, useState } from "react";

export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  const isClientRef = useRef(false);

  useEffect(() => {
    isClientRef.current = true;
    setIsClient(true);
  }, []);

  return { isClient, isClientRef };
};
