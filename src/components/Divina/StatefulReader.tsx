"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  ThemeKeyType,
  useFilteredPreferenceKeys
} from "../../preferences";

import readerStyles from "../assets/styles/thorium-web.reader.app.module.css";
import arrowStyles from "../assets/styles/thorium-web.reader.paginatedArrow.module.css";

import {
  ThActionsKeys,
  ThDockingKeys,
  ThLayoutDirection,
  ThLayoutUI,
  ThProgressionFormat
} from "../../preferences/models";

import { ThPluginRegistry } from "../Plugins/PluginRegistry";

import { useLocale } from "react-aria";
import { ThPluginProvider } from "../Plugins/PluginProvider";
import { NavigatorProvider } from "@/core/Navigator";

import {
  ContextMenuEvent,
  FrameClickEvent,
  SuspiciousActivityEvent
} from "@readium/navigator-html-injectables";
import { DivinaNavigatorListeners, KeyboardPeripheralEventData } from "@readium/navigator";
import {
  Locator,
  Publication
} from "@readium/shared";

import { StatefulDockingWrapper } from "../Docking/StatefulDockingWrapper";
import { StatefulReaderHeader } from "../StatefulReaderHeader";
import { StatefulReaderArrowButton } from "../StatefulReaderArrowButton";
import { StatefulReaderFooter } from "../StatefulReaderFooter";
import { PositionStorage, StatefulReaderProps } from "../Reader/StatefulReaderWrapper";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useDivinaReaderInit } from "./Hooks/useReaderInit";
import { useDivinaNavigator } from "@/core/Hooks/Divina/useDivinaNavigator";
import { useFullscreen } from "@/core/Hooks/useFullscreen";
import { usePrevious } from "@/core/Hooks/usePrevious";
import { useI18n } from "@/i18n/useI18n";
import { useTimeline } from "@/core/Hooks/useTimeline";
import { usePositionStorage } from "@/hooks";

import { toggleActionOpen, dockAction } from "@/lib/actionsReducer";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { useFocusedDockableKey } from "../Docking/hooks/useFocusedDockableKey";

import {
  setTheme
} from "@/lib/themeReducer";
import {
  setImmersive,
  setLoading,
  setHovering,
  toggleImmersive,
  setPlatformModifier,
  setDirection,
  setFullscreen,
  setScrollAffordance,
  setUserNavigated
} from "@/lib/readerReducer";
import {
  setTimeline,
  setPublicationStart,
  setPublicationEnd
} from "@/lib/publicationReducer";

import classNames from "classnames";
import debounce from "debounce";
import { buildThemeObject } from "@/preferences/helpers/buildThemeObject";
import { createDefaultPlugin } from "../Plugins/helpers/createDefaultPlugin";
import { NavPeripheralType, fromActionPeripheralType, fromDockingPeripheralType } from "../../helpers/peripherals";
import { getPlatformModifier } from "@/core/Helpers/keyboardUtilities";
import { getReaderClassNames } from "../Helpers/getReaderClassNames";
import { resolveContentProtectionConfig } from "@/preferences/models/protection";

// We need to register plugins before hooks run
// otherwise we can’t access the values of settings
// when the component is effectively mounted as we check
// if the component is registered and displayed from prefs
export const StatefulDivinaReader = ({
  publication,
  localDataKey,
  plugins,
  positionStorage,
  containerRefSetter
}: StatefulReaderProps) => {
  const [pluginsRegistered, setPluginsRegistered] = useState(false);

  useLayoutEffect(() => {
    if (plugins && plugins.length > 0) {
      plugins.forEach(plugin => {
        ThPluginRegistry.register(plugin);
      });
    } else {
      ThPluginRegistry.register(createDefaultPlugin());
    }
    setPluginsRegistered(true);
  }, [plugins]);

  if (!pluginsRegistered) {
    return null;
  }

  return (
    <>
      <ThPluginProvider>
        <StatefulReaderInner publication={ publication } localDataKey={ localDataKey } positionStorage={ positionStorage } containerRefSetter={ containerRefSetter } />
      </ThPluginProvider>
    </>
  );
};

