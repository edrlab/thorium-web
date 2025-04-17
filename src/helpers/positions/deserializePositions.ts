import { Locator } from "@readium/shared";

export const deserializePositions = (positionsList?: Locator[]) => {
  return positionsList?.map((locator) => ({
    href: locator.href,
    type: locator.type,
    locations: {
      position: locator.locations.position,
      progression: locator.locations.progression,
      totalProgression: locator.locations.totalProgression
    },
  }))
}