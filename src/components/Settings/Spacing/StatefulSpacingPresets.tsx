import { useCallback, useMemo } from "react";

import {
  ThSpacingPresetKeys,
  ThLineHeightOptions,
  ThSpacingSettingsKeys,
  ThSettingsKeys,
} from "@/preferences/models";
import { getPreferenceKey } from "../helpers/settingsKeyMapping";

import BookIcon from "../assets/icons/book.svg";
import SmallIcon from "./assets/icons/density_small.svg";
import MediumIcon from "./assets/icons/density_medium.svg";
import LargeIcon from "./assets/icons/density_large.svg";
import AccessibleIcon from "./assets/icons/accessibility.svg";
import TuneIcon from "./assets/icons/tune.svg";

import { StatefulSettingsItemProps } from "@/components/Settings";

import { StatefulRadioGroup } from "../StatefulRadioGroup";

import { useSpacingPresets } from "./hooks/useSpacingPresets";

import { useI18n } from "@/i18n/useI18n";
import { useFilteredPreferenceKeys } from "@/preferences/hooks/useFilteredPreferenceKeys";
import { useNavigator } from "@/core/Navigator";
import { useLineHeight } from "./hooks/useLineHeight";
import { useSettingsComponentStatus } from "../hooks/useSettingsComponentStatus";

import { useAppSelector, useAppDispatch } from "@/lib";
import { useReaderSetting } from "../hooks/useReaderSetting";
import { setSpacingPreset } from "@/lib/settingsReducer";
import { setWebPubSpacingPreset } from "@/lib/webPubSettingsReducer";

import { hasCustomizableSpacingSettings } from "./helpers/spacingSettings";

const iconMap = {
  [ThSpacingPresetKeys.publisher]: BookIcon,
  [ThSpacingPresetKeys.accessible]: AccessibleIcon,
  [ThSpacingPresetKeys.custom]: TuneIcon,
  [ThSpacingPresetKeys.tight]: SmallIcon,
  [ThSpacingPresetKeys.balanced]: MediumIcon,
  [ThSpacingPresetKeys.loose]: LargeIcon,
};

