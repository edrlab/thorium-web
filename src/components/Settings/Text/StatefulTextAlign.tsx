"use client";

import { useCallback } from "react";

import { ThTextAlignOptions, ThTextSettingsKeys, ThSettingsKeys } from "@/preferences/models";
import { StatefulSettingsItemProps } from "../models/settings";
import { TextAlignment } from "@readium/navigator";
import { getPreferenceKey } from "../helpers/settingsKeyMapping";

import BookIcon from "../assets/icons/book.svg";
import LeftAlignIcon from "./assets/icons/format_align_left.svg";
import RightAlignIcon from "./assets/icons/format_align_right.svg";
import JustifyIcon from "./assets/icons/format_align_justify.svg";

import { StatefulRadioGroup } from "../StatefulRadioGroup";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { useSettingsComponentStatus } from "../hooks/useSettingsComponentStatus";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useReaderSetting } from "../hooks/useReaderSetting";
import { setTextAlign, setHyphens } from "@/lib/settingsReducer";
import { setWebPubHyphens, setWebPubTextAlign } from "@/lib/webPubSettingsReducer";

export const StatefulTextAlign = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";

  const isRTL = useAppSelector(state => state.publication.isRTL);
  const textAlign = useReaderSetting("textAlign");
  const hyphens = useReaderSetting("hyphens");
  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useNavigator().visual;

  const hyphensPrefKey = getPreferenceKey(ThSettingsKeys.hyphens, isWebPub ? "webPub" : "epub");
  const textAlignPrefKey = getPreferenceKey(ThSettingsKeys.textAlign, isWebPub ? "webPub" : "epub");

  // Check if hyphens plugin is being used
  const publicationType = isWebPub ? "webpub" : "reflow";
  const { isComponentUsed: isHyphensUsed } = useSettingsComponentStatus({
    settingsKey: ThTextSettingsKeys.hyphens,
    publicationType
  });

  const items = [
    {
      id: ThTextAlignOptions.publisher,
      icon: BookIcon,
      label: t("reader.preferences.textAlign.default"), 
      value: ThTextAlignOptions.publisher 
    },
    {
      id: ThTextAlignOptions.start,
      icon: isRTL ? RightAlignIcon : LeftAlignIcon,
      label: isRTL ? t("reader.preferences.textAlign.right") : t("reader.preferences.textAlign.left"), 
      value: ThTextAlignOptions.start 
    },
    {
      id: ThTextAlignOptions.justify,
      icon: JustifyIcon,
      label: t("reader.preferences.textAlign.justify"), 
      value: ThTextAlignOptions.justify 
    }
  ];

  const updatePreference = useCallback(async (value: string) => {
    // Capture old textAlign value before any updates
    const oldTextAlign = textAlign;

    const navigatorTextAlign: TextAlignment | null = value === ThTextAlignOptions.publisher
      ? null
      : value === ThTextAlignOptions.start
        ? TextAlignment.start
        : TextAlignment.justify;

    const preferencesToSubmit: any = {
      [textAlignPrefKey]: navigatorTextAlign
    };

    await submitPreferences(preferencesToSubmit);

    const textAlignSetting = getSetting(textAlignPrefKey) as TextAlignment | null;
    const textAlignValue = textAlignSetting === null ? ThTextAlignOptions.publisher : textAlignSetting as unknown as ThTextAlignOptions;

    if (isWebPub) {
      dispatch(setWebPubTextAlign(textAlignValue));
    } else {
      dispatch(setTextAlign(textAlignValue));
    }

    // Handle hyphens after textAlign is submitted and processed
    if (isHyphensUsed) {
      if (navigatorTextAlign === null) {
        // Publisher mode: nullify hyphens for navigator, do NOT update store
        await submitPreferences({ [hyphensPrefKey]: null });
      } else {
        // Non-publisher: detect if transitioning from publisher
        const wasPublisher = oldTextAlign === ThTextAlignOptions.publisher;
        
        let hyphensToSubmit: boolean | null;
        if (wasPublisher && hyphens === null) {
          // Transitioning from publisher with never-set hyphens: auto-enable for justify, disable for start
          hyphensToSubmit = navigatorTextAlign === TextAlignment.justify;
        } else {
          // Not from publisher, or hyphens was already set: use stored value
          hyphensToSubmit = hyphens;
        }
        
        await submitPreferences({ [hyphensPrefKey]: hyphensToSubmit });
        const effectiveHyphens = getSetting(hyphensPrefKey);
        if (isWebPub) {
          dispatch(setWebPubHyphens(effectiveHyphens));
        } else {
          dispatch(setHyphens(effectiveHyphens));
        }
      }
    }
  }, [hyphensPrefKey, textAlignPrefKey, isWebPub, getSetting, submitPreferences, dispatch, isHyphensUsed, hyphens, textAlign]);

  return (
    <>
    <StatefulRadioGroup 
      standalone={ standalone } 
      label={ t("reader.preferences.textAlign.title") }
      orientation="horizontal" 
      value={ textAlign } 
      onChange={ async (val: string) => await updatePreference(val) }
      items={ items }
    />
    </>
  );
}