import { Locator } from "@readium/shared";

// The RWPM JSON shape produced by Locator.serialize()/consumed by Locator.deserialize().
// Positions live in Redux (which requires serializable state), so they're stored in this
// shape rather than as real Locator instances — code that needs a real Locator (e.g. to
// call navigator.go()) must deserialize it first.
export interface SerializedLocator {
  href: string;
  type: string;
  title?: string;
  locations?: {
    fragments?: string[];
    progression?: number;
    totalProgression?: number;
    position?: number;
  };
  text?: {
    after?: string;
    before?: string;
    highlight?: string;
  };
}

export const serializePositions = (positionsList?: Locator[]): SerializedLocator[] | undefined => {
  return positionsList?.map((locator) => locator.serialize());
};
