"use client";

import { useCallback, useEffect, useRef } from "react";

import { 
  defaultFontFamilyOptions, 
  defaultLineHeights, 
  ThemeKeyType, 
  usePreferenceKeys, 
  useTheming
} from "../../preferences";

import Locale from "../../resources/locales/en.json";
import { AppLocale } from "./AppLocale";

import "../assets/styles/reader.css";
import arrowStyles from "../assets/styles/readerArrowButton.module.css";

import { 
  ThActionsKeys, 
  ThBreakpoints, 
  ThLineHeightOptions, 
  ThScrollBackTo, 
  ThSettingsKeys, 
  ThTextAlignOptions, 
  ThLayoutStrategy, 
  ThLayoutUI
} from "../../preferences/models/enums";
import { ThColorScheme } from "@/core/Hooks/useColorScheme";

import { ThPlugin, ThPluginRegistry } from "../Plugins/PluginRegistry";

import { I18nProvider } from "react-aria";
import { ThPluginProvider } from "../Plugins/PluginProvider";

import {
  BasicTextSelection,
  FrameClickEvent,
} from "@readium/navigator-html-injectables";
import { 
  EpubNavigatorListeners, 
  FrameManager, 
  FXLFrameManager, 
  IEpubDefaults, 
  IEpubPreferences,  
  LayoutStrategy,  
  TextAlignment
} from "@readium/navigator";
import { 
  Locator, 
  Manifest, 
  Publication, 
  Fetcher, 
  HttpFetcher, 
  EPUBLayout, 
  ReadingProgression, 
  Link
} from "@readium/shared";

import { StatefulDockingWrapper } from "../Docking/StatefulDockingWrapper";
import { StatefulReaderHeader } from "../StatefulReaderHeader";
import { StatefulReaderArrowButton } from "../StatefulReaderArrowButton";
import { StatefulReaderFooter } from "../StatefulReaderFooter";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";
import { useFullscreen } from "@/core/Hooks/useFullscreen";
import { usePrevious } from "@/core/Hooks/usePrevious";

import { toggleActionOpen } from "@/lib/actionsReducer";
import { useAppSelector, useAppDispatch, useAppStore } from "@/lib/hooks";
import { AppDispatch } from "@/lib/store";
import { 
  setBreakpoint, 
  setColorScheme, 
  setContrast, 
  setForcedColors, 
  setMonochrome, 
  setReducedMotion, 
  setReducedTransparency, 
  setTheme, 
  ThemeStateObject 
} from "@/lib/themeReducer";
import { 
  setImmersive, 
  setLoading,
  setHovering, 
  toggleImmersive, 
  setPlatformModifier, 
  setDirection, 
  setArrows, 
  setFullscreen
} from "@/lib/readerReducer";
import { 
  setFXL, 
  setRTL, 
  setProgression, 
  setRunningHead, 
  setTocTree, 
  setTocEntry,
  setPositionsList
} from "@/lib/publicationReducer";
import { LineLengthStateObject } from "@/lib/settingsReducer";

import classNames from "classnames";
import debounce from "debounce";
import { buildThemeObject } from "@/preferences/helpers/buildThemeObject";
import { createDefaultPlugin } from "../Plugins/helpers/createDefaultPlugin";
import Peripherals from "../../helpers/peripherals";
import { TH_CUSTOM_SCHEME, ThScrollActions } from "@/core/Hooks/Epub/scrollAffordance";
import { localData } from "@/core/Helpers/localData";
import { getPlatformModifier } from "@/core/Helpers/keyboardUtilities";
import { createTocTree, TocItem } from "@/helpers/createTocTree";
import { deserializePositions } from "@/helpers/deserializePositions";
import { propsToCSSVars } from "@/core/Helpers/propsToCSSVars";
import App from "next/app";

