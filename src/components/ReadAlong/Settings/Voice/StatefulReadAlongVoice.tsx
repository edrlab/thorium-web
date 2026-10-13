"use client";

import { Key, useCallback, useEffect, useState } from "react";

import { ReadiumSpeechVoice } from "@readium/navigator";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import settingsStyles from "../../../Settings/assets/styles/thorium-web.reader.settings.module.css";

import { StatefulDropdown } from "../../../Settings/StatefulDropdown";
import { Collection, Header, ListBox, ListBoxItem, ListBoxSection } from "react-aria-components";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { getVoiceControls } from "../../helpers/getVoiceControls";
import { groupVoicesByLanguage } from "../../helpers/groupVoicesByLanguage";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setReadAlongVoice } from "@/lib/readAlongSettingsReducer";
import { setReadAlongVoiceControls } from "@/lib/readAlongPlayerReducer";

export const StatefulReadAlongVoice = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t, i18n } = useI18n();

  const readAloud = useNavigator().readAloud;
  const voice = useAppSelector(state => state.readAlongSettings.voice);
  const language = useAppSelector(state => state.readAlongPlayer.metadata?.language);
  const dispatch = useAppDispatch();

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

  const currentVoice = voice ?? readAloud?.getCurrentVoice()?.name ?? null;

  const voiceGroups = groupVoicesByLanguage(voices, i18n.language);

  const updatePreference = useCallback((key: Key | null) => {
    if (!readAloud || !key || key === currentVoice) return;

    const selectedVoice = voices.find((item) => item.name === key);
    if (!selectedVoice) return;

    readAloud.setVoice(selectedVoice);
    dispatch(setReadAlongVoice(selectedVoice.name));
    dispatch(setReadAlongVoiceControls(getVoiceControls(selectedVoice)));
  }, [readAloud, currentVoice, voices, dispatch]);

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
                      id={ item.name }
                      key={ item.name }
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
