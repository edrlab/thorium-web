"use client";

import { useCallback, useMemo } from "react";

import { ThLineHeightOptions, ThSpacingSettingsKeys, ThSettingsKeys } from "@/preferences";
import { getPreferenceKey } from "../helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../models/settings";

import BookIcon from "../assets/icons/book.svg";
import SmallIcon from "./assets/icons/density_small.svg";
import MediumIcon from "./assets/icons/density_medium.svg";
import LargeIcon from "./assets/icons/density_large.svg";

import { StatefulRadioGroup } from "../StatefulRadioGroup";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { usePreferences } from "@/preferences/hooks/usePreferences";

import { useAppSelector } from "@/lib/hooks";
import { useLineHeight } from "./hooks/useLineHeight";
import { useSpacingPresets } from "./hooks/useSpacingPresets";
import { useReaderSetting } from "../hooks/useReaderSetting";


export const StatefulLineHeight = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();
  const { preferences } = usePreferences();

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";

  const publisherStyles = useReaderSetting("publisherStyles");

  const { getSetting, submitPreferences } = useNavigator().visual;

  const prefKey = getPreferenceKey(ThSettingsKeys.lineHeight);

  const { getEffectiveSpacingValue, setLineHeight } = useSpacingPresets();

  const lineHeight = getEffectiveSpacingValue(ThSpacingSettingsKeys.lineHeight);

  const { processedValues } = useLineHeight();

  // Build map from processed values for settings UI
  const processedPresets = useMemo(() => {
    const result = new Map<ThLineHeightOptions, number>();
    result.set(ThLineHeightOptions.small, processedValues[ThLineHeightOptions.small]);
    result.set(ThLineHeightOptions.medium, processedValues[ThLineHeightOptions.medium]);
    result.set(ThLineHeightOptions.large, processedValues[ThLineHeightOptions.large]);
    return result;
  }, [processedValues]);

  const items = useMemo(() => {
    const baseItems = [
      {
        id: ThLineHeightOptions.small,
        icon: SmallIcon,
        label: t("reader.preferences.lineHeight.small"),
        value: ThLineHeightOptions.small
      },
      {
        id: ThLineHeightOptions.medium,
        icon: MediumIcon,
        label: t("reader.preferences.lineHeight.medium"),
        value: ThLineHeightOptions.medium
      },
      {
        id: ThLineHeightOptions.large,
        icon: LargeIcon,
        label: t("reader.preferences.lineHeight.large"),
        value: ThLineHeightOptions.large
      },
    ].filter(item => processedPresets.has(item.id));

    if (preferences.settings.keys[ThSettingsKeys.lineHeight].allowUnset !== false) {
      baseItems.unshift({
        id: ThLineHeightOptions.publisher,
        icon: BookIcon,
        label: t("reader.preferences.lineHeight.default"),
        value: ThLineHeightOptions.publisher
      });
    }

    return baseItems;
  }, [preferences.settings.keys, processedPresets, t]);

  const updatePreference = useCallback(async (value: string) => {
    const submitValue = value === ThLineHeightOptions.publisher
      ? null
      : processedPresets.get(value as ThLineHeightOptions) ?? null;
    await submitPreferences({
      [prefKey]: submitValue
    });

    const storedLineHeight = getSetting(prefKey) as number | null;
    const currentDisplayLineHeightOption = [...processedPresets.entries()].find(([, v]) => v === storedLineHeight)?.[0] as ThLineHeightOptions;

    setLineHeight(currentDisplayLineHeightOption);
  }, [prefKey, submitPreferences, getSetting, setLineHeight, processedPresets]);

  return (
    <>
    <StatefulRadioGroup
      standalone={ standalone }
      label={ t("reader.preferences.lineHeight.title") }
      orientation="horizontal"
      value={ !isWebPub && publisherStyles ? ThLineHeightOptions.publisher : lineHeight }
      onChange={ async (val: string) => await updatePreference(val) }
      items={ items }
    />
    </>
  );
}
