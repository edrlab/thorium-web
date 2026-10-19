"use client";

import { Key, useCallback } from "react";

import { BuiltinDecorationStyle, DecorationStyleType } from "@readium/navigator";
import { ThReadAlongHighlightKeys } from "@/preferences/models";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import settingsStyles from "../../../Settings/assets/styles/thorium-web.reader.settings.module.css";

import { StatefulDropdown } from "../../../Settings/StatefulDropdown";
import { ListBox, ListBoxItem } from "react-aria-components";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { useHighlightPresets } from "./hooks/useHighlightPresets";
import { getDecorationStyleTypes } from "../../helpers/getDecorationStyleTypes";

import { useAppSelector } from "@/lib/hooks";

const NO_STYLE = "none";

export const StatefulReadAlongWordStyle = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const readAloud = useNavigator().readAloud;
  const currentVoiceHasBoundaries = useAppSelector(state => state.readAlongPlayer.voiceControls.boundary);
  const anyVoiceHasBoundaries = useAppSelector(state => state.readAlongPlayer.anyVoiceHasBoundaries);
  const { getStoredStyle, setStyle } = useHighlightPresets();

  const style = getStoredStyle(ThReadAlongHighlightKeys.wordStyle) ?? false;
  const builtinStyle = style === false ? undefined : style as BuiltinDecorationStyle;

  const isDisabled = !readAloud || !currentVoiceHasBoundaries;

  // Dimming everything but the spoken word would hide the sentence around it
  const styleOptions = [
    {
      id: NO_STYLE,
      label: t("_pendingThoriumLocales.reader.readAlong.preferences.decoration.styles.none")
    },
    ...getDecorationStyleTypes([DecorationStyleType.Mask])
      .map((type) => ({
        id: type,
        label: t(`_pendingThoriumLocales.reader.readAlong.preferences.decoration.styles.${ type }`)
      }))
  ];

  const updateType = useCallback(async (key: Key | null) => {
    if (!key) return;
    await setStyle(ThReadAlongHighlightKeys.wordStyle, key === NO_STYLE
      ? false
      : { ...builtinStyle, type: key as BuiltinDecorationStyle["type"] });
  }, [setStyle, builtinStyle]);

  if (anyVoiceHasBoundaries === false) {
    return null;
  }

  return (
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
  )
}
