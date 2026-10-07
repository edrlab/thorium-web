"use client";

import { Key, useCallback } from "react";

import { ReadAloudAutoPause } from "@readium/navigator";
import { ThReadAlongKeys } from "@/preferences";
import { getPreferenceKey } from "../../Settings/helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../../Settings/models/settings";

import settingsStyles from "../../Settings/assets/styles/thorium-web.reader.settings.module.css";

import { StatefulDropdown } from "../../Settings/StatefulDropdown";
import { ListBox, ListBoxItem } from "react-aria-components";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { useIsScroll } from "@/hooks/useIsScroll";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setReadAlongAutoPause } from "@/lib/readAlongSettingsReducer";

export const StatefulReadAlongAutoPause = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const autoPause = useAppSelector(state => state.readAlongSettings.autoPause);
  const isScroll = useIsScroll();
  const dispatch = useAppDispatch();

  const readAloud = useNavigator().readAloud;

  const supportedValues = readAloud?.preferencesEditor?.autoPause.supportedValues ?? [];

  const items = supportedValues.map((value) => ({
    id: value,
    label: t(`_pendingThoriumLocales.reader.readAlong.preferences.autoPause.values.${ value }`)
  }));

  // There are no pages to pause at when scrolling
  const disabledKeys = isScroll ? [ReadAloudAutoPause.page] : [];

  const prefKey = getPreferenceKey(ThReadAlongKeys.autoPause, "readAlong");

  const updatePreference = useCallback(async (key: Key | null) => {
    if (!readAloud || !key) return;
    await readAloud.submitPreferences({ [prefKey]: key as ReadAloudAutoPause });
    dispatch(setReadAlongAutoPause(readAloud.getSetting(prefKey)));
  }, [prefKey, readAloud, dispatch]);

  return (
    <StatefulDropdown
      standalone={ standalone }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.autoPause.title") }
      selectedKey={ autoPause ?? readAloud?.getSetting(prefKey) ?? ReadAloudAutoPause.none }
      onSelectionChange={ updatePreference }
      isDisabled={ !readAloud || items.length === 0 }
      compounds={ {
        listbox: (
          <ListBox
            className={ settingsStyles.dropdownListbox }
            items={ items }
            disabledKeys={ disabledKeys }
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
