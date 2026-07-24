# Store API Reference

This document details the Redux store implementation and state management system.

## Core Components

### ThStoreProvider

Context provider component for the Redux store.

**Props:**
- `children`: Child components
- `storageKey`: Optional key for localStorage persistence (defaults to `thorium-web-state`)
- `store`: Optional custom Redux store — use this when extending the default store

**Features:**
- Global state management
- State persistence
- Action dispatching
- State selectors

## Reducers

### AudioSettings Reducer

Manages audio playback settings state.

**State Interface:**
```typescript
interface AudioSettingsState {
  volume: number;
  playbackRate: number;
  preservePitch: boolean;
  skipBackwardInterval: number;
  skipForwardInterval: number;
  skipInterval: number;
  pollInterval: number;
  autoPlay: boolean;
  enableMediaSession: boolean;
}
```

**Actions:**
- `setVolume`: Set playback volume
- `setPlaybackRate`: Set playback rate
- `setPreservePitch`: Set preserve pitch flag
- `setSkipBackwardInterval`: Set skip backward interval in seconds
- `setSkipForwardInterval`: Set skip forward interval in seconds
- `setSkipInterval`: Set unified skip interval in seconds
- `setPollInterval`: Set position polling interval in milliseconds
- `setAutoPlay`: Set auto-play flag
- `setEnableMediaSession`: Set Media Session API flag

### Player Reducer

Manages audio player runtime state.

**State Interface:**
```typescript
type PlayerStatus = "idle" | "playing" | "paused";

interface SeekableRange {
  start: number;
  end: number;
}

interface PlayerReducerState {
  status: PlayerStatus;
  isSeeking: boolean;
  isStalled: boolean;
  isTrackReady: boolean;
  seekableRanges: SeekableRange[];
}
```

**Actions:**
- `setStatus`: Set player status (`idle`, `playing`, or `paused`)
- `setSeeking`: Set seeking state
- `setStalled`: Set stalled state
- `setTrackReady`: Set track-ready flag
- `setSeekableRanges`: Update seekable time ranges

### Actions Reducer

Manages state for action-related features.

**State Interface:**
```typescript
interface ActionsReducerState {
  keys: {
    [key in ActionsStateKeys]: {
      isOpen: boolean | null;
      docking: ThDockingKeys | null;
      dockedWidth?: number;
    };
  };
  dock: {
    [ThDockingKeys.start]: {
      actionKey: ActionsStateKeys | null;
      active: boolean;
      collapsed: boolean;
      width?: number;
    };
    [ThDockingKeys.end]: {
      actionKey: ActionsStateKeys | null;
      active: boolean;
      collapsed: boolean;
      width?: number;
    };
  };
  overflow: {
    [key in OverflowStateKeys]: {
      isOpen: boolean;
    };
  };
}
```

**Actions:**
- `dockAction`: Dock/undock an action
- `setActionOpen`: Set action state open/closed
- `toggleActionOpen`: Toggle action state
- `setOverflow`: Set overflow state open/closed
- `activateDockPanel`: Activate a dock panel
- `deactivateDockPanel`: Deactivate a dock panel
- `collapseDockPanel`: Collapse a dock panel
- `expandDockPanel`: Expand a dock panel
- `setDockPanelWidth`: Set dock panel width

### Publication Reducer

Manages state for EPUB publication data.

**State Interface:**
```typescript
interface PublicationReducerState {
  fontLanguage: string;
  isFXL: boolean;
  isRTL: boolean;
  scriptMode: ScriptMode; // "ltr" | "rtl" | "cjk-horizontal" | "cjk-vertical"
  hasDisplayTransformability: boolean;
  positionsList: SerializedLocator[];
  atPublicationStart: boolean;
  atPublicationEnd: boolean;
  progress?: Progress;
  toc: { tree?: TocItem[]; currentEntry?: TocEntryRef | null };
  adjacentTimelineItems: { previous: TimelineItemRef | null; next: TimelineItemRef | null };
  coverTheme?: ThemeTokens;
}
```

`Progress` (from `@/core/Hooks/usePublicationProgress`) holds only chapter/progress data derived from the real Readium `Timeline` plus position/percentage math computed separately from `positionsList` — it does not carry the TOC tree, which is tracked independently in `toc` since Timeline is not meant to replace TOC.

