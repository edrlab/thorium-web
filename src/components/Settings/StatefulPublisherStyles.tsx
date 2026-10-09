"use client";

import { useCallback } from "react";

import { ThLineHeightOptions, ThSpacingSettingsKeys, ThSettingsKeys } from "@/preferences";
import { getPreferenceKey } from "./helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "./models/settings";

import { StatefulSwitch } from "./StatefulSwitch";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { useSpacingPresets } from "./Spacing/hooks/useSpacingPresets";
import { useLineHeight } from "./Spacing/hooks/useLineHeight";
import { useSettingsComponentStatus } from "./hooks/useSettingsComponentStatus";

import { useReaderSetting } from "./hooks/useReaderSetting";

import { useAppSelector } from "@/lib/hooks";

export const StatefulPublisherStyles = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();
  const publisherStyles = useReaderSetting("publisherStyles");

  const { getEffectiveSpacingValue, setPublisherStyles } = useSpacingPresets();

  // Check if individual spacing setting plugins are being used
  const { isComponentUsed: isLineHeightUsed } = useSettingsComponentStatus({
    settingsKey: ThSpacingSettingsKeys.lineHeight,
    publicationType: "reflow"
  });
  const { isComponentUsed: isParagraphIndentUsed } = useSettingsComponentStatus({
    settingsKey: ThSpacingSettingsKeys.paragraphIndent,
    publicationType: "reflow"
  });
  const { isComponentUsed: isParagraphSpacingUsed } = useSettingsComponentStatus({
    settingsKey: ThSpacingSettingsKeys.paragraphSpacing,
    publicationType: "reflow"
  });
  const { isComponentUsed: isLetterSpacingUsed } = useSettingsComponentStatus({
    settingsKey: ThSpacingSettingsKeys.letterSpacing,
    publicationType: "reflow"
  });
  const { isComponentUsed: isWordSpacingUsed } = useSettingsComponentStatus({
    settingsKey: ThSpacingSettingsKeys.wordSpacing,
    publicationType: "reflow"
  });

  const lineHeight = getEffectiveSpacingValue(ThSpacingSettingsKeys.lineHeight);
  const paragraphIndent = getEffectiveSpacingValue(ThSpacingSettingsKeys.paragraphIndent);
  const paragraphSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.paragraphSpacing);
  const letterSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.letterSpacing);
  const wordSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.wordSpacing);

  const { compensatedValues: lineHeightOptions } = useLineHeight();

  const { submitPreferences } = useNavigator().visual;

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";

  const lineHeightPrefKey = getPreferenceKey(ThSettingsKeys.lineHeight, isWebPub ? "webPub" : "epub");
  const paragraphIndentPrefKey = getPreferenceKey(ThSettingsKeys.paragraphIndent, isWebPub ? "webPub" : "epub");
  const paragraphSpacingPrefKey = getPreferenceKey(ThSettingsKeys.paragraphSpacing, isWebPub ? "webPub" : "epub");
  const letterSpacingPrefKey = getPreferenceKey(ThSettingsKeys.letterSpacing, isWebPub ? "webPub" : "epub");
  const wordSpacingPrefKey = getPreferenceKey(ThSettingsKeys.wordSpacing, isWebPub ? "webPub" : "epub");

  const updatePreference = useCallback(async (isSelected: boolean) => {
    const values: any = {};

    if (isSelected) {
      // Reset all spacing settings to null (publisher defaults)
      if (isLineHeightUsed) {
        values[lineHeightPrefKey] = null;
      }
      if (isParagraphIndentUsed) {
        values[paragraphIndentPrefKey] = null;
      }
      if (isParagraphSpacingUsed) {
        values[paragraphSpacingPrefKey] = null;
      }
      if (isLetterSpacingUsed) {
        values[letterSpacingPrefKey] = null;
      }
      if (isWordSpacingUsed) {
        values[wordSpacingPrefKey] = null;
      }
    } else {
      // Set spacing settings to current values
      if (isLineHeightUsed) {
        values[lineHeightPrefKey] = lineHeight === ThLineHeightOptions.publisher
          ? null
          : lineHeightOptions[lineHeight as keyof typeof ThLineHeightOptions];
      }
      if (isParagraphIndentUsed) {
        values[paragraphIndentPrefKey] = paragraphIndent;
      }
      if (isParagraphSpacingUsed) {
        values[paragraphSpacingPrefKey] = paragraphSpacing;
      }
      if (isLetterSpacingUsed) {
        values[letterSpacingPrefKey] = letterSpacing;
      }
      if (isWordSpacingUsed) {
        values[wordSpacingPrefKey] = wordSpacing;
      }
    }

    await submitPreferences(values);

    setPublisherStyles(isSelected ? true : false);
  }, [submitPreferences, setPublisherStyles, lineHeight, paragraphIndent, paragraphSpacing, letterSpacing, wordSpacing, lineHeightOptions, lineHeightPrefKey, paragraphIndentPrefKey, paragraphSpacingPrefKey, letterSpacingPrefKey, wordSpacingPrefKey, isLineHeightUsed, isParagraphIndentUsed, isParagraphSpacingUsed, isLetterSpacingUsed, isWordSpacingUsed]);

  return(
    <>
    <StatefulSwitch 
      standalone={ standalone }
      label={ t("reader.preferences.publisherStyles.label") }
      onChange={ async (isSelected: boolean) => await updatePreference(isSelected) }
      isSelected={ publisherStyles }
    />
    </>
  )
}