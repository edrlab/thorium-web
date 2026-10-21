"use client";

import { useEffect, useMemo, useRef } from "react";

import { getVoiceId, IReadAloudDefaults, PublicationGuidedNavigationProvider, ReadAloudListeners, ReadiumSpeechVoice } from "@readium/navigator";

import { ReadAlongConfig } from "@/components/Reader/StatefulReaderWrapper";

import { ReadAloudNavigatorLoadProps, useReadAloudNavigator } from "@/core/Hooks/ReadAloud/useReadAloudNavigator";
import { useReadAlongPreferences } from "@/preferences/hooks/useReadAlongPreferences";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { resetReadAlongPlayer, setReadAlongAnyVoiceHasBoundaries, setReadAlongDetached, setReadAlongNavigationLocked, setReadAlongStatus, setReadAlongVoiceControls } from "@/lib/readAlongPlayerReducer";
import { useReadAlongState } from "./useReadAlongState";
import { useReadAlongStatelessCache } from "./useReadAlongStatelessCache";
import { useReadAlongLanguage } from "./useReadAlongLanguage";
import { useReadAlongVerbosity } from "./useReadAlongVerbosity";
import { useSleepTimerCountdown } from "../../Playback/actions/SleepTimer/hooks/useSleepTimerCountdown";
import { getMainVoiceId } from "../helpers/getMainVoiceId";
import { getVoiceControls } from "../helpers/getVoiceControls";
import { getStoredVoices, toVoicePreference } from "../helpers/voicePreference";
import { useHighlightPresets } from "../Settings/Highlight/hooks/useHighlightPresets";
import { useProsodyPresets } from "../Settings/Prosody/hooks/useProsodyPresets";

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
  const keepCentered = useAppSelector(state => state.readAlongSettings.keepCentered);
  const { verbosity } = useReadAlongVerbosity();
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
  const storedVoices = useAppSelector(state => state.readAlongSettings.voice);
  const languageOverride = useAppSelector(state => state.readAlongSettings.languageOverride);
  const voiceControls = useAppSelector(state => state.readAlongPlayer.voiceControls);
  const publicationLanguage = useReadAlongLanguage();
  const voice = useMemo(() => toVoicePreference(getStoredVoices(storedVoices), publicationLanguage), [storedVoices, publicationLanguage]);

  const cache = useReadAlongStatelessCache(
    format,
    inlineContextualization,
    keepCentered,
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
    languageOverride,
    voiceControls,
    publicationLanguage
  );
  const { generateFromMarkup, detachable, readFromPointer, startInViewport, keepAwake } = useReadAlongPreferences();

  const { ReadAloudNavigatorLoad, ReadAloudNavigatorDestroy, isDetachable, getVoices, getSetting } = useReadAloudNavigator();

  useSleepTimerCountdown();

  const { applyTheme } = useHighlightPresets();
  const { applyLayout } = useProsodyPresets();

  // Factories may be recreated on each render, so they are read at load time only
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Recolors the highlight when the reading theme changes
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // Pausing after each spread becomes pausing after each page outside fixed layout
  useEffect(() => {
    applyLayout();
  }, [applyLayout]);

  useEffect(() => {
    if (!navigatorReady || !isActive) return;

    const visualNavigator = getVisualNavigator();
    if (!visualNavigator) return;

    // Read at load time only: settings changes are submitted to the loaded navigator
    const { settings: preferences } = cache.current;

    // Persisted with the player state, but only valid for the navigator they came from
    dispatch(resetReadAlongPlayer());

    let voices: ReadiumSpeechVoice[] = [];

    // The default voice is picked asynchronously by the engine, so it is only known once state changes
    const syncVoiceControls = () => {
      const voiceId = getMainVoiceId(getSetting("voice"), cache.current.publicationLanguage);
      const mainVoice = voices.find((item) => getVoiceId(item) === voiceId);
      if (!mainVoice) return;
      const voiceControls = getVoiceControls(mainVoice);
      const current = cache.current.voiceControls;
      if (current.boundary !== voiceControls.boundary || current.speed !== voiceControls.speed || current.pitch !== voiceControls.pitch) {
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
      detachedChanged: (detached) => dispatch(setReadAlongDetached(detached)),
      error: (error) => console.warn("Read along:", error)
    };

    const { publication } = visualNavigator;
    const provider = configRef.current?.provider?.(publication) ?? new PublicationGuidedNavigationProvider(publication, { generateFromMarkup });
    const engine = configRef.current?.engine?.(publication);

    let cancelled = false;

    const defaults: IReadAloudDefaults = { ...readAlongDefaults, detachable, readFromPointer, startInViewport };

    ReadAloudNavigatorLoad({ navigator: visualNavigator, listeners, preferences, defaults, provider, engine, keepAwake }, async () => {
      // Same voices as the voice selector, an empty list leaves it unknown
      const { publicationLanguage } = cache.current;
      voices = await getVoices({ languages: publicationLanguage ? [publicationLanguage] : undefined });
      if (cancelled) return;
      syncVoiceControls();
      dispatch(setReadAlongAnyVoiceHasBoundaries(voices.length > 0 ? voices.some((item) => getVoiceControls(item).boundary) : null));
    });

    return () => {
      cancelled = true;
      ReadAloudNavigatorDestroy();
      dispatch(resetReadAlongPlayer());
    };
  }, [navigatorReady, isActive, getVisualNavigator, generateFromMarkup, detachable, readFromPointer, startInViewport, keepAwake, cache, dispatch, ReadAloudNavigatorLoad, ReadAloudNavigatorDestroy, isDetachable, getVoices, getSetting]);

  // So that the next publication doesn't start reading on its own
  useEffect(() => {
    return () => {
      setActive(false);
    };
  }, [setActive]);
};
