"use client";

import { useAppSelector } from "@/lib/hooks";

export const useIsPageBased = (): boolean => {
  const profile = useAppSelector(state => state.reader.profile);
  const isFXL = useAppSelector(state => state.publication.isFXL);

  // Divina resources are pages, like FXL
  return isFXL || profile === "divina";
};
