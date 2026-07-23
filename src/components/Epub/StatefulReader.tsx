"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  ThemeKeyType,
  useFilteredPreferenceKeys
} from "../../preferences";

import readerStyles from "../assets/styles/thorium-web.reader.app.module.css";
import arrowStyles from "../assets/styles/thorium-web.reader.paginatedArrow.module.css";

import {
  ThLayoutDirection,
  ThLayoutUI,
  ThDocumentTitleFormat,
  ThSpacingSettingsKeys,
  ThProgressionFormat,
  ThSettingsKeys,
  ThDockingKeys,
  ThActionsKeys
} from "../../preferences/models";

import { ThPluginRegistry } from "../Plugins/PluginRegistry";
import { ThPluginProvider } from "../Plugins/PluginProvider";
import { NavigatorProvider } from "@/core/Navigator";

import {
  BasicTextSelection,
  ContextMenuEvent,
  FrameClickEvent,
  SuspiciousActivityEvent
} from "@readium/navigator-html-injectables";
import { EpubNavigatorListeners, KeyboardPeripheralEventData } from "@readium/navigator";
import {
  Locator,
  Publication,
  Layout,
  TimelineItem
} from "@readium/shared";
import { PositionStorage, StatefulReaderProps } from "../Reader/StatefulReaderWrapper";

import { StatefulDockingWrapper } from "../Docking/StatefulDockingWrapper";
import { StatefulReaderHeader } from "../StatefulReaderHeader";
import { StatefulReaderArrowButton } from "../StatefulReaderArrowButton";
import { StatefulReaderFooter } from "../StatefulReaderFooter";

import { useLocale } from "react-aria";
import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useSettingsComponentStatus } from "@/components/Settings/hooks/useSettingsComponentStatus";
import { useEpubStatelessCache } from "./Hooks/useEpubStatelessCache";
import { useEpubReaderInit } from "./Hooks/useReaderInit";
import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";
import { useFullscreen } from "@/core/Hooks/useFullscreen";
import { usePrevious } from "@/core/Hooks/usePrevious";
import { useI18n } from "@/i18n/useI18n";
import { usePublicationProgress } from "@/core/Hooks/usePublicationProgress";
import { useTimelineAdjacency } from "@/core/Hooks/useTimelineAdjacency";
import { useTocEntryTracking } from "@/components/Actions/Toc/useTocEntryTracking";
import { useTocTreeBuilder } from "@/core/Hooks/useTocTreeBuilder";
import { useIsScroll, usePositionStorage } from "@/hooks";
import { useDocumentTitle } from "@/core/Hooks/useDocumentTitle";
import { useSpacingPresets } from "../Settings/Spacing/hooks/useSpacingPresets";
import { usePaginatedArrows } from "@/hooks/usePaginatedArrows";
import { useFonts } from "@/core/Hooks/fonts/useFonts";
import { useZoomCallbacks } from "@/components/Settings/hooks/useZoomCallbacks";
import { useFocusedDockableKey } from "../Docking/hooks/useFocusedDockableKey";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";

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
  setProgress,
  setPublicationStart,
  setPublicationEnd
} from "@/lib/publicationReducer";
import { toggleActionOpen, dockAction } from "@/lib/actionsReducer";

import classNames from "classnames";
import debounce from "debounce";
import { buildThemeObject } from "@/preferences/helpers/buildThemeObject";
import { createDefaultPlugin } from "../Plugins/helpers/createDefaultPlugin";
import { NavPeripheralType, fromActionPeripheralType, fromDockingPeripheralType } from "../../helpers/peripherals";
import { getPlatformModifier } from "@/core/Helpers/keyboardUtilities";
import { getReaderClassNames } from "../Helpers/getReaderClassNames";
import { resolveContentProtectionConfig } from "@/preferences/models/protection";

