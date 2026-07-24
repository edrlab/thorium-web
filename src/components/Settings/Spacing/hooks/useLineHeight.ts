import { useMemo } from "react";
import { ThLineHeightOptions, ThSettingsKeys } from "@/preferences/models";
import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useAppSelector } from "@/lib/hooks";
import { lineHeightRangeConfig, RCSSI18nEntry } from "@readium/navigator";
import i18nData from "@readium/css/css/vars/i18n.json";

export const ORDERED_LINE_HEIGHT_OPTIONS = [ThLineHeightOptions.small, ThLineHeightOptions.medium, ThLineHeightOptions.large] as const;

// Resolves duplicate clamped values by distributing them evenly within their
// effective range [min(clamped), max(clamped)]. Returns input unchanged if all distinct.
function spreadValues(values: number[], globalMin: number, globalMax: number): number[] {
  const n = values.length;
  if (n <= 1) return values;
  const indexed = values.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  if (indexed.every((item, i) => i === 0 || item.v !== indexed[i - 1].v)) return values;
  const lo = indexed[0].v === indexed[n - 1].v ? globalMin : indexed[0].v;
  const hi = indexed[0].v === indexed[n - 1].v ? globalMax : indexed[n - 1].v;
  const step = (hi - lo) / (n - 1);
  const result = new Array<number>(n);
  for (let i = 0; i < n; i++) result[indexed[i].i] = lo + i * step;
  return result;
}

const getLineHeightCompensation = (language: string): number => {
  const data = i18nData as Record<string, RCSSI18nEntry>;
  if (data[language]?.lineHeightCompensation !== undefined) return data[language].lineHeightCompensation!;
  const stripped = language.split("-").slice(0, -1).join("-");
  if (stripped && data[stripped]?.lineHeightCompensation !== undefined) return data[stripped].lineHeightCompensation!;
  return data.latin?.lineHeightCompensation ?? 1;
};

export const useLineHeight = () => {
  const { preferences } = usePreferences();
  const fontLanguage = useAppSelector(state => state.publication.fontLanguage);

  return useMemo(() => {
    const keys = preferences.settings.keys[ThSettingsKeys.lineHeight].keys;
    const factor = getLineHeightCompensation(fontLanguage);
    const values = {
      [ThLineHeightOptions.publisher]: null as null,
      [ThLineHeightOptions.small]: keys[ThLineHeightOptions.small],
      [ThLineHeightOptions.medium]: keys[ThLineHeightOptions.medium],
      [ThLineHeightOptions.large]: keys[ThLineHeightOptions.large],
    };
    const compensate = (v: number | null): number | null => v !== null ? v * factor : null;
    const compensatedValues = {
      [ThLineHeightOptions.publisher]: null as null,
      [ThLineHeightOptions.small]: compensate(values[ThLineHeightOptions.small]),
      [ThLineHeightOptions.medium]: compensate(values[ThLineHeightOptions.medium]),
      [ThLineHeightOptions.large]: compensate(values[ThLineHeightOptions.large]),
    };

    const [minRange, maxRange] = lineHeightRangeConfig.range;
    const clamp = (v: number | null): number =>
      v === null ? minRange : Math.min(Math.max(v, minRange), maxRange);

    const ordered = ORDERED_LINE_HEIGHT_OPTIONS;
    const clamped = ordered.map(key => clamp(compensatedValues[key]));
    const processed = spreadValues(clamped, minRange, maxRange);

    const processedValues = Object.fromEntries(
      ordered.map((key, i) => [key, processed[i]])
    ) as Record<typeof ordered[number], number>;

    return { values, compensatedValues, processedValues, compensate };
  }, [preferences.settings.keys, fontLanguage]);
};
