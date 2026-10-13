"use client";

import { useEffect, useRef } from "react";

import { IReadAloudDefaults, PublicationGuidedNavigationProvider, ReadAloudListeners } from "@readium/navigator";

import { ReadAlongConfig } from "@/components/Reader/StatefulReaderWrapper";

import { ReadAloudNavigatorLoadProps, useReadAloudNavigator } from "@/core/Hooks/ReadAloud/useReadAloudNavigator";
import { useReadAlongPreferences } from "@/preferences/hooks/useReadAlongPreferences";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { resetReadAlongPlayer, setReadAlongAnyVoiceHasBoundaries, setReadAlongNavigationLocked, setReadAlongStatus, setReadAlongVoiceControls } from "@/lib/readAlongPlayerReducer";
import { useReadAlongState } from "./useReadAlongState";
import { useReadAlongStatelessCache } from "./useReadAlongStatelessCache";
import { useSleepTimerCountdown } from "../../Playback/actions/SleepTimer/hooks/useSleepTimerCountdown";
import { getVoiceControls } from "../helpers/getVoiceControls";
import { useHighlightPresets } from "../Settings/Highlight/hooks/useHighlightPresets";

// Not settings, so pinned rather than left to the navigator's own defaults
const readAlongDefaults: IReadAloudDefaults = {
  segmentation: "sentence",
  format: "plain"
};

interface UseReadAlongInitProps {
  navigatorReady: boolean;
  config?: ReadAlongConfig;
  getVisualNavigator: () => ReadAloudNavigatorLoadProps["navigator"] | null;
}

export const useReadAlongInit = ({
  navigatorReady,
  config,
  getVisualNavigator
}: UseReadAlongInitProps) => {
  const { isActive, setActive } = useReadAlongState();
  const dispatch = useAppDispatch();

  const format = useAppSelector(state => state.readAlongSettings.format);
  const inlineContextualization = useAppSelector(state => state.readAlongSettings.inlineContextualization);
  const verbosity = useAppSelector(state => state.readAlongSettings.verbosity);
  const skip = useAppSelector(state => state.readAlongSettings.skip);
  const contextualize = useAppSelector(state => state.readAlongSettings.contextualize);
  const language = useAppSelector(state => state.readAlongSettings.language);
  const segmentation = useAppSelector(state => state.readAlongSettings.segmentation);
  const pauseDuration = useAppSelector(state => state.readAlongSettings.pauseDuration);
  const autoPause = useAppSelector(state => state.readAlongSettings.autoPause);
  const rate = useAppSelector(state => state.readAlongSettings.rate);
  const pitch = useAppSelector(state => state.readAlongSettings.pitch);
  const volume = useAppSelector(state => state.readAlongSettings.volume);
  const utteranceStyle = useAppSelector(state => state.readAlongSettings.utteranceStyle);
  const wordStyle = useAppSelector(state => state.readAlongSettings.wordStyle);
  const voice = useAppSelector(state => state.readAlongSettings.voice);
  const voiceControls = useAppSelector(state => state.readAlongPlayer.voiceControls);
  const publicationLanguage = useAppSelector(state => state.readAlongPlayer.metadata?.language);

  const cache = useReadAlongStatelessCache(
    format,
    inlineContextualization,
    verbosity,
    skip,
    contextualize,
    language,
    segmentation,
    pauseDuration,
    autoPause,
    rate,
    pitch,
    volume,
    utteranceStyle,
    wordStyle,
    voice,
    voiceControls,
    publicationLanguage
  );
  const { generateFromMarkup, detachable } = useReadAlongPreferences();

  const { ReadAloudNavigatorLoad, ReadAloudNavigatorDestroy, isDetachable, getVoices, setVoice, getCurrentVoice } = useReadAloudNavigator();

  useSleepTimerCountdown();

  const { applyTheme } = useHighlightPresets();

  // Factories may be recreated on each render, so they are read at load time only
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Recolors the highlight when the reading theme changes
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  useEffect(() => {
    if (!navigatorReady || !isActive) return;

    const visualNavigator = getVisualNavigator();
    if (!visualNavigator) return;

    // Read at load time only: settings changes are submitted to the loaded navigator
    const { settings: preferences, voice: storedVoice } = cache.current;

    // Persisted with the player state, but only valid for the navigator they came from
    dispatch(resetReadAlongPlayer());

    // The default voice is picked asynchronously by the engine, so it is only known once state changes
    const syncVoiceControls = () => {
      const voiceControls = getVoiceControls(getCurrentVoice());
      const current = cache.current.voiceControls;
      if (current.boundary !== voiceControls.boundary || current.speed !== voiceControls.speed) {
        dispatch(setReadAlongVoiceControls(voiceControls));
      }
    };

    const listeners: ReadAloudListeners = {
      stateChanged: (state) => {
        dispatch(setReadAlongStatus(state));
        // The toolkit only locks navigation in the content, the app's own navigation is locked with this
        dispatch(setReadAlongNavigationLocked(!isDetachable() && (state === "playing" || state === "loading")));
        syncVoiceControls();
      },
      error: (error) => console.warn("Read along:", error)
    };

    const { publication } = visualNavigator;
    const provider = configRef.current?.provider?.(publication) ?? new PublicationGuidedNavigationProvider(publication, { generateFromMarkup });
    const engine = configRef.current?.engine?.(publication);

    let cancelled = false;

    ReadAloudNavigatorLoad({ navigator: visualNavigator, listeners, preferences, defaults: readAlongDefaults, provider, engine, detachable }, async () => {
      // The engine loads its voices asynchronously, and a voice name set before then is not found
      if (storedVoice) {
        const stored = (await getVoices()).find((item) => item.name === storedVoice);
        if (cancelled) return;
        if (stored) setVoice(stored);
      }
      syncVoiceControls();

      // Same voices as the voice selector, an empty list leaves it unknown
      const { publicationLanguage } = cache.current;
      const voices = await getVoices({ languages: publicationLanguage ? [publicationLanguage] : undefined });
      if (cancelled) return;
      dispatch(setReadAlongAnyVoiceHasBoundaries(voices.length > 0 ? voices.some((item) => getVoiceControls(item).boundary) : null));
    });

    return () => {
      cancelled = true;
      ReadAloudNavigatorDestroy();
      dispatch(resetReadAlongPlayer());
    };
  }, [navigatorReady, isActive, getVisualNavigator, generateFromMarkup, detachable, cache, dispatch, ReadAloudNavigatorLoad, ReadAloudNavigatorDestroy, isDetachable, getVoices, setVoice, getCurrentVoice]);

  // So that the next publication doesn't start reading on its own
  useEffect(() => {
    return () => {
      setActive(false);
    };
  }, [setActive]);
};
