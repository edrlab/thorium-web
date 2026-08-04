import { useContext, useMemo } from "react";
import { NavigatorContext } from "../NavigatorProvider";
import { EpubSettings, WebPubSettings, FXLFrameManager, FrameManager, WebPubFrameManager, ScriptMode } from "@readium/navigator";
import { Link, Locator } from "@readium/shared";

// Import the navigator hook types
import type { useEpubNavigator } from "../../Hooks/Epub/useEpubNavigator";
import type { useWebPubNavigator } from "../../Hooks/WebPub/useWebPubNavigator";
import type { useAudioNavigator } from "../../Hooks/Audio/useAudioNavigator";

// Define proper types for navigator interfaces
type VisualNavigator = ReturnType<typeof useEpubNavigator> | ReturnType<typeof useWebPubNavigator>;
type MediaNavigator = ReturnType<typeof useAudioNavigator>;

// Union of all settings keys across both navigator types
type AllVisualSettings = EpubSettings & WebPubSettings;

// Define the callback type used across navigators
type NavigationCallback = (ok: boolean) => void;

// Define the unified navigator interface
interface UnifiedNavigator {
  // Navigation methods available in both
  go(locator: Locator, animated: boolean, callback: NavigationCallback): void;
  goLink(link: Link, animated: boolean, callback: NavigationCallback): void;
  currentLocator(): Locator | undefined;

  // Unified forward/backward navigation
  goForward(animated: boolean, callback: NavigationCallback): void;
  goBackward(animated: boolean, callback: NavigationCallback): void;

  // Check if navigator is visual
  isVisual(): boolean;

  // Script mode of the current publication (undefined for media navigators)
  getScriptMode(): ScriptMode | undefined;

  // Visual-specific methods (only available when isVisual() is true)
  getCframes?(): (FXLFrameManager | FrameManager | WebPubFrameManager | undefined)[] | undefined;

  // Access to underlying navigator for advanced use cases
  underlying: VisualNavigator | MediaNavigator;
}

// getSetting wrapper covering all settings from both navigator types
const createUnifiedGetSetting = (navigator: VisualNavigator) => {
  return <K extends keyof AllVisualSettings>(settingKey: K): AllVisualSettings[K] => {
    return (navigator.getSetting as (key: K) => AllVisualSettings[K])(settingKey);
  };
};

// Type guards to check navigator type - using context reference instead of fragile method detection
const isVisualNavigator = (
  navigator: VisualNavigator | MediaNavigator, 
  contextVisual: VisualNavigator | undefined
): navigator is VisualNavigator => {
  return navigator === contextVisual;
};

export const useNavigator = () => {
  const context = useContext(NavigatorContext);
  if (!context) {
    throw new Error("useNavigator must be used within NavigatorProvider");
  }

  // Build unified navigator, recreating only when the underlying navigators change
  const unified = useMemo<UnifiedNavigator>(() => {
    // Prefer visual navigator when available, fallback to media
    const navigator = context.visual || context.media;
    if (!navigator) throw new Error("No navigator available");

    const isVisual = isVisualNavigator(navigator, context.visual);

    return {
      go: (locator: Locator, animated: boolean, callback: NavigationCallback) => {
        return navigator.go(locator, animated, callback);
      },
      goLink: (link: Link, animated: boolean, callback: NavigationCallback) => {
        return navigator.goLink(link, animated, callback);
      },
      currentLocator: (): Locator | undefined => navigator.currentLocator(),

      goForward: (animated: boolean, callback: NavigationCallback) => {
        if (navigator.goForward) {
          return navigator.goForward(animated, callback);
        }
        return callback?.(false);
      },

      goBackward: (animated: boolean, callback: NavigationCallback) => {
        if (navigator.goBackward) {
          return navigator.goBackward(animated, callback);
        }
        return callback?.(false);
      },

      isVisual: () => isVisual,

      getScriptMode: (): ScriptMode | undefined => {
        if (isVisual && (navigator as ReturnType<typeof useEpubNavigator> | ReturnType<typeof useWebPubNavigator>).getScriptMode) {
          return (navigator as ReturnType<typeof useEpubNavigator> | ReturnType<typeof useWebPubNavigator>).getScriptMode?.();
        }
        return undefined;
      },

      getCframes: isVisual ? navigator.getCframes?.bind(navigator) : undefined,

      underlying: navigator
    };
  }, [context.visual, context.media]);

  // Memoize visual navigator wrapper to prevent recreation
  const visualMemo = useMemo(() => {
    if (!context.visual) return null;
    
    const visualNavigator = context.visual;
    return {
      ...visualNavigator,
      getSetting: createUnifiedGetSetting(visualNavigator)
    };
  }, [context.visual]);

  // Memoize media navigator to prevent recreation
  const mediaMemo = useMemo(() => {
    return context.media;
  }, [context.media]);

  return useMemo(() => ({
    get visual() {
      if (!visualMemo) throw new Error("Visual navigator not available");
      return visualMemo;
    },
    get media() {
      if (!mediaMemo) throw new Error("Media navigator not available");
      return mediaMemo;
    },
    get unified(): UnifiedNavigator {
      return unified;
    }
  }), [visualMemo, mediaMemo, unified]);
};