const StatefulReaderInner = ({ publication, localDataKey, positionStorage, containerRefSetter }: { publication: Publication; localDataKey: string | null; positionStorage?: PositionStorage; containerRefSetter?: (el: Element | null) => void }) => {
  const { divinaActionKeys, divinaThemeKeys } = useFilteredPreferenceKeys();
  const { preferences } = usePreferences();
  const { direction: uiDirection } = useLocale();
  const { t } = useI18n();

  const container = useRef<HTMLDivElement>(null);

  const isRTL = useAppSelector(state => state.publication.isRTL);
  const positionsList = useAppSelector(state => state.publication.positionsList);

  const themeObject = useAppSelector(state => state.theming.theme);
  // Divina shares the fxl theme slot
  const theme = themeObject.fxl;
  const previousTheme = usePrevious(theme);
  const colorScheme = useAppSelector(state => state.theming.colorScheme);
  const reducedMotion = useAppSelector(state => state.theming.prefersReducedMotion);

  const breakpoint = useAppSelector(state => state.theming.breakpoint);
  const containerBreakpoint = useAppSelector(state => state.theming.containerBreakpoint);

  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isHovering = useAppSelector(state => state.reader.isHovering);

  const scrolledPref = useAppSelector(state => state.divinaSettings.scrolled);

  // Effective layout of the navigator, synced once it is loaded
  const [isScroll, setIsScroll] = useState(false);

  const layoutUI = preferences.theming.layout.ui?.divina || ThLayoutUI.layered;

  // Stateless snapshot so stable listeners always read current values
  const cache = useRef({ isImmersive, isScroll, layoutUI, reducedMotion });
  cache.current = { isImmersive, isScroll, layoutUI, reducedMotion };

  const atPublicationStart = useAppSelector(state => state.publication.atPublicationStart);
  const atPublicationEnd = useAppSelector(state => state.publication.atPublicationEnd);

  const dispatch = useAppDispatch();

  useEffect(() => {
    // Reset top bar visibility and last position
    dispatch(setImmersive(false));
  }, [isScroll, dispatch]);

  const onFsChange = useCallback((isFullscreen: boolean) => {
    dispatch(setFullscreen(isFullscreen));
  }, [dispatch]);
  const fs = useFullscreen(onFsChange);

  const divinaNavigator = useDivinaNavigator();
  const {
    goLeft,
    goRight,
    goBackward,
    goForward,
    scrollBy,
    goLink,
    zoomIn,
    zoomOut,
    zoomReset,
    currentPositions,
    canGoBackward,
    canGoForward,
    isScrollStart,
    isScrollEnd,
    getSetting,
    submitPreferences
  } = divinaNavigator;

  const { setLocalData, getLocalData, localData } = usePositionStorage(localDataKey, positionStorage);

  useTimeline({
    publication: publication,
    currentLocation: localData,
    currentPositions: currentPositions() || [],
    positionsList: positionsList,
    onChange: (timeline) => {
      dispatch(setTimeline(timeline));
    }
  });

  const activateImmersiveOnAction = useCallback(() => {
    if (!cache.current.isImmersive) dispatch(setImmersive(true));
  }, [cache, dispatch]);

  const toggleIsImmersive = useCallback(() => {
    // If tap/click on the middle zone, then header/footer no longer hovering
    dispatch(setHovering(false));
    dispatch(toggleImmersive());
  }, [dispatch]);

  // We could use canGoBackward() and canGoForward() directly on arrows
  // but maybe we will need to sync the state for other features in the future
  const updatePublicationNavigationState = useCallback(() => {
    if (canGoBackward()) {
      dispatch(setPublicationStart(false));
    } else {
      dispatch(setPublicationStart(true));
    }

    if (canGoForward()) {
      dispatch(setPublicationEnd(false));
    } else {
      dispatch(setPublicationEnd(true));
    }
  }, [canGoBackward, canGoForward, dispatch]);

  const getFocusedDockableKey = useFocusedDockableKey();

  // Native-like line step for arrow keys in scrolled mode; page keys and
  // Space keep the viewport-sized go* step. The distinct step sizes are what
  // make a held PageDown outpace a held arrow key.
  const LINE_STEP_PX = 64;

  const moveTo = useCallback((direction: "left" | "right" | "up" | "down" | "home" | "end", lineStep = false) => {
    const navigationCallback = () => {
      dispatch(setUserNavigated(true));
      activateImmersiveOnAction();
    };

    switch(direction) {
      case "right":
        goRight(!cache.current.reducedMotion, navigationCallback);
        break;
      case "left":
        goLeft(!cache.current.reducedMotion, navigationCallback);
        break;
      case "up":
        if (cache.current.isScroll && lineStep) scrollBy(-LINE_STEP_PX, !cache.current.reducedMotion, navigationCallback);
        else goBackward(!cache.current.reducedMotion, navigationCallback);
        break;
      case "down":
        if (cache.current.isScroll && lineStep) scrollBy(LINE_STEP_PX, !cache.current.reducedMotion, navigationCallback);
        else goForward(!cache.current.reducedMotion, navigationCallback);
        break;
      case "home": {
        // Instant jump: animating across the publication would sweep
        // through (and needlessly load) every page in between
        const first = publication?.readingOrder.items[0];
        if (first) goLink(first, false, navigationCallback);
        break;
      }
      case "end": {
        const items = publication?.readingOrder.items;
        const last = items?.[items.length - 1];
        if (last) goLink(last, false, navigationCallback);
        break;
      }
      default:
        break;
    }
  }, [dispatch, activateImmersiveOnAction, cache, goRight, goLeft, goBackward, goForward, scrollBy, goLink, publication]);

  const goProgression = useCallback((shiftKey?: boolean) => {
    const callback = () => {
      dispatch(setUserNavigated(true));
      activateImmersiveOnAction();
    };
    shiftKey
      ? goBackward(!cache.current.reducedMotion, callback)
      : goForward(!cache.current.reducedMotion, callback);
  }, [dispatch, activateImmersiveOnAction, cache, goBackward, goForward]);

  const zoom = useCallback((action: "in" | "out" | "reset") => {
    // Zoom applies to paged mode; scrolled mode has no zoom.
    // The keyCombos are already gated on !isScroll via an observable
    // condition, this guard is defense in depth.
    if (cache.current.isScroll) return;
    if (action === "in") zoomIn();
    else if (action === "out") zoomOut();
    else zoomReset();
  }, [cache, zoomIn, zoomOut, zoomReset]);

  const initialPositionSeen = useRef(false);

  // Hoisted so rapid position changes (holding a key, chained page turns)
  // coalesce into one trailing storage write instead of one per event
  const debouncedHandleProgression = useMemo(() => debounce(
    (locator: Locator) => {
      setLocalData(locator);
      updatePublicationNavigationState();
    }, 250), [setLocalData, updatePublicationNavigationState]);

  useEffect(() => () => debouncedHandleProgression.clear(), [debouncedHandleProgression]);

  const listeners: Partial<DivinaNavigatorListeners> = useMemo(() => ({
    positionChanged: function (locator: Locator): void {
      // In paged mode every position change is a page turn, whatever the
      // input (keyboard, wheel, swipe, tap zones): enter immersive reading
      // and mark the navigation so arrow affordances can discard themselves,
      // like keyboard navigation does. The initial restore doesn't count.
      // Scrolled mode is handled by the scroll listener instead.
      if (!cache.current.isScroll) {
        if (initialPositionSeen.current) {
          dispatch(setUserNavigated(true));
          activateImmersiveOnAction();
        }
        else initialPositionSeen.current = true;
      }
      debouncedHandleProgression(locator);
    },
    // Return false so the navigator handles its built-in quarter zones:
    // left/right quarter turn the page, the middle zone fires miscPointer
    tap: function (_e: FrameClickEvent): boolean {
      return false;
    },
    click: function (_e: FrameClickEvent): boolean {
      return false;
    },
    zoom: function (_scale: number): void {},
    miscPointer: function (_amount: number): void {
      toggleIsImmersive();
    },
    scroll: function (_delta: number): void {
      if (cache.current.isScroll) {
        if (isScrollStart() || isScrollEnd()) {
          if (
            // Keep consistent with pagination behavior
            cache.current.layoutUI === ThLayoutUI.layered
          ) {
            dispatch(setScrollAffordance(true));
          }
        } else if (!cache.current.isImmersive && _delta > 20) {
          if (preferences.affordances.scroll.hideOnForwardScroll) {
            dispatch(setImmersive(true));
          }
        } else if (cache.current.isImmersive && _delta < -20) {
          if (
            // Keep consistent with pagination behavior
            cache.current.layoutUI === ThLayoutUI.layered &&
            preferences.affordances.scroll.showOnBackwardScroll
          ) {
            dispatch(setImmersive(false));
          }
        }
      }
    },
    customEvent: function (_key: string, _data: unknown): void {},
    handleLocator: function (locator: Locator): boolean {
      const href = locator.href;

      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        if (confirm(`Open "${href}" ?`)) window.open(href, "_blank");
      } else {
        console.warn("Unhandled locator", locator);
      }
      return false;
    },
    contentProtection: function (_type: string, _data: SuspiciousActivityEvent): void {},
    contextMenu: function (_data: ContextMenuEvent): void {},
    peripheral: function (data: KeyboardPeripheralEventData): void {
      switch (data.type) {
        case NavPeripheralType.progressForward:  goProgression(false); break;
        case NavPeripheralType.progressBackward: goProgression(true);  break;
        case NavPeripheralType.moveRight:        moveTo("right");      break;
        case NavPeripheralType.moveLeft:         moveTo("left");       break;
        case NavPeripheralType.moveUp:           moveTo("up",   data.keyCode === 38); break;
        case NavPeripheralType.moveDown:         moveTo("down", data.keyCode === 40); break;
        case NavPeripheralType.moveHome:         moveTo("home");       break;
        case NavPeripheralType.moveEnd:          moveTo("end");        break;
        case NavPeripheralType.zoomIn:           zoom("in");           break;
        case NavPeripheralType.zoomOut:          zoom("out");          break;
        case NavPeripheralType.zoomReset:        zoom("reset");        break;
        default: {
          const actionKey = fromActionPeripheralType(data.type);

          if (actionKey === ThActionsKeys.fullscreen) {
            fs.handleFullscreen();
            return;
          }

          if (actionKey) {
            dispatch(toggleActionOpen({ key: actionKey, profile: "divina" }));
            return;
          }

          const dockingKey = fromDockingPeripheralType(data.type);

          if (dockingKey) {
            const actionKey = getFocusedDockableKey(dockingKey as ThDockingKeys);
            if (actionKey) {
              dispatch(dockAction({ key: actionKey, dockingKey: dockingKey as ThDockingKeys, profile: "divina" }));
            }
          }
        }
      }
    },
  }), [debouncedHandleProgression, toggleIsImmersive, activateImmersiveOnAction, cache, preferences.affordances.scroll, isScrollStart, isScrollEnd, dispatch, moveTo, goProgression, zoom, fs, getFocusedDockableKey]);

  const initialPosition = useMemo(() => getLocalData(), [getLocalData]);

  // Initialize reader using the composite hook
  const { navigatorReady } = useDivinaReaderInit({
    container,
    publication,
    initialPosition,
    listeners,
    contentProtectionConfig: resolveContentProtectionConfig(preferences.contentProtection, t),
    onNavigatorReady: () => {
      dispatch(setLoading(false));
    },
  });

  // Keep the effective layout in sync with the navigator, including
  // natively scrolled publications (webtoons) that force scrolled mode
  useEffect(() => {
    if (!navigatorReady) return;
    setIsScroll(getSetting("scrolled") ?? false);
  }, [navigatorReady, scrolledPref, getSetting]);

  // Theme can also change on colorScheme change so
  // we have to handle this side-effect but we can’t
  // from the StatefulTheme component since it
  // would have to be mounted for this to work
  useLayoutEffect(() => {
    if (!navigatorReady) return;

    const theme = themeObject.fxl ?? "auto";

    // Protecting against re-applying on theme change
    if (theme !== "auto" && previousTheme !== theme) return;

    const applyCurrentTheme = async () => {
      const themeKey = divinaThemeKeys.includes(theme as any) ? theme : "auto";
      const themeProps = buildThemeObject<ThemeKeyType>({
        theme: themeKey,
        themeKeys: preferences.theming.themes.keys,
        systemThemes: preferences.theming.themes.systemThemes,
        colorScheme
      });
      await submitPreferences(themeProps);
      dispatch(setTheme({
        key: "fxl",
        value: themeKey
      }));
    };

    applyCurrentTheme()
      .catch(console.error);
  }, [themeObject, previousTheme, preferences.theming.themes, divinaThemeKeys, colorScheme, submitPreferences, dispatch, navigatorReady]);

  useLayoutEffect(() => {
    dispatch(setDirection(uiDirection as ThLayoutDirection));
    dispatch(setPlatformModifier(getPlatformModifier()));
  }, [uiDirection, dispatch]);

  return (
    <>
    <NavigatorProvider visualNavigator={ divinaNavigator }>
      <main className={ readerStyles.main }>
        <StatefulDockingWrapper>
          <div
            ref={ containerRefSetter }
            className={
              getReaderClassNames({
                isScroll,
                isImmersive,
                isHovering,
                isFXL: true,
                layoutUI,
                breakpoint,
                containerBreakpoint
              })
            }
          >
            <StatefulReaderHeader
              actionKeys={ divinaActionKeys }
              actionsOrder={ preferences.actions.divinaOrder ?? preferences.actions.fxlOrder }
              layout={ layoutUI }
              runningHeadFormatPref={ preferences.theming.header?.runningHead?.format?.divina }
            />

          { !isScroll
            ? <nav className={ classNames(arrowStyles.container, arrowStyles.leftContainer) }>
                <StatefulReaderArrowButton
                  direction="left"
                  isDisabled={ isRTL ? atPublicationEnd : atPublicationStart }
                  onPress={ () => {
                    const navigationCallback = () => {
                      dispatch(setUserNavigated(true));
                      activateImmersiveOnAction();
                    };
                    goLeft(!reducedMotion, navigationCallback);
                  }}
                />
            </nav>
            : <></> }

            <article className={ readerStyles.wrapper } aria-label={ t("reader.app.publicationWrapper") }>
              <div id="thorium-web-container" className={ readerStyles.iframeContainer } ref={ container }></div>
            </article>

          { !isScroll
            ? <nav className={ classNames(arrowStyles.container, arrowStyles.rightContainer) }>
                <StatefulReaderArrowButton
                  direction="right"
                  isDisabled={ isRTL ? atPublicationStart : atPublicationEnd }
                  onPress={ () => {
                    const navigationCallback = () => {
                      dispatch(setUserNavigated(true));
                      activateImmersiveOnAction();
                    };
                    goRight(!reducedMotion, navigationCallback);
                  }}
                />
              </nav>
            : <></> }

          <StatefulReaderFooter
            layout={ layoutUI }
            progressionFormatPref={ preferences.theming.progression?.format?.divina }
            progressionFormatFallback={ ThProgressionFormat.readingOrderIndex }
          />
        </div>
      </StatefulDockingWrapper>
    </main>
  </NavigatorProvider>
  </>
)};
