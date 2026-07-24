"use client";

import { useCallback, useRef } from "react";

import {
  Link,
  Locator,
  Publication,
  Timeline
} from "@readium/shared";
import {
  AudioNavigator,
  AudioNavigatorListeners,
  AudioPreferences,
  IAudioPreferences,
  IAudioDefaults,
  IContentProtectionConfig,
  IKeyboardPeripheralsConfig,
} from "@readium/navigator";
import { AudioSettings } from "./useAudioSettingsCache";

type cbb = (ok: boolean) => void;

// Module scoped, singleton instance of navigator
let navigatorInstance: AudioNavigator | null = null;

export interface AudioNavigatorLoadProps {
  publication: Publication;
  listeners: AudioNavigatorListeners;
  initialPosition?: Locator;
  preferences?: IAudioPreferences;
  defaults?: IAudioDefaults;
  contentProtection?: IContentProtectionConfig;
  keyboardPeripherals?: IKeyboardPeripheralsConfig;
  audioContext?: AudioContext;
}

export const useAudioNavigator = () => {
  const publication = useRef<Publication | null>(null);

  const submitPreferences = useCallback(async (preferences: IAudioPreferences) => {
    await navigatorInstance?.submitPreferences(new AudioPreferences(preferences));
  }, []);

  const getSetting = useCallback(<K extends keyof AudioSettings>(settingKey: K) => {
    return navigatorInstance?.settings?.[settingKey as keyof typeof navigatorInstance.settings];
  }, []);

  const AudioNavigatorLoad = useCallback((config: AudioNavigatorLoadProps, cb: Function) => {
    publication.current = config.publication;

    navigatorInstance = new AudioNavigator(
      config.publication,
      config.listeners,
      config.initialPosition,
      {
        preferences: config.preferences || {},
        defaults: config.defaults || {},
        contentProtection: config.contentProtection,
        keyboardPeripherals: config.keyboardPeripherals,
      }
    );

    cb();
  }, []);

  const AudioNavigatorDestroy = useCallback((cb: Function) => {
    cb();
    navigatorInstance?.destroy();
    navigatorInstance = null;
  }, []);

  const play = useCallback(() => {
    navigatorInstance?.play();
  }, []);

  const pause = useCallback(() => {
    navigatorInstance?.pause();
  }, []);

  const stop = useCallback(() => {
    navigatorInstance?.stop();
  }, []);

  const seek = useCallback((time: number) => {
    navigatorInstance?.seek(time);
  }, []);

  const jump = useCallback((seconds: number) => {
    navigatorInstance?.jump(seconds);
  }, []);

  const skipForward = useCallback(() => {
    navigatorInstance?.skipForward();
  }, []);

  const skipBackward = useCallback(() => {
    navigatorInstance?.skipBackward();
  }, []);

  const go = useCallback((locator: Locator, animated: boolean, callback: cbb) => {
    navigatorInstance?.go(locator, animated, callback);
  }, []);

  const goLink = useCallback((link: Link, animated: boolean, callback: cbb) => {
    navigatorInstance?.goLink(link, animated, callback);
  }, []);

  const goForward = useCallback((animated: boolean, callback: cbb) => {
    navigatorInstance?.goForward(animated, callback);
  }, []);

  const goBackward = useCallback((animated: boolean, callback: cbb) => {
    navigatorInstance?.goBackward(animated, callback);
  }, []);

  const currentLocator = useCallback(() => {
    return navigatorInstance?.currentLocator;
  }, []);

  const canGoBackward = useCallback(() => {
    return navigatorInstance?.canGoBackward || false;
  }, []);

  const canGoForward = useCallback(() => {
    return navigatorInstance?.canGoForward || false;
  }, []);

  const isTrackStart = useCallback(() => {
    return navigatorInstance?.isTrackStart || false;
  }, []);

  const isTrackEnd = useCallback(() => {
    return navigatorInstance?.isTrackEnd || false;
  }, []);

  const isPlaying = useCallback(() => {
    return navigatorInstance?.isPlaying || false;
  }, []);

  const isPaused = useCallback(() => {
    return navigatorInstance?.isPaused || false;
  }, []);

  const duration = useCallback(() => {
    return navigatorInstance?.duration || 0;
  }, []);

  const currentTime = useCallback(() => {
    return navigatorInstance?.currentTime || 0;
  }, []);

  const timeline = useCallback((): Timeline | undefined => {
    return navigatorInstance?.timeline;
  }, []);

  return {
    AudioNavigatorLoad, 
    AudioNavigatorDestroy, 
    play,
    pause,
    stop,
    seek,
    jump,
    skipForward,
    skipBackward,
    go, 
    goLink, 
    goForward,
    goBackward,
    currentLocator,
    canGoBackward,
    canGoForward,
    isTrackStart,
    isTrackEnd,
    isPlaying,
    isPaused,
    duration,
    currentTime,
    preferencesEditor: navigatorInstance?.preferencesEditor,
    remotePlayback: (navigatorInstance as any)?.remotePlayback as RemotePlayback | undefined,
    getSetting,
    submitPreferences,
    timeline,
  }
}
