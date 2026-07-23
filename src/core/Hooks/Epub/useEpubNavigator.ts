"use client";

import { useCallback, useRef } from "react";

import {
  Link,
  Locator,
  Publication,
  Timeline
} from "@readium/shared";
import { SerializedLocator } from "@/helpers/serializePositions";
import {
  EpubNavigator,
  EpubNavigatorListeners,
  EpubPreferences,
  EpubSettings,
  IContentProtectionConfig,
  IEpubDefaults,
  IEpubPreferences,
  IInjectablesConfig,
  IKeyboardPeripheralsConfig,
  getScriptMode,
  ScriptMode
} from "@readium/navigator";

type cbb = (ok: boolean) => void;

// Module scoped, singleton instance of navigator
let navigatorInstance: EpubNavigator | null = null;

export interface EpubNavigatorLoadProps {
  container: HTMLDivElement | null;
  publication: Publication;
  listeners: EpubNavigatorListeners;
  positionsList?: SerializedLocator[];
  initialPosition?: Locator;
  preferences?: IEpubPreferences;
  defaults?: IEpubDefaults;
  injectables?: IInjectablesConfig;
  contentProtection?: IContentProtectionConfig;
  keyboardPeripherals?: IKeyboardPeripheralsConfig;
}

export const useEpubNavigator = () => {
  const container = useRef<HTMLDivElement | null>(null);
  const containerParent = useRef<HTMLElement | null>(null);
  const publication = useRef<Publication | null>(null);

  const submitPreferences = useCallback(async (preferences: IEpubPreferences) => {
    await navigatorInstance?.submitPreferences(new EpubPreferences(preferences));
  }, []);

  const getSetting = useCallback(<K extends keyof EpubSettings>(settingKey: K) => {
    return navigatorInstance?.settings[settingKey] as EpubSettings[K];
  }, []);

  const EpubNavigatorLoad = useCallback((config: EpubNavigatorLoadProps, cb: Function) => {
    if (config.container) {
      container.current = config.container;
      containerParent.current = container.current? container.current.parentElement : null;
      
      publication.current = config.publication;

      navigatorInstance = new EpubNavigator(
        config.container,
        config.publication,
        config.listeners,
        config.positionsList?.map((p) => Locator.deserialize(p)).filter((l): l is Locator => !!l),
        config.initialPosition,
        {
          preferences: config.preferences || {},
          defaults: config.defaults || {},
          injectables: config.injectables || undefined,
          contentProtection: config.contentProtection || undefined,
          keyboardPeripherals: config.keyboardPeripherals || [],
        }
      );

      navigatorInstance.load().then(() => {
        cb();
      });
    }
  }, []);

  const EpubNavigatorDestroy = useCallback((cb: Function) => {
    cb();

    navigatorInstance?.destroy().then(() => {
      navigatorInstance = null; // Clear the singleton reference
    });
  }, []);

  const goRight = useCallback((animated: boolean, callback: cbb) => {
    navigatorInstance?.goRight(animated, callback);
  }, []);

  const goLeft = useCallback((animated: boolean, callback: cbb) => {
    navigatorInstance?.goLeft(animated, callback)
  }, []);

  const goBackward = useCallback((animated: boolean, callback: cbb) => {
    navigatorInstance?.goBackward(animated, callback);
  }, []);

  const goForward = useCallback((animated: boolean, callback: cbb) => {
    navigatorInstance?.goForward(animated, callback);
  }, []);

  const goLink = useCallback((link: Link, animated: boolean, callback: cbb) => {
    navigatorInstance?.goLink(link, animated, callback);
  }, []);

  const go = useCallback((locator: Locator, animated: boolean, callback: cbb) => {
    navigatorInstance?.go(locator, animated, callback);
  }, []);

  const navLayout = useCallback(() => {
    return navigatorInstance?.layout;
  }, []);

  const currentLocator = useCallback(() => {
    return navigatorInstance?.currentLocator;
  }, []);

  const currentPositions = useCallback(() => {
    return navigatorInstance?.viewport?.positions;
  }, []);

  const canGoBackward = useCallback(() => {
    return navigatorInstance?.canGoBackward;
  }, []);

  const canGoForward = useCallback(() => {
    return navigatorInstance?.canGoForward;
  }, []);

  const isScrollStart = useCallback(() => {
    return navigatorInstance?.isScrollStart;
  }, []);

  const isScrollEnd = useCallback(() => {
    return navigatorInstance?.isScrollEnd;
  }, []);

  // Warning: this is an internal member that will become private, do not rely on it
  // See https://github.com/edrlab/thorium-web/issues/25
  const getCframes = useCallback(() => {
    return navigatorInstance?._cframes;
  }, []);

  const currentScriptMode = useCallback((): ScriptMode | undefined => {
    const metadata = navigatorInstance?.publication?.metadata;
    if (!metadata) return undefined;
    return getScriptMode(metadata);
  }, []);

  const timeline = useCallback((): Timeline | undefined => {
    return navigatorInstance?.timeline;
  }, []);

  return { 
    EpubNavigatorLoad, 
    EpubNavigatorDestroy, 
    goRight, 
    goLeft, 
    goBackward, 
    goForward,
    goLink, 
    go, 
    navLayout, 
    currentLocator,
    currentPositions,
    canGoBackward,
    canGoForward,
    isScrollStart,
    isScrollEnd,
    preferencesEditor: navigatorInstance?.preferencesEditor,
    getSetting,
    submitPreferences,
    getCframes,
    getScriptMode: currentScriptMode,
    timeline,
  }
}