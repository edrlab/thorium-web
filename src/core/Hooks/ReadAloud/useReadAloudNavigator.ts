"use client";

import { useCallback, useSyncExternalStore } from "react";

import { Locator } from "@readium/shared";
import { FrameClickEvent } from "@readium/navigator-html-injectables";
import {
  GuidedNavigationProvider,
  IReadAloudDefaults,
  IReadAloudPreferences,
  ReadAloudListeners,
  ReadAloudNavigator,
  ReadAloudPreferences,
  ReadAloudSettings,
  ReadAloudState,
  ReadAloudVoicesOptions,
  ReadiumSpeechPlaybackEngine,
  ReadiumSpeechVoice
} from "@readium/navigator";

// Module scoped, singleton instance of navigator
let navigatorInstance: ReadAloudNavigator | null = null;
let loadToken = 0;

const subscribers = new Set<() => void>();

const notify = () => subscribers.forEach((callback) => callback());

const subscribe = (callback: () => void) => {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
};

const getIsLoaded = () => navigatorInstance !== null;

const warn = (error: unknown) => console.warn("ReadAloudNavigator:", error);

const destroyInstance = async () => {
  const instance = navigatorInstance;
  if (!instance) return;
  navigatorInstance = null;
  notify();
  await instance.destroy().catch(warn);
};

export interface ReadAloudNavigatorLoadProps {
  navigator: ConstructorParameters<typeof ReadAloudNavigator>[0];
  listeners: ReadAloudListeners;
  preferences?: IReadAloudPreferences;
  defaults?: IReadAloudDefaults;
  engine?: ReadiumSpeechPlaybackEngine;
  provider?: GuidedNavigationProvider;
}

export const useReadAloudNavigator = () => {
  const isLoaded = useSyncExternalStore(subscribe, getIsLoaded, () => false);

  const submitPreferences = useCallback(async (preferences: IReadAloudPreferences) => {
    await navigatorInstance?.submitPreferences(new ReadAloudPreferences(preferences)).catch(warn);
  }, []);

  const getSetting = useCallback(<K extends keyof ReadAloudSettings>(settingKey: K): ReadAloudSettings[K] | undefined => {
    return navigatorInstance?.settings[settingKey];
  }, []);

  const settings = useCallback((): Readonly<ReadAloudSettings> | undefined => {
    return navigatorInstance?.settings;
  }, []);

  const ReadAloudNavigatorLoad = useCallback(async (config: ReadAloudNavigatorLoadProps, cb?: Function) => {
    const token = ++loadToken;

    await destroyInstance();
    if (token !== loadToken) return;

    try {
      navigatorInstance = new ReadAloudNavigator(
        config.navigator,
        config.listeners,
        {
          engine: config.engine,
          provider: config.provider,
          preferences: config.preferences || {},
          defaults: config.defaults || {}
        }
      );
    } catch (error) {
      warn(error);
      return;
    }

    notify();
    cb?.();
  }, []);

  const ReadAloudNavigatorDestroy = useCallback(async (cb?: Function) => {
    loadToken++;
    cb?.();
    await destroyInstance();
  }, []);

  const play = useCallback(async (from?: Locator) => {
    await navigatorInstance?.play(from).catch(warn);
  }, []);

  const readFromPointer = useCallback(async (event: FrameClickEvent): Promise<boolean> => {
    return await navigatorInstance?.readFromPointer(event).catch((error) => {
      warn(error);
      return false;
    }) ?? false;
  }, []);

  const pause = useCallback(() => {
    navigatorInstance?.pause();
  }, []);

  const stop = useCallback(() => {
    navigatorInstance?.stop();
  }, []);

  const next = useCallback(async (): Promise<boolean> => {
    return await navigatorInstance?.next().catch((error) => {
      warn(error);
      return false;
    }) ?? false;
  }, []);

  const previous = useCallback(async (): Promise<boolean> => {
    return await navigatorInstance?.previous().catch((error) => {
      warn(error);
      return false;
    }) ?? false;
  }, []);

  const state = useCallback((): ReadAloudState => {
    return navigatorInstance?.state ?? "idle";
  }, []);

  const getVoices = useCallback(async (options?: ReadAloudVoicesOptions): Promise<ReadiumSpeechVoice[]> => {
    return await navigatorInstance?.getVoices(options).catch((error) => {
      warn(error);
      return [];
    }) ?? [];
  }, []);

  const setVoice = useCallback((voice: ReadiumSpeechVoice | string) => {
    try {
      navigatorInstance?.setVoice(voice);
    } catch (error) {
      warn(error);
    }
  }, []);

  const getCurrentVoice = useCallback((): ReadiumSpeechVoice | null => {
    return navigatorInstance?.getCurrentVoice() ?? null;
  }, []);

  return {
    ReadAloudNavigatorLoad,
    ReadAloudNavigatorDestroy,
    isLoaded,
    play,
    readFromPointer,
    pause,
    stop,
    next,
    previous,
    state,
    getVoices,
    setVoice,
    getCurrentVoice,
    preferencesEditor: navigatorInstance?.preferencesEditor,
    getSetting,
    settings,
    submitPreferences
  }
}