**Actions:**
- `setFontLanguage`: Set font language
- `setFXL`: Set publication as fixed layout
- `setRTL`: Set publication as right-to-left
- `setScriptMode`: Set the publication's script mode (`ScriptMode` from `@readium/navigator`)
- `setHasDisplayTransformability`: Set display transformability flag
- `setPositionsList`: Update positions list
- `setPublicationStart`: Set at publication start state
- `setPublicationEnd`: Set at publication end state
- `setProgress`: Set reading-progress data (title, current chapter, position/percentage math)
- `setTocTree`: Set table of contents tree
- `setTocEntry`: Set current TOC entry
- `setAdjacentTimelineItems`: Set adjacent timeline items (previous/next), sourced from the real Timeline's `adjacentTo()`
- `setCoverTheme`: Set the cover-extracted theme tokens (runtime only, not persisted)

> [!IMPORTANT]
> `isRTL` reflects the **publication content direction** (set from the manifest). For UI direction (driven by the user's locale preference), use `useLocale().direction` from `react-aria` instead.

### Reader Reducer

Manages state for reader functionality.

**State Interface:**
```typescript
interface ReaderReducerState {
  profile: "epub" | "webPub" | undefined;
  direction: ThLayoutDirection;
  isLoading: boolean;
  isImmersive: boolean;
  isHovering: boolean;
  hasScrollAffordance: boolean;
  hasArrows: boolean;
  hasUserNavigated: boolean;
  isFullscreen: boolean;
  settingsContainer: ThSettingsContainerKeys;
  platformModifier: UnstablePlatformModifier;
}
```

**Actions:**
- `setReaderProfile`: Set reader profile (epub or webPub)
- `setDirection`: Set layout direction
- `setLoading`: Set loading state
- `setPlatformModifier`: Set platform modifier
- `setImmersive`: Set immersive mode
- `toggleImmersive`: Toggle immersive mode
- `setHovering`: Set hovering state
- `setScrollAffordance`: Set scroll affordance visibility
- `setHasArrows`: Set arrows visibility
- `setUserNavigated`: Set user navigation flag
- `setFullscreen`: Set fullscreen mode
- `setSettingsContainer`: Set type of settings container (main, or subpanel)

### Settings Reducer

Manages state for reader settings.

**State Interface:**
```typescript
interface SettingsReducerState {
  columnCount: string;
  fontFamily: FontFamilyStateObject;
  fontSize: number;
  fontWeight: number;
  hyphens: boolean | null;
  letterSpacing: number | null;
  ligatures: boolean | null;
  lineHeight: ThLineHeightOptions;
  lineLength: LineLengthStateObject | null;
  noRuby: boolean | null;
  paragraphIndent: number | null;
  paragraphSpacing: number | null;
  publisherStyles: boolean;
  scroll: boolean;
  spacing: SpacingStateObject;
  textAlign: ThTextAlignOptions;
  textNormalization: boolean;
  wordSpacing: number | null;
}
```

**Actions:**
- `setColumnCount`: Set column count
- `setFontFamily`: Set font family
- `setFontSize`: Set font size
- `setFontWeight`: Set font weight
- `setHyphens`: Set hyphenation
- `setLetterSpacing`: Set letter spacing
- `setLigatures`: Set ligatures
- `setLineHeight`: Set line height
- `setLineLength`: Set one or several line lengths (optimal, min, max)
- `setNoRuby`: Set no-ruby (suppress ruby annotations)
- `setParagraphIndent`: Set paragraph indent
- `setParagraphSpacing`: Set paragraph spacing
- `setPublisherStyles`: Set publisher styles
- `setScroll`: Set scroll mode
- `setSpacingPreset`: Set spacing preset configuration
- `setTextAlign`: Set text alignment
- `setTextNormalization`: Set text normalization
- `setWordSpacing`: Set word spacing

### Theme Reducer

Manages state for theme settings.

**State Interface:**
```typescript
interface ThemeReducerState {
  monochrome: boolean;
  colorScheme: ThColorScheme;
  theme: ThemeStateObject;
  prefersReducedMotion: boolean;
  prefersReducedTransparency: boolean;
  prefersContrast: ThContrast;
  forcedColors: boolean;
  breakpoint?: ThBreakpoints;
  containerBreakpoint?: ThBreakpoints;
}
```

**Actions:**
- `setMonochrome`: Set monochrome mode
- `setColorScheme`: Set color scheme
- `setTheme`: Set current theme
- `setReducedMotion`: Set reduced motion preference
- `setReducedTransparency`: Set reduced transparency preference
- `setContrast`: Set contrast preference
- `setForcedColors`: Set forced colors mode
- `setBreakpoint`: Set current breakpoint
- `setContainerBreakpoint`: Set current container breakpoint

### Preferences Reducer

Manages state for reader preferences.

**State Interface:**
```typescript
interface PreferencesReducerState {
  progressionFormat?: RenditionObject<ThProgressionFormat | Array<ThProgressionFormat>>;
  runningHeadFormat?: RenditionObject<ThRunningHeadFormat>;
  paginatedAffordances?: PaginatedAffordanceObject;
  ui?: {
    reflow?: ThLayoutUI;
    fxl?: ThLayoutUI;
    webPub?: ThLayoutUI;
  };
  scrollAffordances?: {
    hintInImmersive?: boolean;
    toggleOnMiddlePointer?: Array<"tap" | "click">;
    hideOnForwardScroll?: boolean;
    showOnBackwardScroll?: boolean;
  };
}
```

**Actions:**
- `setProgressionFormat`: Update progression format for reflow or FXL modes
- `setRunningHeadFormat`: Update running head format
- `setUI`: Update UI settings
- `setScrollAffordances`: Configure scroll behavior
- `setPaginatedAffordance`: Update paginated affordance settings
- `updateFromPreferences`: Bulk update from a preferences object

> [!NOTE]
> `l10n`, `setL10n`, and `L10nObject` were removed in 1.4.0. Locale is now managed by `globalPreferencesReducer` — see below.

### Global Preferences Reducer

Manages locale state independently of reader preferences. Added in 1.4.0.

**State Interface:**
```typescript
interface GlobalPreferencesReducerState {
  locale?: string;
}
```

**Actions:**
- `setLocale`: Set the UI locale (`string | undefined`). Unsupported locales should be validated by `createGlobalPreferences` before dispatching.

The locale is persisted to `localStorage` alongside the rest of the app state. Use `StatefulGlobalPreferencesProvider` to wire it automatically, or dispatch `setLocale` directly.

### WebPubSettings Reducer

Manages state for WebPub-specific reader settings.

**State Interface:**
```typescript
interface WebPubSettingsReducerState {
  fontFamily: FontFamilyStateObject;
  fontWeight: number;
  hyphens: boolean | null;
  letterSpacing: number | null;
  ligatures: boolean | null;
  lineHeight: ThLineHeightOptions;
  noRuby: boolean | null;
  paragraphIndent: number | null;
  paragraphSpacing: number | null;
  publisherStyles: boolean;
  spacing: SpacingStateObject;
  textAlign: ThTextAlignOptions;
  textNormalization: boolean;
  wordSpacing: number | null;
  zoom: number;
}
```

**Actions:**
- `setWebPubFontFamily`: Set font family for WebPub
- `setWebPubFontWeight`: Set font weight for WebPub
- `setWebPubHyphens`: Set hyphenation for WebPub
- `setWebPubLetterSpacing`: Set letter spacing for WebPub
- `setWebPubLigatures`: Set ligatures for WebPub
- `setWebPubLineHeight`: Set line height for WebPub
- `setWebPubNoRuby`: Set no-ruby for WebPub
- `setWebPubParagraphIndent`: Set paragraph indent for WebPub
- `setWebPubParagraphSpacing`: Set paragraph spacing for WebPub
- `setWebPubPublisherStyles`: Set publisher styles for WebPub
- `setWebPubSpacingPreset`: Set spacing preset for WebPub
- `setWebPubTextAlign`: Set text alignment for WebPub
- `setWebPubTextNormalization`: Set text normalization for WebPub
- `setWebPubWordSpacing`: Set word spacing for WebPub
- `setWebPubZoom`: Set zoom level for WebPub