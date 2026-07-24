"use client";

import { useCallback, useEffect, useRef } from "react";

import { ThemeKeyType } from "@/preferences";
import { useSharedPreferences } from "@/preferences/hooks/useSharedPreferences";

import settingsStyles from "../Settings/assets/styles/thorium-web.reader.settings.module.css";

import CheckIcon from "./assets/icons/check.svg";

import { ThActionsKeys, ThLayoutDirection } from "@/preferences/models";

import { StatefulRadioGroup } from "./StatefulRadioGroup";
import { Radio } from "react-aria-components";

import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";
import { useI18n } from "@/i18n/useI18n";
import { useGridNavigation } from "@/components/Settings/hooks/useGridNavigation";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib";
import { setTheme } from "@/lib/themeReducer";

import classNames from "classnames";
import { buildThemeObject } from "@/preferences/helpers/buildThemeObject";

export const StatefulTheme = () => {
  const profile = useAppSelector(state => state.reader.profile);
  const { theming } = useSharedPreferences();
  const { systemThemes, keys: themeKeys, audioOrder: audioThemeOrder, reflowOrder: reflowThemeOrder, fxlOrder: fxlThemeOrder } = theming.themes;
  const { t } = useI18n();

  const radioGroupRef = useRef<HTMLDivElement | null>(null);
  const radioGroupWrapperRef = useRef<HTMLDivElement | null>(null);

  const isFXL = useAppSelector(state => state.publication.isFXL);
  const direction = useAppSelector(state => state.reader.direction);
  const isRTL = direction === ThLayoutDirection.rtl;

  const themeArray: (ThemeKeyType | "auto")[] = profile === "audio"
    ? ((audioThemeOrder ?? []) as (ThemeKeyType | "auto")[])
    : (isFXL
        ? ((fxlThemeOrder ?? []) as (ThemeKeyType | "auto")[])
        : ((reflowThemeOrder ?? []) as (ThemeKeyType | "auto")[]));

  const themeObject = useAppSelector(state => state.theming.theme);
  const theme = profile === "audio" ? (themeObject.audio ?? "auto") : (isFXL ? (themeObject.fxl ?? "auto") : (themeObject.reflow ?? "auto"));
  const colorScheme = useAppSelector(state => state.theming.colorScheme);
  const coverTheme = useAppSelector(state => state.publication.coverTheme);

  const themeItems = useRef<(ThemeKeyType | "auto")[]>(
    themeArray.filter((theme: ThemeKeyType | "auto") => {
      if (theme === "auto") {
        return systemThemes !== undefined &&
          Object.values(systemThemes).every(t => themeArray.includes(t as ThemeKeyType));
      }
      return true;
    })
  );

  const dispatch = useAppDispatch();

  // Handling grid navigation through StatefulRadioGroup
  // would add a ton of complexity due to the extensive
  // logic for handling different types of children (render, node, etc.)
  // So we handle it here instead for the time being
  const { onKeyDown } = useGridNavigation({
    containerRef: radioGroupWrapperRef,
    items: themeItems,
    currentValue: theme,
    onChange: async (val) => await updatePreference(val as ThemeKeyType),
    isRTL,
    onEscape: () => {
      if (profile) {
        dispatch(setActionOpen({
          key: ThActionsKeys.settings,
          isOpen: false,
          profile
        }));
      }
    },
    onFocus: (id) => {
      const element = radioGroupWrapperRef.current?.querySelector(`[id="${ id }"]`);
    if (element) (element as HTMLElement).focus();
    }
  })

  const { submitPreferences } = useEpubNavigator();

  const updatePreference = useCallback(async (value: ThemeKeyType | "auto") => {
    const themeProps = buildThemeObject<typeof value>({
      theme: value,
      themeKeys: themeKeys ?? {},
      systemThemes: systemThemes as { light: ThemeKeyType; dark: ThemeKeyType } | undefined,
      colorScheme
    })
    await submitPreferences(themeProps);

    dispatch(setTheme({
      key: profile === "audio" ? "audio" : (isFXL ? "fxl" : "reflow"),
      value: value
    }));
  }, [isFXL, themeKeys, systemThemes, submitPreferences, dispatch, colorScheme, profile]);

  // It's easier to inline styles from preferences for these
  // than spamming the entire app with all custom properties right now
  const doStyles = useCallback((t: ThemeKeyType | "auto") => {
    // For some reason Typescript will just refuse to create dts files
    // for the packages if we set it to CSSProperties…
    let cssProps: any = {
      boxSizing: "border-box",
      color: "#999999"
    };

    if (t === "auto") {
      if (profile === "audio" && coverTheme) {
        cssProps.background = coverTheme.background;
        cssProps.color = coverTheme.text;
        cssProps.border = `1px solid ${ coverTheme.subdue }`;
      } else if (systemThemes !== undefined) {
        cssProps.background = isRTL
        ? `linear-gradient(148deg, ${ themeKeys[systemThemes.dark].background } 48%, ${ themeKeys[systemThemes.light].background } 100%)`
        : `linear-gradient(148deg, ${ themeKeys[systemThemes.light].background } 0%, ${ themeKeys[systemThemes.dark].background } 48%)`;
        cssProps.color = "#ffffff";
        cssProps.border = `1px solid ${ themeKeys[systemThemes.light].subdue }`;
      } else {
        cssProps.display = "none";
      }
    } else {
      const theme = themeKeys[t as string];
      if (theme) {
        cssProps.background = theme.background;
        cssProps.color = theme.text;
        cssProps.border = `1px solid ${theme.subdue}`;
      }
    };

    return cssProps;
  }, [themeKeys, systemThemes, isRTL, profile, coverTheme]);

  // Edge case where the value stored is auto, but the array doesn't have it
  useEffect(() => {
    if (theme === "auto" && !themeItems.current.includes(theme)) {
      updatePreference(themeItems.current[0]);
    }
  }, [theme, updatePreference]);

  return (
    <>
    <StatefulRadioGroup
      ref={ radioGroupRef }
      standalone={ true }
      label={ t("reader.preferences.themes.title") }
      value={ theme }
      onChange={ async (val) => await updatePreference(val as ThemeKeyType) }
      useGraphicalNavigation={ false }
    >
      <div
        ref={ radioGroupWrapperRef }
        className={ classNames(settingsStyles.radioWrapper, settingsStyles.themesWrapper)
      }>
        { themeItems.current.map(( themeItem ) =>
          <Radio
            className={ classNames(
              settingsStyles.radio,
              settingsStyles.themeRadio
            ) }
            value={ themeItem }
            id={ themeItem }
            key={ themeItem }
            style={ doStyles(themeItem) }
            onKeyDown={ onKeyDown }
          >
          <span>
            { t(`reader.preferences.themes.${ themeItem }`, { defaultValue: themeItem }) }
            { themeItem === theme && <CheckIcon aria-hidden="true" focusable="false" /> }
          </span>
        </Radio>
        ) }
      </div>
    </StatefulRadioGroup>
    </>
  )
}
