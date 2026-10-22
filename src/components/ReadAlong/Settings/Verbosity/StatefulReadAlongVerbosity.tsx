"use client";

import { Key, useCallback } from "react";

import { VerbosityPreset } from "@readium/navigator";
import { ThReadAlongKeys } from "@/preferences";
import { getPreferenceKey } from "../../../Settings/helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import settingsStyles from "../../../Settings/assets/styles/thorium-web.reader.settings.module.css";

import { StatefulDropdown } from "../../../Settings/StatefulDropdown";
import { ListBox, ListBoxItem } from "react-aria-components";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch } from "@/lib/hooks";
import { setReadAlongVerbosity } from "@/lib/readAlongSettingsReducer";
import { useReadAlongVerbosity } from "../../Hooks/useReadAlongVerbosity";

export const StatefulReadAlongVerbosity = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const { verbosityKey, verbosity } = useReadAlongVerbosity();
  const dispatch = useAppDispatch();

  const readAloud = useNavigator().readAloud;

  // Custom tables aren't offered, the components of the subpanel set what verbosity doesn't cover
  const supportedValues = (readAloud?.preferencesEditor?.verbosity.supportedValues ?? [])
    .filter((value) => value !== "custom");

  const items = supportedValues.map((value) => ({
    id: value,
    label: t(`_pendingThoriumLocales.reader.readAlong.preferences.verbosity.values.${ value }`)
  }));

  const prefKey = getPreferenceKey(ThReadAlongKeys.verbosity, "readAlong");

  const updatePreference = useCallback(async (key: Key | null) => {
    if (!readAloud || !key) return;
    await readAloud.submitPreferences({ [prefKey]: key as VerbosityPreset });
    dispatch(setReadAlongVerbosity({ key: verbosityKey, value: readAloud.getSetting(prefKey) }));
  }, [prefKey, readAloud, verbosityKey, dispatch]);

  return (
    <StatefulDropdown
      standalone={ standalone }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.verbosity.title") }
      selectedKey={ verbosity ?? readAloud?.getSetting(prefKey) ?? null }
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
