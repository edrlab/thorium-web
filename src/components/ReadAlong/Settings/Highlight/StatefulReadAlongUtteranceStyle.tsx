"use client";

import { Key, useCallback } from "react";

import { BuiltinDecorationStyle } from "@readium/navigator";
import { ThReadAlongHighlightKeys } from "@/preferences/models";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import settingsStyles from "../../../Settings/assets/styles/thorium-web.reader.settings.module.css";

import { StatefulDropdown } from "../../../Settings/StatefulDropdown";
import { ListBox, ListBoxItem } from "react-aria-components";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { useHighlightPresets } from "./hooks/useHighlightPresets";
import { getDecorationStyleTypes } from "../../helpers/getDecorationStyleTypes";

const NO_STYLE = "none";

export const StatefulReadAlongUtteranceStyle = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const readAloud = useNavigator().readAloud;
  const { getStoredStyle, setStyle } = useHighlightPresets();

  const style = getStoredStyle(ThReadAlongHighlightKeys.utteranceStyle) ?? false;
  const builtinStyle = style === false ? undefined : style as BuiltinDecorationStyle;

  const styleOptions = [
    {
      id: NO_STYLE,
      label: t("_pendingThoriumLocales.reader.readAlong.preferences.decoration.styles.none")
    },
    ...getDecorationStyleTypes()
      .map((type) => ({
        id: type,
        label: t(`_pendingThoriumLocales.reader.readAlong.preferences.decoration.styles.${ type }`)
      }))
  ];

  const updateType = useCallback(async (key: Key | null) => {
    if (!key) return;
    await setStyle(ThReadAlongHighlightKeys.utteranceStyle, key === NO_STYLE
      ? false
      : { ...builtinStyle, type: key as BuiltinDecorationStyle["type"] });
  }, [setStyle, builtinStyle]);

  return (
    <StatefulDropdown
      standalone={ standalone }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.decoration.utterance") }
      selectedKey={ style === false ? NO_STYLE : builtinStyle?.type ?? null }
      onSelectionChange={ updateType }
      isDisabled={ !readAloud }
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
