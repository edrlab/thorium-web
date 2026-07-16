"use client";

import { useCallback, useRef } from "react";

import {
  Link,
  Locator,
  Publication,
  Timeline
} from "@readium/shared";
import {
  ExperimentalWebPubNavigator,
  WebPubNavigatorListeners,
  WebPubPreferences,
  WebPubSettings,
  IWebPubDefaults,
  IWebPubPreferences,
  IInjectablesConfig,
  IContentProtectionConfig,
  IKeyboardPeripheralsConfig,
  getScriptMode,
  ScriptMode
} from "@readium/navigator";

type cbb = (ok: boolean) => void;

// Module scoped, singleton instance of navigator
let navigatorInstance: InstanceType<typeof ExperimentalWebPubNavigator> | null = null;

export interface WebPubNavigatorLoadProps {
  container: HTMLDivElement | null;
  publication: Publication;
  listeners: WebPubNavigatorListeners;
  initialPosition?: Locator;
  preferences?: IWebPubPreferences;
  defaults?: IWebPubDefaults;
  injectables?: IInjectablesConfig;
  contentProtection?: IContentProtectionConfig;
  keyboardPeripherals?: IKeyboardPeripheralsConfig;
}

export const useWebPubNavigator = () => {
  const container = useRef<HTMLDivElement | null>(null);
  const containerParent = useRef<HTMLElement | null>(null);
  const publication = useRef<Publication | null>(null);

  const submitPreferences = useCallback(async (preferences: IWebPubPreferences) => {
      await navigatorInstance?.submitPreferences(new WebPubPreferences(preferences));
    }, []);
  
  const getSetting = useCallback(<K extends keyof WebPubSettings>(settingKey: K) => {
      return navigatorInstance?.settings[settingKey] as WebPubSettings[K];
    }, []);

  const WebPubNavigatorLoad = useCallback((config: WebPubNavigatorLoadProps, cb: Function) => {
    if (config.container) {
      container.current = config.container;
      containerParent.current = container.current?.parentElement || null;

      publication.current = config.publication;

      navigatorInstance = new ExperimentalWebPubNavigator(
        config.container, 
        config.publication, 
        config.listeners, 
        config.initialPosition, 
        {
          preferences: config.preferences || {},
          defaults: config.defaults || {},
          injectables: config.injectables || undefined,
          contentProtection: config.contentProtection || undefined,
          keyboardPeripherals: config.keyboardPeripherals || []
        }
      );

      navigatorInstance.load().then(() => {
        cb();
      });
    }
  }, []);

  const WebPubNavigatorDestroy = useCallback((cb: Function) => {
    cb();
    navigatorInstance?.destroy().then(() => {
      navigatorInstance = null; // Clear the singleton reference
    });
  }, []);

  const goRight = useCallback((animated: boolean, callback: cbb) => {
    navigatorInstance?.goRight(animated, callback);
  }, []);

  const goLeft = useCallback((animated: boolean, callback: cbb) => {
    navigatorInstance?.goLeft(animated, callback);
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

  const currentLocator = useCallback(() => {
    return navigatorInstance?.currentLocator;
  }, []);

  const getLocatorAtOffset = useCallback((offset: number) => {
    const readingOrder = navigatorInstance?.publication?.readingOrder;
    if (!readingOrder) return null;

    const currentLocator = navigatorInstance?.currentLocator;
    if (!currentLocator) return null;

    const currentLocatorIndex = readingOrder.findIndexWithHref(currentLocator.href);
    if (currentLocatorIndex === -1) return null;

    const newIndex = currentLocatorIndex + offset;
    if (newIndex < 0 || newIndex >= readingOrder.items.length) return null;

    return readingOrder.items[newIndex];
  }, []);

  const previousLocator = useCallback(() => {
    const link = getLocatorAtOffset(-1);
    if (!link) return null;
    return navigatorInstance?.publication?.manifest?.locatorFromLink(link);
  }, [getLocatorAtOffset]);

  const nextLocator = useCallback(() => {
    const link = getLocatorAtOffset(1);
    if (!link) return null;
    return navigatorInstance?.publication?.manifest?.locatorFromLink(link);
  }, [getLocatorAtOffset]);

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

  const getCframes = useCallback(() => {
    return navigatorInstance?._cframes;
  }, []);

  const currentScriptMode = useCallback((): ScriptMode | undefined => {
    const metadata = navigatorInstance?.publication?.metadata;
    if (!metadata) return undefined;
    return getScriptMode(metadata);
  }, []);

  return {
    WebPubNavigatorLoad, 
    WebPubNavigatorDestroy, 
    goRight, 
    goLeft, 
    goBackward, 
    goForward,
    goLink, 
    go, 
    currentLocator,
    previousLocator,
    nextLocator,
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
    timeline: useCallback((): Timeline | undefined => navigatorInstance?.timeline, []),
  }
}