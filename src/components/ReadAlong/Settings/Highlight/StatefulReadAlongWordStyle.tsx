"use client";

import { Key, useCallback } from "react";

import { BuiltinDecorationStyle, DecorationStyleType, supportsDecorationStyle } from "@readium/navigator";
import { Color } from "react-aria-components";
import { ThReadAlongHighlightKeys, ThReadAlongKeys, defaultReadAlongWordStyle } from "@/preferences/models";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import settingsStyles from "../../../Settings/assets/styles/thorium-web.reader.settings.module.css";

import { StatefulDropdown } from "../../../Settings/StatefulDropdown";
import { StatefulColorSwatchPicker } from "../../../Settings/StatefulColorSwatchPicker";
import { ListBox, ListBoxItem } from "react-aria-components";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { useHighlightPresets } from "./hooks/useHighlightPresets";

import { useAppSelector } from "@/lib/hooks";

const NO_STYLE = "none";

export const StatefulReadAlongWordStyle = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();

  const config = preferences.readAlong.settings.keys[ThReadAlongKeys.wordStyle] ?? defaultReadAlongWordStyle;

  const readAloud = useNavigator().readAloud;
  const hasWordBoundaries = useAppSelector(state => state.readAlongPlayer.voiceControls.boundary);
  const { getStoredStyle, setStyle } = useHighlightPresets();

  const style = getStoredStyle(ThReadAlongHighlightKeys.wordStyle) ?? false;
  const builtinStyle = style === false ? undefined : style as BuiltinDecorationStyle;
  const tint = builtinStyle?.tint;

  const isDisabled = !readAloud || !hasWordBoundaries;

  // Dimming everything but the spoken word would hide the sentence around it
  const styleOptions = [
    {
      id: NO_STYLE,
      label: t("_pendingThoriumLocales.reader.readAlong.preferences.decoration.styles.none")
    },
    ...Object.values(DecorationStyleType)
      .filter((type) => type !== DecorationStyleType.Template && type !== DecorationStyleType.Mask && supportsDecorationStyle(type))
      .map((type) => ({
        id: type,
        label: t(`_pendingThoriumLocales.reader.readAlong.preferences.decoration.styles.${ type }`)
      }))
  ];

  const updateType = useCallback(async (key: Key | null) => {
    if (!key) return;
    await setStyle(ThReadAlongHighlightKeys.wordStyle, key === NO_STYLE
      ? false
      : { type: key as BuiltinDecorationStyle["type"], tint });
  }, [setStyle, tint]);

  const updateTint = useCallback(async (color: Color) => {
    if (!builtinStyle) return;
    await setStyle(ThReadAlongHighlightKeys.wordStyle, { ...builtinStyle, tint: color.toString("hexa") });
  }, [setStyle, builtinStyle]);

  return (
    <>
    <StatefulDropdown
      standalone={ standalone }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.decoration.word") }
      selectedKey={ style === false ? NO_STYLE : builtinStyle?.type ?? null }
      onSelectionChange={ updateType }
      isDisabled={ isDisabled }
      compounds={ {
        listbox: (
          <ListBox
            className={ settingsStyles.dropdownListbox }
            items={ styleOptions }
          >
            { (item) => (
              <ListBoxItem
                className={ settingsStyles.dropdownListboxItem }
                id={ item.id }
                key={ item.id }
                textValue={ item.label }
              >
                { item.label }
              </ListBoxItem>
            )}
          </ListBox>
        )
      }}
    />
    <StatefulColorSwatchPicker
      // Remounts when a tint is first set, so the picker goes from uncontrolled to controlled cleanly
      key={ tint === undefined ? "default" : "tint" }
      standalone={ standalone }
      heading={ t("_pendingThoriumLocales.reader.readAlong.preferences.decoration.color") }
      swatches={ config.swatches }
      value={ tint }
      onChange={ updateTint }
      isDisabled={ isDisabled || style === false }
    />
    </>
  )
}
