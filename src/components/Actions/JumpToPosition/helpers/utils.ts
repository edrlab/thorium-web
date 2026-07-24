"use client";

import { SerializedLocator } from "@/helpers/serializePositions";

export const isPositionsListValid = (positionsList: SerializedLocator[] | null | undefined): boolean => {
  return !!(positionsList && positionsList.length > 0 && positionsList.some(item => item.locations?.position));
};
