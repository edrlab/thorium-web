"use client";

import { Key, useCallback, useEffect, useMemo, useState } from "react";

import { extractLangRegionFromBCP47 } from "@readium/navigator";
import { ThReadAlongKeys } from "@/preferences";
import { getPreferenceKey } from "../../../Settings/helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import settingsStyles from "../../../Settings/assets/styles/thorium-web.reader.settings.module.css";

import { StatefulDropdown } from "../../../Settings/StatefulDropdown";
import { ListBox, ListBoxItem } from "react-aria-components";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { getLanguageLabel } from "../../helpers/getLanguageLabel";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setReadAlongLanguageOverride } from "@/lib/readAlongSettingsReducer";

const DECLARED = "declared";

export const StatefulReadAlongLanguageOverride = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t, i18n } = useI18n();

  const readAloud = useNavigator().readAloud;
  const languageOverride = useAppSelector(state => state.readAlongSettings.languageOverride);
  const metadataLanguage = useAppSelector(state => state.readAlongPlayer.metadata?.language);
  const dispatch = useAppDispatch();

  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    if (!readAloud) return;
    let cancelled = false;
    readAloud.getLanguages().then((list) => {
      if (!cancelled) setLanguages(list);
    });
    return () => {
      cancelled = true;
    };
  }, [readAloud]);

  const prefKey = getPreferenceKey(ThReadAlongKeys.languageOverride, "readAlong");

  const items = useMemo(() => {
    const declared = metadataLanguage ? extractLangRegionFromBCP47(metadataLanguage)[0] : undefined;
    const overrides = languages
      .filter((language) => language !== declared)
      .map((language) => ({ id: language, label: getLanguageLabel(language, i18n.language) }))
      .sort((a, b) => a.label.localeCompare(b.label, i18n.language));
    return [
      {
        id: DECLARED,
        label: metadataLanguage
          ? t("_pendingThoriumLocales.reader.readAlong.preferences.languageOverride.values.declared", { language: getLanguageLabel(metadataLanguage, i18n.language) })
          : t("_pendingThoriumLocales.reader.readAlong.preferences.languageOverride.values.undeclared")
      },
      ...overrides
    ];
  }, [languages, metadataLanguage, i18n.language, t]);

  const updatePreference = useCallback(async (key: Key | null) => {
    if (!readAloud || !key) return;
    await readAloud.submitPreferences({ [prefKey]: key === DECLARED ? null : String(key) });
    dispatch(setReadAlongLanguageOverride(readAloud.getSetting(prefKey)));
  }, [prefKey, readAloud, dispatch]);

  return (
    <StatefulDropdown
      standalone={ standalone }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.languageOverride.title") }
      selectedKey={ languageOverride ?? readAloud?.getSetting(prefKey) ?? DECLARED }
      onSelectionChange={ updatePreference }
      isDisabled={ !readAloud || items.length <= 1 }
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