export interface ReadiumCSSSettings {
  columnCount: string;
  fontFamily: keyof typeof defaultFontFamilyOptions | null;
  fontSize: number;
  fontWeight: number;
  hyphens: boolean | null;
  letterSpacing: number | null;
  lineLength: LineLengthStateObject;
  lineHeight: ThLineHeightOptions | null;
  layoutStrategy: ThLayoutStrategy;
  paragraphIndent: number | null;
  paragraphSpacing: number | null;
  publisherStyles: boolean;
  scroll: boolean;
  textAlign: ThTextAlignOptions | null;
  textNormalization: boolean;
  theme?: string;
  wordSpacing: number | null;
}

export interface StatelessCache {
  layoutUI: ThLayoutUI;
  isImmersive: boolean;
  arrowsOccupySpace: boolean;
  settings: ReadiumCSSSettings;
  tocTree?: TocItem[];
  positionsList: Locator[];
  colorScheme?: ThColorScheme;
  reducedMotion?: boolean;
}

export interface StatefulReaderProps {
  rawManifest: object;
  selfHref: string;
  plugins?: ThPlugin[];
}

export const StatefulReader = ({ 
  rawManifest, 
  selfHref, 
  plugins 
}: StatefulReaderProps) => {
  if (plugins && plugins.length > 0) {
    plugins.forEach(plugin => {
      ThPluginRegistry.register(plugin);
    });
  } else {
    ThPluginRegistry.register(createDefaultPlugin());
  }
  
  const { fxlThemeKeys, reflowThemeKeys } = usePreferenceKeys();
  const RSPrefs = usePreferences();
  
  const container = useRef<HTMLDivElement>(null);
  const publication = useRef<Publication | null>(null);
  const localDataKey = useRef(`${selfHref}-current-location`);
  const arrowsWidth = useRef(2 * ((RSPrefs.theming.arrow.size || 40) + (RSPrefs.theming.arrow.offset || 0)));

  const isFXL = useAppSelector(state => state.publication.isFXL);
  const positionsList = useAppSelector(state => state.publication.positionsList);
  const tocTree = useAppSelector(state => state.publication.tocTree);
  const tocEntry = useAppSelector(state => state.publication.tocEntry);

  const layoutUI = isFXL 
    ? RSPrefs.theming.layout.ui?.fxl || ThLayoutUI.layered 
    : ThLayoutUI.stacked;

  const textAlign = useAppSelector(state => state.settings.textAlign);
  const columnCount = useAppSelector(state => state.settings.columnCount);
  const fontFamily = useAppSelector(state => state.settings.fontFamily);
  const fontSize = useAppSelector(state => state.settings.fontSize);
  const fontWeight = useAppSelector(state => state.settings.fontWeight);
  const hyphens = useAppSelector(state => state.settings.hyphens);
  const layoutStrategy = useAppSelector(state => state.settings.layoutStrategy);
  const letterSpacing = useAppSelector(state => state.settings.letterSpacing);
  const lineLength = useAppSelector(state => state.settings.lineLength);
  const lineHeight = useAppSelector(state => state.settings.lineHeight);
  const paragraphIndent = useAppSelector(state => state.settings.paragraphIndent);
  const paragraphSpacing = useAppSelector(state => state.settings.paragraphSpacing);
  const publisherStyles = useAppSelector(state => state.settings.publisherStyles);
  const scroll = useAppSelector(state => state.settings.scroll);
  const isPaged = !scroll;
  const textNormalization = useAppSelector(state => state.settings.textNormalization);
  const wordSpacing = useAppSelector(state => state.settings.wordSpacing);
  const themeObject = useAppSelector(state => state.theming.theme);
  const theme = isFXL ? themeObject.fxl : themeObject.reflow;
  const previousTheme = usePrevious(theme);
  const colorScheme = useAppSelector(state => state.theming.colorScheme);
  const reducedMotion = useAppSelector(state => state.theming.prefersReducedMotion);

  const breakpoint = useAppSelector(state => state.theming.breakpoint);
  const arrowsOccupySpace = breakpoint && 
    (breakpoint === ThBreakpoints.large || breakpoint === ThBreakpoints.xLarge);
  
  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isHovering = useAppSelector(state => state.reader.isHovering);

  // Init theming (breakpoints, theme, media queries…)
  useTheming<ThemeKeyType>({ 
    theme: theme,
    themeKeys: RSPrefs.theming.themes.keys,
    systemKeys: RSPrefs.theming.themes.systemThemes,
    breakpointsMap: RSPrefs.theming.breakpoints,
    initProps: {
      ...propsToCSSVars(RSPrefs.theming.arrow, "arrow"), 
      ...propsToCSSVars(RSPrefs.theming.icon, "icon"),
      ...propsToCSSVars(RSPrefs.theming.layout, "layout")
    },
    onBreakpointChange: (breakpoint) => dispatch(setBreakpoint(breakpoint)),
    onColorSchemeChange: (colorScheme) => dispatch(setColorScheme(colorScheme)),
    onContrastChange: (contrast) => dispatch(setContrast(contrast)),
    onForcedColorsChange: (forcedColors) => dispatch(setForcedColors(forcedColors)),
    onMonochromeChange: (isMonochrome) => dispatch(setMonochrome(isMonochrome)),
    onReducedMotionChange: (reducedMotion) => dispatch(setReducedMotion(reducedMotion)),
    onReducedTransparencyChange: (reducedTransparency) => dispatch(setReducedTransparency(reducedTransparency))
  });

  // We need to use a cache so that we can use updated values
  // without re-rendering the component, and reloading EpubNavigator
  const cache = useRef<StatelessCache>({
    layoutUI: layoutUI,
    isImmersive: isImmersive,
    arrowsOccupySpace: arrowsOccupySpace || false,
    settings: {
      columnCount: columnCount,
      fontFamily: fontFamily,
      fontSize: fontSize,
      fontWeight: fontWeight,
      hyphens: hyphens,
      layoutStrategy: layoutStrategy,
      letterSpacing: letterSpacing,
      lineHeight: lineHeight,
      lineLength: lineLength,
      paragraphIndent: paragraphIndent,
      paragraphSpacing: paragraphSpacing,
      publisherStyles: publisherStyles,
      scroll: scroll,
      textAlign: textAlign,
      textNormalization: textNormalization,
      theme: theme,
      wordSpacing: wordSpacing
    },
    tocTree: tocTree,
    positionsList: positionsList || [],
    colorScheme: colorScheme,
    reducedMotion: reducedMotion
  });

  const atPublicationStart = useAppSelector(state => state.publication.atPublicationStart);
  const atPublicationEnd = useAppSelector(state => state.publication.atPublicationEnd);

  const dispatch = useAppDispatch();

  const onFsChange = useCallback((isFullscreen: boolean) => {
      dispatch(setFullscreen(isFullscreen));
    }, [dispatch]);
  const fs = useFullscreen(onFsChange);

  const { 
    EpubNavigatorLoad, 
    EpubNavigatorDestroy, 
    goLeft, 
    goRight, 
    goBackward, 
    goForward, 
    scrollBackTo, 
    navLayout,
    currentLocator,
    currentPositions,
    getCframes,
    onFXLPositionChange,
    handleScrollAffordances,
    submitPreferences
  } = useEpubNavigator();

  const activateImmersiveOnAction = useCallback(() => {
    if (!cache.current.isImmersive) dispatch(setImmersive(true));
  }, [dispatch]);

  const toggleIsImmersive = useCallback(() => {
    // If tap/click in iframe, then header/footer no longer hoovering 
    dispatch(setHovering(false));
    dispatch(setArrows(false));
    dispatch(toggleImmersive());
  }, [dispatch]);

  useEffect(() => {
    cache.current.isImmersive = isImmersive;
  }, [isImmersive]);

  // Warning: this is using navigator’s internal methods that will become private, do not rely on them
  // See https://github.com/edrlab/thorium-web/issues/25
  const handleTap = (event: FrameClickEvent) => {
    const _cframes = getCframes();
    if (_cframes && !cache.current.settings.scroll) {
      const oneQuarter = ((_cframes.length === 2 ? _cframes[0]!.window.innerWidth + _cframes[1]!.window.innerWidth : _cframes![0]!.window.innerWidth) * window.devicePixelRatio) / 4;
    
      if (event.x < oneQuarter) {
        goLeft(!cache.current.reducedMotion, activateImmersiveOnAction);
      } 
      else if (event.x > oneQuarter * 3) {
        goRight(!cache.current.reducedMotion, activateImmersiveOnAction);
      } else if (oneQuarter <= event.x && event.x <= oneQuarter * 3) {
        toggleIsImmersive();
      }
    } else {
      toggleIsImmersive();
    }
  };

  const handleProgression = useCallback((locator: Locator) => {
    const relativeRef = locator.title || Locale.reader.app.progression.referenceFallback;
      
    dispatch(setProgression( { 
      currentPositions: currentPositions(), 
      relativeProgression: locator.locations.progression, 
      currentChapter: relativeRef, 
      totalProgression: locator.locations.totalProgression 
    }));
  }, [dispatch, currentPositions]);

  const handleTocEntryOnNav = useCallback((locator?: Locator) => {
    if (!locator) return;

    if (cache.current.tocTree) {
      const findMatch = (items: TocItem[], link?: Link): TocItem | undefined => {
        for (const item of items) {
          if (item.href === link?.href) {
            return item;
          }
          if (item.children) {
            const match = findMatch(item.children, link);
            if (match) {
              return match;
            }
          }
        }
        return undefined;
      };

      // First try to find a match for the current position
      const currentMatch = findMatch(cache.current.tocTree, new Link(locator));
      if (currentMatch) {
        dispatch(setTocEntry(currentMatch.id));
        return;
      }

      // If we're in FXL and didn't find a match, try to find a match for the other position in the spread
      if (navLayout() === EPUBLayout.fixed) {
        const positions = currentPositions();
        if (positions && positions.length === 2) {
          // We have a spread, get the other position
          const otherPosition = positions[0] === locator.locations.position ? positions[1] : positions[0];
          
          // Find the other position in positionsList
          const otherPositionInList = cache.current.positionsList.find((pos: Locator) => pos.locations.position === otherPosition);
          if (otherPositionInList) {
            const match = findMatch(cache.current.tocTree, new Link(otherPositionInList));
            if (match) {
              dispatch(setTocEntry(match.id));
              return;
            }
          }
        }
      }
    }
  }, [dispatch, currentPositions, navLayout]);

  // We need this as a workaround due to positionChanged being unreliable
  // in FXL – if the frame is in the pool hidden and is shown again,
  // positionChanged won’t fire.
  const handleFXLProgression = useCallback((locator: Locator) => {
    handleProgression(locator);
    handleTocEntryOnNav(locator);
    localData.set(localDataKey.current, locator);
  }, [handleProgression, handleTocEntryOnNav]);

  onFXLPositionChange(handleFXLProgression);

  const initReadingEnv = async () => {
    if (navLayout() === EPUBLayout.fixed) {
      // [TMP] Working around positionChanged not firing consistently for FXL
      // Init’ing so that progression can be populated on first spread loaded
      const cLoc = currentLocator();
      if (cLoc) {
        handleFXLProgression(cLoc);
      };
    } else {
      // [TMP] We need to handle this in multiple places due to the lack of Injection API.
      // This mounts and unmounts scroll affordances on iframe loaded
      handleScrollAffordances(cache.current.settings.scroll);
    }
  };

  const p = new Peripherals(useAppStore(), RSPrefs.actions, {
    moveTo: (direction) => {
      switch(direction) {
        case "right":
          if (!cache.current.settings.scroll) goRight(!cache.current.reducedMotion, activateImmersiveOnAction);
          break;
        case "left":
          if (!cache.current.settings.scroll) goLeft(!cache.current.reducedMotion, activateImmersiveOnAction);
          break;
        case "up":
        case "home":
          // Home should probably go to first column/page of chapter in reflow?
          if (cache.current.settings.scroll) activateImmersiveOnAction();
          break;
        case "down":
        case "end":
          // End should probably go to last column/page of chapter in reflow?
          if (cache.current.settings.scroll) activateImmersiveOnAction();
          break;
        default:
          break;
      }
    },
    goProgression: (shiftKey) => {
      if (!cache.current.settings?.scroll) {
        shiftKey 
          ? goBackward(!cache.current.reducedMotion, activateImmersiveOnAction) 
          : goForward(!cache.current.reducedMotion, activateImmersiveOnAction);
      } else {
        activateImmersiveOnAction();
      }
    },
    toggleAction: (actionKey) => {
      switch (actionKey) {
        case ThActionsKeys.fullscreen:
          fs.handleFullscreen();
          break;
        case ThActionsKeys.settings:
        case ThActionsKeys.toc:
          dispatch(toggleActionOpen({
            key: actionKey
          }))
          break;
      //  case ThActionsKeys.jumpToPosition:
        default:
          break
      }
    }
  });

  const listeners: EpubNavigatorListeners = {
    frameLoaded: async function (_wnd: Window): Promise<void> {
      await initReadingEnv();
      // Warning: this is using navigator’s internal methods that will become private, do not rely on them
      // See https://github.com/edrlab/thorium-web/issues/25
      const _cframes = getCframes();
      _cframes?.forEach(
        (frameManager: FrameManager | FXLFrameManager | undefined) => {
          if (frameManager) p.observe(frameManager.window);
        }
      );
      p.observe(window);
    },
    positionChanged: async function (locator: Locator): Promise<void> {
      const currentLocator = localData.get(localDataKey.current);
      if (currentLocator?.href !== locator.href) {
        handleTocEntryOnNav(locator);
      }

      // This can’t be relied upon with FXL to handleProgression at the moment,
      // Only reflowable snappers will register the "progress" event
      // that triggers positionChanged every time the progression changes
      // in FXL, only first_visible_locator will, which is why it triggers when
      // the spread has not been shown yet, but won’t if you just slid to them.
      if (navLayout() === EPUBLayout.reflowable) {
        // Due to the lack of injection API we need to force scroll 
        // to mount/unmount scroll affordances ATM  
        const debouncedHandleProgression = debounce(
          async () => {
            // TMP: To mount/unmount scroll affordances in the absence of the injection API.
            // This is to make sure frames already loaded will mount/unmount scroll affordances. 
            // We need to debounce because of swipe, which has a 150ms animation in Column Snapper, 
            // otherwise the iframe will stay hidden since we must change the ReadingProgression,
            // that requires re-loading the frame pool
            if (currentLocator?.href !== locator.href) {
              handleScrollAffordances(cache.current.settings.scroll);
            }
            handleProgression(locator);
            localData.set(localDataKey.current, locator);
          }, 250);
        debouncedHandleProgression();
      }
    },
    tap: function (_e: FrameClickEvent): boolean {
      handleTap(_e);
      return true;
    },
    click: function (_e: FrameClickEvent): boolean {
      (cache.current.layoutUI === ThLayoutUI.layered) && handleTap(_e);
      return true;
    },
    zoom: function (_scale: number): void {},
    miscPointer: function (_amount: number): void {},
    customEvent: function (_key: string, _data: unknown): void {},
    handleLocator: function (locator: Locator): boolean {
      const href = locator.href;

      // Scroll Affordances
      // That’s not great though
      if (href.includes(TH_CUSTOM_SCHEME)) {
        if (href.includes(ThScrollActions.prev)) {
          goLeft(false, () => { scrollBackTo(RSPrefs.scroll.backTo) }); 
        } else if (href.includes(ThScrollActions.next)) {
          goRight(false, () => { scrollBackTo(ThScrollBackTo.top) });
        }
      } else if (
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
  };

  const applyConstraint = useCallback(async (value: number) => {
    await submitPreferences({
      constraint: value
    })
  }, [submitPreferences]);

  // Handling side effects on Navigator

  useEffect(() => {
    cache.current.layoutUI = layoutUI;
  }, [layoutUI]);

  useEffect(() => {
    cache.current.settings.scroll = scroll;

    const handleConstraint = async (value: number) => {
      await applyConstraint(value)
    }

    if (!scroll) {
      handleConstraint(arrowsOccupySpace ? arrowsWidth.current : 0)
        .catch(console.error);
    } else {
      handleConstraint(0)
        .catch(console.error);
    }
  }, [scroll, arrowsOccupySpace, applyConstraint]);

  useEffect(() => {
    cache.current.settings.columnCount = columnCount;
  }, [columnCount]);

  useEffect(() => {
    cache.current.settings.fontFamily = fontFamily;
  }, [fontFamily]);

  useEffect(() => {
    cache.current.settings.fontSize = fontSize;
  }, [fontSize]);

  useEffect(() => {
    cache.current.settings.fontWeight = fontWeight;
  }, [fontWeight]);

  useEffect(() => {
    cache.current.settings.hyphens = hyphens;
  }, [hyphens]);

  useEffect(() => {
    cache.current.settings.layoutStrategy = layoutStrategy;
  }, [layoutStrategy]);

  useEffect(() => {
    cache.current.settings.letterSpacing = letterSpacing;
  }, [letterSpacing]);

  useEffect(() => {
    cache.current.settings.lineHeight = lineHeight;
  }, [lineHeight]);

  useEffect(() => {
    cache.current.settings.lineLength = lineLength;
  }, [lineLength]);

  useEffect(() => {
    cache.current.settings.paragraphIndent = paragraphIndent;
  }, [paragraphIndent]);

  useEffect(() => {
    cache.current.settings.paragraphSpacing = paragraphSpacing;
  }, [paragraphSpacing]);

  useEffect(() => {
    cache.current.settings.textAlign = textAlign;
  }, [textAlign]);

  useEffect(() => {
    cache.current.settings.textNormalization = textNormalization;
  }, [textNormalization]);

  useEffect(() => {
    cache.current.settings.theme = theme;
  }, [theme]);

  useEffect(() => {
    cache.current.settings.wordSpacing = wordSpacing;
  }, [wordSpacing]);

  useEffect(() => {
    cache.current.positionsList = positionsList || [];
  }, [positionsList]);

  useEffect(() => {
    cache.current.tocTree = tocTree;

    if (tocEntry) return;

    const knownPosition: Locator = localData.get(localDataKey.current);
    if (knownPosition) {
      handleTocEntryOnNav(knownPosition);
    } else {
      const initialTocEntry = tocTree?.[0];
      if (initialTocEntry) {
        handleTocEntryOnNav(new Locator({ href: initialTocEntry.href, type: "" }));
      }
    }
  }, [tocTree, tocEntry, handleTocEntryOnNav]);

  useEffect(() => {
    cache.current.arrowsOccupySpace = arrowsOccupySpace || false;
  }, [arrowsOccupySpace]);

  useEffect(() => {
    cache.current.reducedMotion = reducedMotion;
  }, [reducedMotion]);

  // Theme can also change on colorScheme change so
  // we have to handle this side-effect but we can’t
  // from the ReadingDisplayTheme component since it
  // would have to be mounted for this to work
  useEffect(() => {
    if (cache.current.colorScheme !== colorScheme) {
      cache.current.colorScheme = colorScheme;
    }

    const theme = isFXL ? themeObject.fxl : themeObject.reflow;

    // Protecting against re-applying on theme change
    if (theme !== "auto" && previousTheme !== theme) return;

    const applyCurrentTheme = async () => {
      const themeKeys = isFXL ? fxlThemeKeys : reflowThemeKeys;
      const themeKey = themeKeys.includes(theme as any) ? theme : "auto";
      const themeProps = buildThemeObject<ThemeKeyType>({
        theme: themeKey,
        themeKeys: RSPrefs.theming.themes.keys,
        systemThemes: RSPrefs.theming.themes.systemThemes,
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
  }, [themeObject, previousTheme, RSPrefs.theming.themes, fxlThemeKeys, reflowThemeKeys, colorScheme, isFXL, submitPreferences, dispatch]);

  useEffect(() => {
    RSPrefs.direction && dispatch(setDirection(RSPrefs.direction));
    dispatch(setPlatformModifier(getPlatformModifier()));
  }, [RSPrefs.direction, dispatch]);

  useEffect(() => {
    const handleConstraint = async () => {
      await applyConstraint(arrowsOccupySpace ? arrowsWidth.current : 0)
    }
    handleConstraint()
      .catch(console.error);
  }, [arrowsOccupySpace, applyConstraint]);

  useEffect(() => {
    const fetcher: Fetcher = new HttpFetcher(undefined, selfHref);
    const manifest = Manifest.deserialize(rawManifest)!;
    manifest.setSelfLink(selfHref);

    publication.current = new Publication({
      manifest: manifest,
      fetcher: fetcher
    });

    dispatch(setRTL(publication.current.metadata.effectiveReadingProgression === ReadingProgression.rtl));
    dispatch(setFXL(publication.current.metadata.getPresentation()?.layout === EPUBLayout.fixed));

    const pubTitle = publication.current.metadata.title.getTranslation("en");

    dispatch(setRunningHead(pubTitle));
    dispatch(setProgression({ currentPublication: pubTitle }));

    let positionsList: Locator[] | undefined;

    const fetchPositions = async () => {
      positionsList = await publication.current?.positionsFromManifest();
      if (positionsList && positionsList.length > 0) {
        dispatch(setProgression( { totalPositions: positionsList.length }))
      };
      const deserializedPositionsList = deserializePositions(positionsList);
      dispatch(setPositionsList(deserializedPositionsList));
    };

    fetchPositions()
      .catch(console.error)
      .then(() => {
        const isFXL = publication.current?.metadata.getPresentation()?.layout === EPUBLayout.fixed;

        const initialPosition: Locator = localData.get(localDataKey.current);

        // Create a heirarchical tree structure for the table of contents
        // where each entry has a unique id property and store this on the publication state
        let idCounter = 0;
        const idGenerator = () => `toc-${++idCounter}`;
        const tocTree = createTocTree(publication.current?.tableOfContents?.items || [], idGenerator, positionsList);
        dispatch(setTocTree(tocTree));

        const initialConstraint = cache.current.arrowsOccupySpace ? arrowsWidth.current : 0;
        
        const themeKeys = isFXL ? fxlThemeKeys : reflowThemeKeys;
        const theme = themeKeys.includes(cache.current.settings.theme as any) ? cache.current.settings.theme : "auto";
        const themeProps = buildThemeObject<ThemeKeyType>({
          theme: theme,
          themeKeys: RSPrefs.theming.themes.keys,
          systemThemes: RSPrefs.theming.themes.systemThemes,
          colorScheme: cache.current.colorScheme
        });

        const lineHeightOptions = {
          [ThLineHeightOptions.publisher]: null,
          [ThLineHeightOptions.small]: RSPrefs.settings.keys?.[ThSettingsKeys.lineHeight]?.[ThLineHeightOptions.small] || defaultLineHeights[ThLineHeightOptions.small],
          [ThLineHeightOptions.medium]: RSPrefs.settings.keys?.[ThSettingsKeys.lineHeight]?.[ThLineHeightOptions.medium] || defaultLineHeights[ThLineHeightOptions.medium],
          [ThLineHeightOptions.large]: RSPrefs.settings.keys?.[ThSettingsKeys.lineHeight]?.[ThLineHeightOptions.large] || defaultLineHeights[ThLineHeightOptions.large],
        };

        const preferences: IEpubPreferences = isFXL ? {} : {
          columnCount: cache.current.settings.columnCount === "auto" ? null : Number(cache.current.settings.columnCount),
          constraint: initialConstraint,
          fontFamily: cache.current.settings.fontFamily && defaultFontFamilyOptions[cache.current.settings.fontFamily],
          fontSize: cache.current.settings.fontSize,
          fontWeight: cache.current.settings.fontWeight,
          hyphens: cache.current.settings.hyphens,
          layoutStrategy: cache.current.settings.layoutStrategy as unknown as LayoutStrategy | null | undefined,
          letterSpacing: cache.current.settings.publisherStyles ? undefined : cache.current.settings.letterSpacing,
          lineHeight: cache.current.settings.publisherStyles 
            ? undefined 
            : cache.current.settings.lineHeight === null 
              ? null 
              : lineHeightOptions[cache.current.settings.lineHeight],
          optimalLineLength: cache.current.settings.lineLength?.optimal,
          maximalLineLength: cache.current.settings.lineLength?.max?.isDisabled 
            ? null 
            : cache.current.settings.lineLength?.max?.chars,
          minimalLineLength: cache.current.settings.lineLength?.min?.isDisabled 
            ? null 
            : cache.current.settings.lineLength?.min?.chars,
          paragraphIndent: cache.current.settings.publisherStyles ? undefined :cache.current.settings.paragraphIndent,
          paragraphSpacing: cache.current.settings.publisherStyles ? undefined :cache.current.settings.paragraphSpacing,
          scroll: cache.current.settings.scroll,
          textAlign: cache.current.settings.textAlign as unknown as TextAlignment | null | undefined,
          textNormalization: cache.current.settings.textNormalization,
          wordSpacing: cache.current.settings.publisherStyles ? undefined : cache.current.settings.wordSpacing,
          ...themeProps
        };

        const defaults: IEpubDefaults = isFXL ? {} : {
          layoutStrategy: RSPrefs.typography.layoutStrategy as LayoutStrategy | null | undefined,
          maximalLineLength: RSPrefs.typography.maximalLineLength, 
          minimalLineLength: RSPrefs.typography.minimalLineLength, 
          optimalLineLength: RSPrefs.typography.optimalLineLength,
          pageGutter: RSPrefs.typography.pageGutter
        }
  
        EpubNavigatorLoad({
          container: container.current, 
          publication: publication.current!,
          listeners: listeners, 
          positionsList: positionsList,
          initialPosition: initialPosition,
          preferences: preferences,
          defaults: defaults,
          scrollAffordances: {
            top: RSPrefs.scroll.topAffordance,
            bottom: RSPrefs.scroll.bottomAffordance
          }
        }, () => p.observe(window));
      })
      .finally(() => {
        const setLoadingThunk = (dispatch: AppDispatch) => {
          dispatch(setLoading(false));
        };
        dispatch(setLoadingThunk);
      });

    return () => {
      EpubNavigatorDestroy(() => p.destroy());
    };
  }, [rawManifest, selfHref, RSPrefs, fxlThemeKeys, reflowThemeKeys]);

  // If breakpoint is not defined, we are not ready to render
  // since useDocking needs it to derive the sheet type
  // Same for arrows and collapsible actions.
  if (!breakpoint) return null;

  const bookLocale = publication.current?.metadata.languages?.at(0)

  return (
    <>
    <I18nProvider locale={RSPrefs.locale}>
    <AppLocale locale={bookLocale || RSPrefs.locale}>
    <ThPluginProvider>
      <main>
        <StatefulDockingWrapper>
          <div 
            id="reader-main" 
            className={ 
              classNames(
                isFXL ? "isFXL" : "isReflow",
                isImmersive ? "isImmersive" : "",
                isHovering ? "isHovering" : "",
                layoutUI
              )
            }
          >
            <StatefulReaderHeader />

          { isPaged 
            ? <nav className={ arrowStyles.container } id={ arrowStyles.left }>
                <StatefulReaderArrowButton 
                  direction="left" 
                  occupySpace={ arrowsOccupySpace || false }
                  isDisabled={ atPublicationStart } 
                  onPress={ () => goLeft(!reducedMotion, activateImmersiveOnAction) }
                />
            </nav> 
            : <></> }

            <article id="wrapper" aria-label={ Locale.reader.app.publicationWrapper }>
              <div id="container" ref={ container }></div>
            </article>

          { isPaged 
            ? <nav className={ arrowStyles.container } id={ arrowStyles.right }>
                <StatefulReaderArrowButton 
                  direction="right" 
                  occupySpace={ arrowsOccupySpace || false }
                  isDisabled={ atPublicationEnd } 
                  onPress={ () => goRight(!reducedMotion, activateImmersiveOnAction) }
                />
              </nav> 
            : <></> }

          { isPaged ? <StatefulReaderFooter /> : <></> }
          </div>
      </StatefulDockingWrapper>
    </main>
  </ThPluginProvider>
  </AppLocale>
  </I18nProvider>
  </>
)};