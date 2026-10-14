"use client";

import { Key, useCallback, useEffect, useState } from "react";

import { getVoiceId, ReadiumSpeechVoice } from "@readium/navigator";

import { ThReadAlongKeys } from "@/preferences";
import { getPreferenceKey } from "../../../Settings/helpers/settingsKeyMapping";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import settingsStyles from "../../../Settings/assets/styles/thorium-web.reader.settings.module.css";

import { StatefulDropdown } from "../../../Settings/StatefulDropdown";
import { Collection, Header, ListBox, ListBoxItem, ListBoxSection } from "react-aria-components";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { getMainVoiceId } from "../../helpers/getMainVoiceId";
import { getVoiceControls } from "../../helpers/getVoiceControls";
import { groupVoicesByLanguage } from "../../helpers/groupVoicesByLanguage";
import { useReadAlongLanguage } from "../../Hooks/useReadAlongLanguage";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setReadAlongVoice } from "@/lib/readAlongSettingsReducer";
import { setReadAlongVoiceControls } from "@/lib/readAlongPlayerReducer";

export const StatefulReadAlongVoice = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t, i18n } = useI18n();

  const readAloud = useNavigator().readAloud;
  const voice = useAppSelector(state => state.readAlongSettings.voice);
  const language = useReadAlongLanguage();
  const dispatch = useAppDispatch();

  const prefKey = getPreferenceKey(ThReadAlongKeys.voice, "readAlong");

  const [voices, setVoices] = useState<ReadiumSpeechVoice[]>([]);

  useEffect(() => {
    if (!readAloud) return;
    let cancelled = false;
    readAloud.getVoices({ languages: language ? [language] : undefined }).then((list) => {
      if (!cancelled) setVoices(list);
    });
    return () => {
      cancelled = true;
    };
  }, [readAloud, language]);

  const currentVoice = voice ?? getMainVoiceId(readAloud?.getSetting(prefKey), language);

  const voiceGroups = groupVoicesByLanguage(voices, i18n.language);

  const updatePreference = useCallback(async (key: Key | null) => {
    if (!readAloud || !key || key === currentVoice) return;

    const selectedVoice = voices.find((item) => getVoiceId(item) === key);
    if (!selectedVoice) return;

    const voiceId = getVoiceId(selectedVoice);
    await readAloud.submitPreferences({ [prefKey]: voiceId });
    dispatch(setReadAlongVoice(voiceId));
    dispatch(setReadAlongVoiceControls(getVoiceControls(selectedVoice)));
  }, [readAloud, currentVoice, voices, prefKey, dispatch]);

  return (
    <StatefulDropdown
      standalone={ standalone }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.voice.title") }
      selectedKey={ currentVoice }
      onSelectionChange={ updatePreference }
      isDisabled={ !readAloud || voiceGroups.length === 0 }
      compounds={ {
        listbox: (
          <ListBox
            className={ settingsStyles.dropdownListbox }
            items={ voiceGroups }
          >
            { (group) => (
              <ListBoxSection
                className={ settingsStyles.dropdownListboxSection }
                id={ group.id }
                key={ group.id }
              >
                <Header className={ settingsStyles.dropdownListboxHeader }>
                  { group.label }
                </Header>
                <Collection items={ group.voices }>
                  { (item) => (
                    <ListBoxItem
                      className={ settingsStyles.dropdownListboxItem }
                      id={ getVoiceId(item) }
                      key={ getVoiceId(item) }
                      textValue={ item.label }
                    >
                      { item.label }
                    </ListBoxItem>
                  )}
                </Collection>
              </ListBoxSection>
            )}
          </ListBox>
        )
      }}
    />
  )
}
