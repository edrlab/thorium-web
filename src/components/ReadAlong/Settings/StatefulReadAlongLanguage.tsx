"use client";

import { Key, useCallback } from "react";

import { LanguageMode } from "@readium/navigator";

import { StatefulSettingsItemProps } from "../../Settings/models/settings";

import settingsStyles from "../../Settings/assets/styles/thorium-web.reader.settings.module.css";

import { StatefulDropdown } from "../../Settings/StatefulDropdown";
import { ListBox, ListBoxItem } from "react-aria-components";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setReadAlongLanguage } from "@/lib/readAlongSettingsReducer";

export const StatefulReadAlongLanguage = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const language = useAppSelector(state => state.readAlongSettings.language);
  const dispatch = useAppDispatch();

  const readAloud = useNavigator().readAloud;

  const supportedValues = readAloud?.preferencesEditor?.language.supportedValues ?? [];

  const items = supportedValues.map((value) => ({
    id: value,
    label: t(`_pendingThoriumLocales.reader.readAlong.preferences.language.values.${ value }`)
  }));

  const updatePreference = useCallback(async (key: Key | null) => {
    if (!readAloud || !key) return;
    await readAloud.submitPreferences({ language: key as LanguageMode });
    dispatch(setReadAlongLanguage(readAloud.getSetting("language")));
  }, [readAloud, dispatch]);

  return (
    <StatefulDropdown
      standalone={ standalone }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.language.title") }
      selectedKey={ language ?? readAloud?.getSetting("language") ?? null }
      onSelectionChange={ updatePreference }
      isDisabled={ !readAloud || items.length === 0 }
      compounds={ {
        listbox: (
          <ListBox
            className={ settingsStyles.dropdownListbox }
            items={ items }
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