export const StatefulSpacingPresets = ({ standalone }: StatefulSettingsItemProps) => {
  const { t } = useI18n();
  const { reflowSpacingPresetKeys, fxlSpacingPresetKeys, webPubSpacingPresetKeys, subPanelSpacingSettingsKeys } = useFilteredPreferenceKeys();

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";
  const spacing = useReaderSetting("spacing");
  const isFXL = useAppSelector(state => state.publication.isFXL);

  const dispatch = useAppDispatch();

  const { submitPreferences } = useNavigator().visual;

  const letterSpacingPrefKey = getPreferenceKey(ThSettingsKeys.letterSpacing);
  const lineHeightPrefKey = getPreferenceKey(ThSettingsKeys.lineHeight);
  const paragraphIndentPrefKey = getPreferenceKey(ThSettingsKeys.paragraphIndent);
  const paragraphSpacingPrefKey = getPreferenceKey(ThSettingsKeys.paragraphSpacing);
  const wordSpacingPrefKey = getPreferenceKey(ThSettingsKeys.wordSpacing);

  const { values: lineHeightOptions, compensate: compensateLineHeight } = useLineHeight();

  const { getPresetValues } = useSpacingPresets();

  // Check if individual spacing setting plugins are being used
  const publicationType = isWebPub ? "webpub" : isFXL ? "fxl" : "reflow";
  const { isComponentUsed: isLetterSpacingUsed } = useSettingsComponentStatus({
    settingsKey: ThSpacingSettingsKeys.letterSpacing,
    publicationType
  });
  const { isComponentUsed: isLineHeightUsed } = useSettingsComponentStatus({
    settingsKey: ThSpacingSettingsKeys.lineHeight,
    publicationType
  });
  const { isComponentUsed: isParagraphIndentUsed } = useSettingsComponentStatus({
    settingsKey: ThSpacingSettingsKeys.paragraphIndent,
    publicationType
  });
  const { isComponentUsed: isParagraphSpacingUsed } = useSettingsComponentStatus({
    settingsKey: ThSpacingSettingsKeys.paragraphSpacing,
    publicationType
  });
  const { isComponentUsed: isWordSpacingUsed } = useSettingsComponentStatus({
    settingsKey: ThSpacingSettingsKeys.wordSpacing,
    publicationType
  });

  const updatePreference = useCallback(async (value: string) => {
    const spacingKey = value as ThSpacingPresetKeys;
    
    // Get preset values directly from preferences config
    const presetValues = getPresetValues(spacingKey);
    
    // Raw values for Redux state (lineHeight stays as enum)
    const reduxValues = {
      [ThSpacingSettingsKeys.letterSpacing]: presetValues?.[ThSpacingSettingsKeys.letterSpacing] ?? null,
      [ThSpacingSettingsKeys.lineHeight]: presetValues?.[ThSpacingSettingsKeys.lineHeight] ?? null,
      [ThSpacingSettingsKeys.paragraphIndent]: presetValues?.[ThSpacingSettingsKeys.paragraphIndent] ?? null,
      [ThSpacingSettingsKeys.paragraphSpacing]: presetValues?.[ThSpacingSettingsKeys.paragraphSpacing] ?? null,
      [ThSpacingSettingsKeys.wordSpacing]: presetValues?.[ThSpacingSettingsKeys.wordSpacing] ?? null,
    };
  
    // Convert lineHeight for preferences API (enum to compensated number)
    const lineHeightValue = reduxValues[ThSpacingSettingsKeys.lineHeight];
    const lineHeightValueNumber = lineHeightValue && lineHeightValue !== ThLineHeightOptions.publisher
      ? compensateLineHeight(lineHeightOptions[lineHeightValue as ThLineHeightOptions])
      : null;

    // Only include spacing settings if their plugins are being used
    const preferencesToSubmit: any = {};
    if (isLetterSpacingUsed) {
      preferencesToSubmit[letterSpacingPrefKey] = reduxValues[ThSpacingSettingsKeys.letterSpacing];
    }
    if (isLineHeightUsed) {
      preferencesToSubmit[lineHeightPrefKey] = lineHeightValueNumber;
    }
    if (isParagraphIndentUsed) {
      preferencesToSubmit[paragraphIndentPrefKey] = reduxValues[ThSpacingSettingsKeys.paragraphIndent];
    }
    if (isParagraphSpacingUsed) {
      preferencesToSubmit[paragraphSpacingPrefKey] = reduxValues[ThSpacingSettingsKeys.paragraphSpacing];
    }
    if (isWordSpacingUsed) {
      preferencesToSubmit[wordSpacingPrefKey] = reduxValues[ThSpacingSettingsKeys.wordSpacing];
    }

    await submitPreferences(preferencesToSubmit);
  
    if (isWebPub) {
      dispatch(setWebPubSpacingPreset({
        preset: spacingKey,
        values: reduxValues,
      }));
    } else {
      dispatch(setSpacingPreset({
        preset: spacingKey,
        values: reduxValues,
      }));
    }
  }, [isWebPub, dispatch, submitPreferences, getPresetValues, lineHeightOptions, compensateLineHeight, letterSpacingPrefKey, lineHeightPrefKey, paragraphIndentPrefKey, paragraphSpacingPrefKey, wordSpacingPrefKey, isLetterSpacingUsed, isLineHeightUsed, isParagraphIndentUsed, isParagraphSpacingUsed, isWordSpacingUsed]);

  // Use appropriate spacing keys based on layout
  const spacingKeys = useMemo(() => {
    const baseKeys = isWebPub 
      ? webPubSpacingPresetKeys 
      : isFXL 
        ? fxlSpacingPresetKeys 
        : reflowSpacingPresetKeys;
    const subPanelKeys = subPanelSpacingSettingsKeys || [];

    const hasCustomizableSettings = hasCustomizableSpacingSettings(subPanelKeys);

    if (hasCustomizableSettings) {
      return baseKeys;
    } else {
      // Exclude "custom" if no spacing settings are available for customization
      return baseKeys.filter(key => key !== ThSpacingPresetKeys.custom);
    }
  }, [isWebPub, isFXL, fxlSpacingPresetKeys, reflowSpacingPresetKeys, webPubSpacingPresetKeys, subPanelSpacingSettingsKeys]);

  // Create dynamic items array based on spacing keys
  const items = useMemo(() => {
    return spacingKeys.map((key: ThSpacingPresetKeys) => ({
      id: key,
      icon: iconMap[key],
      value: key,
      label: t(`reader.preferences.spacing.presets.${ key === ThSpacingPresetKeys.publisher ? "default" : key }`)
    }));
  }, [spacingKeys, t]);

  // Return null if no items to display
  if (items.length === 0) {
    return null;
  }

  return (
    <>
    <StatefulRadioGroup
      standalone={ standalone }
      label={ t("reader.preferences.spacing.presets.title") }
      orientation="horizontal"
      value={ spacing?.preset || ThSpacingPresetKeys.publisher }
      onChange={ async (val: string) => await updatePreference(val as ThSpacingPresetKeys) }
      items={ items }
    />
    </>
  );
}