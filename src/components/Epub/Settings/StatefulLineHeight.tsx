"use client";

import React, { useCallback, useRef } from "react";

import { defaultLineHeights, ThLineHeightOptions, ThSettingsKeys } from "@/preferences";

import { useLocale } from "../AppLocale";

import { StatefulSettingsItemProps } from "../../Settings/models/settings";

import BookIcon from "./assets/icons/book.svg";
import SmallIcon from "./assets/icons/density_small.svg";
import MediumIcon from "./assets/icons/density_medium.svg";
import LargeIcon from "./assets/icons/density_large.svg";

import { StatefulRadioGroup } from "../../Settings/StatefulRadioGroup";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setLineHeight, setPublisherStyles } from "@/lib/settingsReducer";

export const StatefulLineHeight = ({ standalone = true }: StatefulSettingsItemProps) => {
  const RSPrefs = usePreferences();
  const publisherStyles = useAppSelector(state => state.settings.publisherStyles);
  const lineHeight = useAppSelector(state => state.settings.lineHeight);
  const dispatch = useAppDispatch();
  const locale = useLocale();

  const { getSetting, submitPreferences } = useEpubNavigator();

  const lineHeightOptions = useRef({
    [ThLineHeightOptions.publisher]: null,
    [ThLineHeightOptions.small]: RSPrefs.settings.keys?.[ThSettingsKeys.lineHeight]?.[ThLineHeightOptions.small] || defaultLineHeights[ThLineHeightOptions.small],
    [ThLineHeightOptions.medium]: RSPrefs.settings.keys?.[ThSettingsKeys.lineHeight]?.[ThLineHeightOptions.medium] || defaultLineHeights[ThLineHeightOptions.medium],
    [ThLineHeightOptions.large]: RSPrefs.settings.keys?.[ThSettingsKeys.lineHeight]?.[ThLineHeightOptions.large] || defaultLineHeights[ThLineHeightOptions.large],
  });

  const updatePreference = useCallback(async (value: string) => {
    const computedValue = value === ThLineHeightOptions.publisher
      ? null 
      : lineHeightOptions.current[value as keyof typeof ThLineHeightOptions];
    
    await submitPreferences({
      lineHeight: computedValue
    });

    const currentLineHeight = getSetting("lineHeight");
    const currentDisplayLineHeightOption = Object.entries(lineHeightOptions.current).find(([key, value]) => value === currentLineHeight)?.[0] as ThLineHeightOptions;

    dispatch(setLineHeight(currentDisplayLineHeightOption));
    dispatch(setPublisherStyles(false));
  }, [submitPreferences, getSetting, dispatch]);

  return (
    <>
    <StatefulRadioGroup 
      standalone={ standalone }
      label={ locale.reader.settings.lineHeight.title }
      orientation="horizontal"
      value={ publisherStyles ? ThLineHeightOptions.publisher : lineHeight } 
      onChange={ async (val: string) => await updatePreference(val) }
      items={[
        {
          icon: BookIcon,
          label: locale.reader.settings.lineHeight.publisher,
          value: ThLineHeightOptions.publisher 
        },
        {
          icon: SmallIcon,
          label: locale.reader.settings.lineHeight.small,
          value: ThLineHeightOptions.small 
        },
        {
          icon: MediumIcon,
          label: locale.reader.settings.lineHeight.medium,
          value: ThLineHeightOptions.medium 
        },
        {
          icon: LargeIcon,
          label: locale.reader.settings.lineHeight.large,
          value: ThLineHeightOptions.large 
        },
      ]}
    />
    </>
  );
}