// We need to register plugins before hooks run
// otherwise we can’t access the values of spacing presets
// when the component is effectively mounted as we check
// if the component is registered and displayed from prefs
export const StatefulReader = ({
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
  const { fxlActionKeys, fxlThemeKeys, reflowActionKeys, reflowThemeKeys } = useFilteredPreferenceKeys();
  const { preferences, getFontMetadata, getFontInjectables } = usePreferences();
  const { direction: uiDirection } = useLocale();
  const { t } = useI18n();
  const { getEffectiveSpacingValue } = useSpacingPresets();
  const { occupySpace: arrowsOccupySpace } = usePaginatedArrows();
  const { injectFontResources, removeFontResources, getAndroidFXLPatch } = useFonts();
  
  const container = useRef<HTMLDivElement>(null);
  const arrowsWidth = useRef(2 * ((preferences.theming.arrow.size || 40) + (preferences.theming.arrow.offset || 0)));

  const profile = useAppSelector(state => state.reader.profile);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const isRTL = useAppSelector(state => state.publication.isRTL);
  const positionsList = useAppSelector(state => state.publication.positionsList);
  const fontLanguage = useAppSelector(state => state.publication.fontLanguage);

  // Check if font family component is being used
  const { isComponentUsed: isFontFamilyUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.fontFamily,
    publicationType: isFXL ? "fxl" : "reflow",
  });

  const textAlign = useAppSelector(state => state.settings.textAlign);
  const columnCount = useAppSelector(state => state.settings.columnCount);
  const fontFamily = useAppSelector(state => state.settings.fontFamily);
  const fontSize = useAppSelector(state => state.settings.fontSize);
  const fontWeight = useAppSelector(state => state.settings.fontWeight);
  const hyphens = useAppSelector(state => state.settings.hyphens);
  const ligatures = useAppSelector(state => state.settings.ligatures);
  const noRuby = useAppSelector(state => state.settings.noRuby);
  const letterSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.letterSpacing);
  const lineLength = useAppSelector(state => state.settings.lineLength);
  const lineHeight = getEffectiveSpacingValue(ThSpacingSettingsKeys.lineHeight);
  const paragraphIndent = getEffectiveSpacingValue(ThSpacingSettingsKeys.paragraphIndent);
  const paragraphSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.paragraphSpacing);
  const publisherStyles = useAppSelector(state => state.settings.publisherStyles);
  const isScroll = useIsScroll();
  const textNormalization = useAppSelector(state => state.settings.textNormalization);
  const wordSpacing = getEffectiveSpacingValue(ThSpacingSettingsKeys.wordSpacing);
  const themeObject = useAppSelector(state => state.theming.theme);
  const theme = isFXL ? themeObject.fxl : themeObject.reflow;
  const previousTheme = usePrevious(theme);
  const colorScheme = useAppSelector(state => state.theming.colorScheme);
  const reducedMotion = useAppSelector(state => state.theming.prefersReducedMotion);

  const breakpoint = useAppSelector(state => state.theming.breakpoint);
  const containerBreakpoint = useAppSelector(state => state.theming.containerBreakpoint);
  
  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isHovering = useAppSelector(state => state.reader.isHovering);

  const layoutUI = isFXL 
    ? preferences.theming.layout.ui?.fxl || ThLayoutUI.layered 
    : isScroll 
      ? preferences.theming.layout.ui?.reflow || ThLayoutUI.layered
      : ThLayoutUI.stacked;

  const cache = useEpubStatelessCache(
    textAlign,
    columnCount,
    fontFamily,
    fontSize,
    fontWeight,
    hyphens,
    letterSpacing,
    ligatures,
    lineLength,
    lineHeight,
    noRuby,
    paragraphIndent,
    paragraphSpacing,
    publisherStyles,
    isScroll,
    textNormalization,
    wordSpacing,
    theme,
    positionsList,
    colorScheme,
    reducedMotion,
    layoutUI,
    isImmersive,
    isHovering,
    arrowsOccupySpace
  );

  const atPublicationStart = useAppSelector(state => state.publication.atPublicationStart);
  const atPublicationEnd = useAppSelector(state => state.publication.atPublicationEnd);

  const dispatch = useAppDispatch();
  const getFocusedDockableKey = useFocusedDockableKey();

  useEffect(() => {
    // Reset top bar visibility and last position
    dispatch(setImmersive(false));
  }, [isScroll, dispatch]);

  const onFsChange = useCallback((isFullscreen: boolean) => {
    dispatch(setFullscreen(isFullscreen));
  }, [dispatch]);
  
  const { handleFullscreen } = useFullscreen(onFsChange);

  const epubNavigator = useEpubNavigator();
  const {
    goLeft,
    goRight,
    goBackward,
    goForward,
    navLayout,
    currentPositions,
    canGoBackward,
    canGoForward,
    isScrollStart,
    isScrollEnd,
    getCframes,
    submitPreferences,
    timeline: getNavigatorTimeline
  } = epubNavigator;

  const { setLocalData, getLocalData, localData } = usePositionStorage(localDataKey, positionStorage);

  const tocTree = useAppSelector(state => state.publication.toc?.tree);

  const [currentTimelineItem, setCurrentTimelineItem] = useState<TimelineItem | undefined>(undefined);

  const { updateAdjacentItems, clearAdjacentItems } = useTimelineAdjacency(getNavigatorTimeline);
  const { updateCurrentTocEntry, clearCurrentTocEntry } = useTocEntryTracking(getNavigatorTimeline, tocTree);

  const timeline = usePublicationProgress({
    publication: publication,
    getNavigatorTimeline,
    currentTimelineItem,
    currentLocation: localData,
    currentPositions: currentPositions() || [],
    positionsList: positionsList,
    onChange: (progress) => {
      dispatch(setProgress(progress));
    }
  });

  const documentTitleFormat = preferences.metadata?.documentTitle?.format;
  
  let documentTitle: string | undefined;
  
  if (documentTitleFormat) {
    if (typeof documentTitleFormat === "object" && "key" in documentTitleFormat) {
      const translatedTitle = t(documentTitleFormat.key);
      documentTitle = translatedTitle !== documentTitleFormat.key 
        ? translatedTitle 
        : documentTitleFormat.fallback;
    } else {
      switch (documentTitleFormat) {
        case ThDocumentTitleFormat.title:
          documentTitle = timeline?.title;
          break;
        case ThDocumentTitleFormat.chapter:
          documentTitle = timeline?.progression?.currentChapter;
          break;
        case ThDocumentTitleFormat.titleAndChapter:
          if (timeline?.title && timeline?.progression?.currentChapter) {
            documentTitle = `${ timeline.title } – ${ timeline.progression.currentChapter }`;
          }
          break;
        case ThDocumentTitleFormat.none:
          documentTitle = undefined;
          break;
        default: 
          documentTitle = documentTitleFormat;
          break;
      }
    }
  }

  useDocumentTitle(documentTitle);

  const activateImmersiveOnAction = useCallback(() => {
    if (!cache.current.isImmersive) dispatch(setImmersive(true));
  }, [cache, dispatch]);

  const toggleIsImmersive = useCallback(() => {
    // If tap/click in iframe, then header/footer no longer hovering 
    dispatch(setHovering(false));
    dispatch(toggleImmersive());
  }, [dispatch]);

  // Warning: this is using navigator’s internal methods that will become private, do not rely on them
  // See https://github.com/edrlab/thorium-web/issues/25
  const handleTap = useCallback((event: FrameClickEvent) => {
    const _cframes = getCframes();
    if (_cframes) {
      if (!cache.current.settings.scroll) {
        const oneQuarter = ((_cframes.length === 2 ? _cframes[0]!.window.innerWidth + _cframes[1]!.window.innerWidth : _cframes![0]!.window.innerWidth) * window.devicePixelRatio) / 4;
        
        const navigationCallback = () => {
          dispatch(setUserNavigated(true));
          activateImmersiveOnAction();
        };
    
        if (event.x < oneQuarter) {
          goLeft(!cache.current.reducedMotion, navigationCallback);
        } 
        else if (event.x > oneQuarter * 3) {
          goRight(!cache.current.reducedMotion, navigationCallback);
        } else if (oneQuarter <= event.x && event.x <= oneQuarter * 3) {
          toggleIsImmersive();
        }
      } else {
        if (preferences.affordances.scroll.toggleOnMiddlePointer.includes("tap")) {
          toggleIsImmersive();
        }
      }
    }
  }, [getCframes, cache, preferences.affordances.scroll, goLeft, goRight, dispatch, activateImmersiveOnAction, toggleIsImmersive]);

  const handleClick = useCallback((_event: FrameClickEvent) => {
    if (
      cache.current.layoutUI === ThLayoutUI.layered &&
      ( !cache.current.settings.scroll ||
        preferences.affordances.scroll.toggleOnMiddlePointer.includes("click") )
      ) {
        toggleIsImmersive();
      }
  }, [cache, preferences.affordances.scroll, toggleIsImmersive]);

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

  const moveTo = useCallback((direction: "left" | "right" | "up" | "down" | "home" | "end") => {
    const navigationCallback = () => {
      dispatch(setUserNavigated(true));
      activateImmersiveOnAction();
    };
    switch (direction) {
      case "right":
        !cache.current.settings.scroll && goRight(!cache.current.reducedMotion, navigationCallback);
        break;
      case "left":
        !cache.current.settings.scroll && goLeft(!cache.current.reducedMotion, navigationCallback);
        break;
      default:
        break;
    }
  }, [dispatch, activateImmersiveOnAction, cache, goRight, goLeft]);

  const { zoomIn, zoomOut } = useZoomCallbacks(epubNavigator);

  const goProgression = useCallback((shiftKey?: boolean) => {
    if (!cache.current.settings?.scroll) {
      const cb = () => {
        dispatch(setUserNavigated(true));
        activateImmersiveOnAction();
      };
      shiftKey
        ? goBackward(!cache.current.reducedMotion, cb)
        : goForward(!cache.current.reducedMotion, cb);
    }
  }, [dispatch, activateImmersiveOnAction, cache, goBackward, goForward]);

  const listeners: EpubNavigatorListeners = useMemo(() => ({
    frameLoaded: async function (_wnd: Window): Promise<void> {},
    timelineItemChanged: function (item: TimelineItem | undefined): void {
      setCurrentTimelineItem(item);

      if (!item) {
        clearAdjacentItems();
        clearCurrentTocEntry();
        return;
      }

      updateAdjacentItems(item);
      updateCurrentTocEntry(item);
    },
    positionChanged: async function (locator: Locator): Promise<void> {
      const debouncedHandleProgression = debounce(
        async () => {
          setLocalData(locator);
          updatePublicationNavigationState();
        }, 250);
      debouncedHandleProgression();
    },
    tap: function (_e: FrameClickEvent): boolean {
      handleTap(_e);
      return true;
    },
    click: function (_e: FrameClickEvent): boolean {
      handleClick(_e);
      return true;
    },
    zoom: function (_scale: number): void {},
    miscPointer: function (_amount: number): void {},
    scroll: function (_delta: number): void {
      if (
        cache.current.settings.scroll && 
        navLayout() !== Layout.fixed
      ) {        
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
    textSelected: function (_selection: BasicTextSelection): void {},
    contentProtection: function (_type: string, _data: SuspiciousActivityEvent): void {},
    contextMenu: function (_data: ContextMenuEvent): void {},
    peripheral: function (data: KeyboardPeripheralEventData): void {
      switch (data.type) {
        case NavPeripheralType.progressForward:  goProgression(false); break;
        case NavPeripheralType.progressBackward: goProgression(true);  break;
        case NavPeripheralType.moveRight:        moveTo("right");      break;
        case NavPeripheralType.moveLeft:         moveTo("left");       break;
        case NavPeripheralType.moveUp:           moveTo("up");         break;
        case NavPeripheralType.moveDown:         moveTo("down");       break;
        case NavPeripheralType.moveHome:         moveTo("home");       break;
        case NavPeripheralType.moveEnd:          moveTo("end");        break;
        case NavPeripheralType.zoomIn:           zoomIn();             break;
        case NavPeripheralType.zoomOut:          zoomOut();            break;
        default: {
          const actionKey = fromActionPeripheralType(data.type);

          if (actionKey === ThActionsKeys.fullscreen) {
            handleFullscreen();
            return;
          }

          if (actionKey && profile) {
            dispatch(toggleActionOpen({ key: actionKey, profile }));
            return;
          }

          const dockingKey = fromDockingPeripheralType(data.type);

          if (dockingKey && profile) {
            const actionKey = getFocusedDockableKey(dockingKey as ThDockingKeys);
            if (actionKey) {
              dispatch(dockAction({ key: actionKey, dockingKey: dockingKey as ThDockingKeys, profile }));
            }
          }
        }
      }
    },
  }), [navLayout, setLocalData, dispatch, handleTap, handleClick, cache, preferences.affordances.scroll, isScrollStart, isScrollEnd, updatePublicationNavigationState, moveTo, goProgression, zoomIn, zoomOut, profile, handleFullscreen, getFocusedDockableKey, updateAdjacentItems, clearAdjacentItems, updateCurrentTocEntry, clearCurrentTocEntry]);
  
  // getLocalData() returns a plain JSON.parse()'d object on cold load (not yet a real
  // Locator instance) — EpubNavigator calls Timeline.locate() on this at startup, which
  // needs real prototype methods (.time(), etc.), so deserialize it here at the point of use.
  const initialPosition = useMemo(() => {
    const stored = getLocalData();
    return stored ? (Locator.deserialize(stored) ?? null) : null;
  }, [getLocalData]);

  // Initialize reader using the new composite hook
  const { navigatorReady } = useEpubReaderInit({
    container,
    publication,
    positionsList,
    initialPosition,
    listeners,
    preferences,
    cache,
    isFontFamilyUsed,
    fontLanguage,
    getFontMetadata,
    injectFontResources,
    removeFontResources,
    getAndroidFXLPatch,
    getFontInjectables,
    fxlThemeKeys,
    reflowThemeKeys,
    arrowsOccupySpace,
    arrowsWidth,
    colorScheme,
    isFXL,
    contentProtectionConfig: resolveContentProtectionConfig(preferences.contentProtection, t),

    onNavigatorReady: () => {
      dispatch(setLoading(false));
    }
  });

  useTocTreeBuilder(publication, navigatorReady, getNavigatorTimeline);

  const applyConstraint = useCallback(async (value: number) => {
    await submitPreferences({
      constraint: value
    })
  }, [submitPreferences]);

  useLayoutEffect(() => {
    if (!navigatorReady) return;

    applyConstraint(arrowsOccupySpace ? arrowsWidth.current : 0)
      .catch(console.error);
  }, [arrowsOccupySpace, applyConstraint, navigatorReady]);

  // Theme can also change on colorScheme change so
  // we have to handle this side-effect but we can’t
  // from the ReadingDisplayTheme component since it
  // would have to be mounted for this to work
  useLayoutEffect(() => {
    if (!navigatorReady) return;

    if (cache.current.colorScheme !== colorScheme) {
      cache.current.colorScheme = colorScheme;
    }

    const theme = isFXL ? (themeObject.fxl ?? "auto") : (themeObject.reflow ?? "auto");

    // Protecting against re-applying on theme change
    if (theme !== "auto" && previousTheme !== theme) return;

    const applyCurrentTheme = async () => {
      const themeKeys = isFXL ? fxlThemeKeys : reflowThemeKeys;
      const themeKey = themeKeys.includes(theme as any) ? theme : "auto";
      const themeProps = buildThemeObject<ThemeKeyType>({
        theme: themeKey,
        themeKeys: preferences.theming.themes.keys,
        systemThemes: preferences.theming.themes.systemThemes,
        colorScheme
      });
      await submitPreferences(themeProps);
      dispatch(setTheme({ 
        key: isFXL ? "fxl" : "reflow", 
        value: themeKey 
      }));
    };

    applyCurrentTheme()
      .catch(console.error);
  }, [cache, themeObject, previousTheme, preferences.theming.themes, fxlThemeKeys, reflowThemeKeys, colorScheme, isFXL, submitPreferences, dispatch, navigatorReady]);

  useLayoutEffect(() => {
    dispatch(setDirection(uiDirection as ThLayoutDirection));
    dispatch(setPlatformModifier(getPlatformModifier()));
  }, [uiDirection, dispatch]);

  return (
    <>
    <NavigatorProvider visualNavigator={ epubNavigator }>
      <main className={ readerStyles.main }>
        <StatefulDockingWrapper>
          <div
            ref={ containerRefSetter }
            className={
              getReaderClassNames({
                isScroll,
                isImmersive,
                isHovering,
                isFXL,
                layoutUI,
                breakpoint,
                containerBreakpoint
              })
            }
          >
            <StatefulReaderHeader 
              actionKeys={ isFXL ? fxlActionKeys : reflowActionKeys }
              actionsOrder={ isFXL ? preferences.actions.fxlOrder : preferences.actions.reflowOrder }
              layout={ layoutUI }
              runningHeadFormatPref={
                isFXL 
                  ? preferences.theming.header?.runningHead?.format?.fxl 
                  : preferences.theming.header?.runningHead?.format?.reflow
              } 
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
            publication={ publication }
            progressionFormatPref={
              isFXL 
                ? preferences.theming.progression?.format?.fxl 
                : preferences.theming.progression?.format?.reflow
            }
            progressionFormatFallback={
              isFXL 
                ? ThProgressionFormat.readingOrderIndex
                : ThProgressionFormat.resourceProgression
            }
          />
        </div>
      </StatefulDockingWrapper>
    </main>
  </NavigatorProvider>
  </>
)};