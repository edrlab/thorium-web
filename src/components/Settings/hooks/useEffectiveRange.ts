"use client";

import { useMemo } from "react";

interface EffectiveRangeResult {
  range: [number, number];
  presets?: number[];
}

/**
 * Returns the effective range and presets to use for a range setting, clamped
 * to the navigator's supported range when provided. Falls back to the preferred
 * range if it fits within the supported range, otherwise uses the supported
 * range directly. Presets outside the effective range are filtered out.
 */
export const useEffectiveRange = (
  preferred: [number, number],
  supportedRange: readonly [number, number] | undefined,
  presets?: number[]
): EffectiveRangeResult => {
  return useMemo(() => {
    let range: [number, number];

    if (!supportedRange) {
      range = preferred;
    } else {
      const prefMin = Math.min(...preferred);
      const prefMax = Math.max(...preferred);
      const supMin = Math.min(...supportedRange);
      const supMax = Math.max(...supportedRange);
      range = (prefMin >= supMin && prefMax <= supMax) ? preferred : [supportedRange[0], supportedRange[1]];
    }

    if (!presets) return { range };

    const [min, max] = [Math.min(...range), Math.max(...range)];
    const effectivePresets = presets.filter(p => p >= min && p <= max);

    return { range, presets: effectivePresets };
  }, [preferred, supportedRange, presets]);
};
