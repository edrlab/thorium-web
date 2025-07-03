"use client";

import { useCallback, useRef } from "react";

import { defaultLineHeights, ThLineHeightOptions, ThSettingsKeys } from "@/preferences";

import { useLocale } from "../AppLocale";

import { StatefulSettingsItemProps } from "../../Settings/models/settings";

import { StatefulSwitch } from "../../Settings/StatefulSwitch";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setPublisherStyles } from "@/lib/settingsReducer";

export const StatefulPublisherStyles = ({ standalone = true }: StatefulSettingsItemProps) => {
  const RSPrefs = usePreferences();
  const publisherStyles = useAppSelector(state => state.settings.publisherStyles);

  const lineHeight = useAppSelector(state => state.settings.lineHeight);
  const paragraphIndent = useAppSelector(state => state.settings.paragraphIndent);
  const paragraphSpacing = useAppSelector(state => state.settings.paragraphSpacing);
  const letterSpacing = useAppSelector(state => state.settings.letterSpacing);
  const wordSpacing = useAppSelector(state => state.settings.wordSpacing);

  const dispatch = useAppDispatch();
  const locale = useLocale();

  const lineHeightOptions = useRef({
    [ThLineHeightOptions.publisher]: null,
    [ThLineHeightOptions.small]: RSPrefs.settings.keys?.[ThSettingsKeys.lineHeight]?.[ThLineHeightOptions.small] || defaultLineHeights[ThLineHeightOptions.small],
    [ThLineHeightOptions.medium]: RSPrefs.settings.keys?.[ThSettingsKeys.lineHeight]?.[ThLineHeightOptions.medium] || defaultLineHeights[ThLineHeightOptions.medium],
    [ThLineHeightOptions.large]: RSPrefs.settings.keys?.[ThSettingsKeys.lineHeight]?.[ThLineHeightOptions.large] || defaultLineHeights[ThLineHeightOptions.large],
  });

  const { submitPreferences } = useEpubNavigator();

  const updatePreference = useCallback(async (isSelected: boolean) => {
    const values = isSelected ? 
    {
      lineHeight: null,
      paragraphIndent: null,
      paragraphSpacing: null,
      letterSpacing: null,
      wordSpacing: null
    } : 
    {
      lineHeight: lineHeight === ThLineHeightOptions.publisher 
        ? null 
        : lineHeightOptions.current[lineHeight as keyof typeof ThLineHeightOptions],
      paragraphIndent: paragraphIndent || 0,
      paragraphSpacing: paragraphSpacing || 0,
      letterSpacing: letterSpacing || 0,
      wordSpacing: wordSpacing || 0
    };
    await submitPreferences(values);

    dispatch(setPublisherStyles(isSelected ? true : false));
  }, [submitPreferences, dispatch, lineHeight, paragraphIndent, paragraphSpacing, letterSpacing, wordSpacing]);

  return(
    <>
    <StatefulSwitch 
      standalone={ standalone }
      label={ locale.reader.settings.publisherStyles.label }
      onChange={ async (isSelected: boolean) => await updatePreference(isSelected) }
      isSelected={ publisherStyles }
    />
    </>
  )
}