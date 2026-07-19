"use client";

import { useCallback, useRef } from "react";

import {
  Link,
  Locator,
  Publication
} from "@readium/shared";
import {
  DivinaNavigator,
  DivinaNavigatorListeners,
  DivinaPreferences,
  DivinaSettings,
  IContentProtectionConfig,
  IDivinaDefaults,
  IDivinaPreferences,
  IKeyboardPeripheralsConfig,
  getScriptMode,
  ScriptMode
} from "@readium/navigator";

type cbb = (ok: boolean) => void;

// Module scoped, singleton instance of navigator
let navigatorInstance: DivinaNavigator | null = null;

export interface DivinaNavigatorLoadProps {
  container: HTMLDivElement | null;
  publication: Publication;
  listeners: Partial<DivinaNavigatorListeners>;
  initialPosition?: Locator;
  preferences?: IDivinaPreferences;
  defaults?: IDivinaDefaults;
  contentProtection?: IContentProtectionConfig;
  keyboardPeripherals?: IKeyboardPeripheralsConfig;
}

export const useDivinaNavigator = () => {
  const container = useRef<HTMLDivElement | null>(null);
  const containerParent = useRef<HTMLElement | null>(null);
  const publication = useRef<Publication | null>(null);

  const submitPreferences = useCallback(async (preferences: IDivinaPreferences) => {
    await navigatorInstance?.submitPreferences(new DivinaPreferences(preferences));
  }, []);

  const getSetting = useCallback(<K extends keyof DivinaSettings>(settingKey: K) => {
    return navigatorInstance?.settings[settingKey] as DivinaSettings[K];
  }, []);

  const DivinaNavigatorLoad = useCallback((config: DivinaNavigatorLoadProps, cb: Function) => {
    if (config.container) {
      container.current = config.container;
      containerParent.current = container.current?.parentElement || null;

      publication.current = config.publication;

      const instance = new DivinaNavigator(
        config.container,
        config.publication,
        config.listeners,
        [], // The navigator synthesizes its own positions
        config.initialPosition,
        {
          preferences: config.preferences || {},
          defaults: config.defaults || {},
          contentProtection: config.contentProtection || undefined,
          keyboardPeripherals: config.keyboardPeripherals || undefined
        }
      );
      navigatorInstance = instance;

      instance.load().then(() => {
        // Bail out if a remount may have replaced or destroyed this instance
        // while load() was in flight.
        if (navigatorInstance !== instance) return;

        cb();
      });
    }
  }, []);

  const DivinaNavigatorDestroy = useCallback((cb: Function) => {
    cb();

    const instance = navigatorInstance;
    instance?.destroy().then(() => {
      // Don't clear a newer instance created by a remount
      if (navigatorInstance === instance) navigatorInstance = null;
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

  const scrollBy = useCallback((px: number, animated: boolean, callback: cbb) => {
    navigatorInstance?.scrollBy(px, animated, callback);
  }, []);

  const zoomIn = useCallback(() => {
    navigatorInstance?.zoomIn();
  }, []);

  const zoomOut = useCallback(() => {
    navigatorInstance?.zoomOut();
  }, []);

  const zoomReset = useCallback(() => {
    navigatorInstance?.zoomReset();
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

  // Divina renders images in the host DOM, there are no iframes to observe
  const getCframes = useCallback(() => {
    return [];
  }, []);

  const currentScriptMode = useCallback((): ScriptMode | undefined => {
    const metadata = navigatorInstance?.publication?.metadata;
    if (!metadata) return undefined;
    return getScriptMode(metadata);
  }, []);

  return {
    DivinaNavigatorLoad,
    DivinaNavigatorDestroy,
    goRight,
    goLeft,
    goBackward,
    goForward,
    scrollBy,
    zoomIn,
    zoomOut,
    zoomReset,
    goLink,
    go,
    navLayout,
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
    getScriptMode: currentScriptMode
  }
}
