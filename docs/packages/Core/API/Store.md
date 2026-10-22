# Store API Reference

This document details the Redux store implementation and state management system.

## Core Components

### ThStoreProvider

Context provider component for the Redux store.

**Props:**
- `children`: Child components
- `storageKey`: Optional key for localStorage persistence (defaults to `thorium-web-state`)
- `settingsStorageStrategies`: Optional storage strategy of each setting (defaults to `defaultSettingsStorageStrategies`), see [Settings Storage Strategies](#settings-storage-strategies)
- `store`: Optional custom Redux store — use this when extending the default store

**Features:**
- Global state management
- State persistence
- Action dispatching
- State selectors

### Settings Storage Strategies

Settings are stored according to a strategy, from enum `ThSettingsStorageStrategy`:

- `global`: shared by all publications;
- `glocal`: per publication, a publication without its own value starting from the last one used in any publication;
- `local`: per publication only, never stored globally, a publication without its own value starting from the default.

Publications are only told apart with a `localDataKey` or a `settingsStorage` on the reader, see [SettingsStorage Interface](../../Reader/ReadMe.md#settingsstorage-interface). Without them, every setting is global.

`ThSettingsStorageStrategies` maps settings keys to strategies, per scope, like the settings orders (`reflowOrder`, `fxlOrder`, `webPubOrder`, `divinaOrder`): `reflow`, `fxl`, `webPub` and `divina` take `ThSettingsKeys`, `audio` takes `ThAudioKeys` and `readAlong` takes `ThReadAlongKeys`. A setting left out is global. `defaultSettingsStorageStrategies` follows Thorium Mobile: reflowable settings are glocal but the theme, which is always global; fixed-layout and Divina settings are glocal, theme included; audio settings are global; read along’s voice, volume and pitch are global, its language override is local, while switching voices for other languages, highlights, prosody and verbosity are glocal.

Spread the defaults in your own file, and pass it to `ThStoreProvider`, or to `makeStore(storageKey, externalReducers, settingsStorageStrategies)` for a custom store:

```typescript
import { defaultSettingsStorageStrategies, ThSettingsStorageStrategies, ThSettingsStorageStrategy } from "@edrlab/thorium-web/core/lib";
import { ThAudioKeys } from "@edrlab/thorium-web/core/preferences";

export const settingsStorageStrategies: ThSettingsStorageStrategies = {
  ...defaultSettingsStorageStrategies,
  audio: {
    ...defaultSettingsStorageStrategies.audio,
    [ThAudioKeys.autoPlay]: ThSettingsStorageStrategy.global
  }
};
```

A publication stores its settings according to its own scope, so scopes sharing a value can give it different strategies: reflowable and fixed-layout EPUB share `columns`, and Divina uses the fixed-layout `theme`. That value is only left out of the global storage when it’s local in all of them.

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
- `hydrateAudioSettings`: Merge a publication’s stored settings into the state, with payload `{ values, reset }`: `reset` lists the local settings it has no value for, which go back to their initial value

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

### ReadAlongSettings Reducer

Manages read-along preferences. Values map to the TS-Toolkit `ReadAloudNavigator` preferences, and `null` means the navigator’s default. The slice is persisted, and its values are submitted as preferences when read-along loads.

**State Interface:**
```typescript
type HighlightStateKey = "utteranceStyle" | "wordStyle";

// A style without tint takes the reading theme’s color
interface HighlightStateObject {
  preset: ThReadAlongHighlightPresetKeys;
  custom: Partial<Record<HighlightStateKey, ReadAloudDecorationStyle>>;
  baseline: Partial<Record<HighlightStateKey, ReadAloudDecorationStyle>>;
}

type ProsodyStateKey = "rate" | "pauseDuration" | "autoPause";

// A null value falls back to the navigator’s default
interface ProsodyStateObject {
  preset: ThReadAlongProsodyPresetKeys;
  custom: Partial<Record<ProsodyStateKey, number | ReadAloudSettings["autoPause"] | null>>;
  baseline: Partial<Record<ProsodyStateKey, number | ReadAloudSettings["autoPause"] | null>>;
}

interface ReadAlongSettingsReducerState {
  voice: Record<string, string>;      // Voice ids by base language, the navigator’s own voice for a language without one
  format: ReadAloudSettings["format"] | null;
  interruptions: ReadAloudSettings["interruptions"] | null; // How each role is read where it interrupts the text, set by the notes, page breaks, abbreviations, glossary and bibliography settings
  keepCentered: boolean | null;
  verbosity: Partial<Record<"reflow" | "fxl" | "divina", ReadAloudSettings["verbosity"]>>; // Per format, like the reading theme
  language: ReadAloudSettings["language"] | null;
  languageOverride: string | null;    // Local to the publication
  segmentation: ReadAloudSettings["segmentation"] | null;
  pauseDuration: number | null;
  autoPause: ReadAloudSettings["autoPause"] | null;
  rate: number | null;
  pitch: number | null;
  volume: number | null;
  utteranceStyle: ReadAloudSettings["utteranceStyle"] | null; // Resolved style submitted to the navigator
  wordStyle: ReadAloudSettings["wordStyle"] | null;           // Resolved style submitted to the navigator
  highlight: HighlightStateObject;
  prosody: ProsodyStateObject;
}
```

**Actions:**
- `setReadAlongVoice`: Set the voice of a language, with payload `{ language, voice }`: `language` is a base language (`und` for publications that don’t declare one), `voice` a voice id (`getVoiceId(voice)`)
- `setReadAlongFormat`, `setReadAlongInterruptions`, `setReadAlongKeepCentered`, `setReadAlongLanguage`, `setReadAlongLanguageOverride`, `setReadAlongSegmentation`, `setReadAlongPitch`, `setReadAlongVolume`: Set the matching preference
- `setReadAlongVerbosity`: Set the verbosity preset of a format, with payload `{ key, value }`: `key` is `reflow` for reflowable EPUB and WebPub, `fxl` for fixed-layout EPUB, `divina` for Divina
- `setReadAlongRate`, `setReadAlongPauseDuration`, `setReadAlongAutoPause`: Set the matching preference, and switch the prosody to the custom preset, starting from the current preset’s values
- `setReadAlongUtteranceStyle`, `setReadAlongWordStyle`: Set a highlight style. The payload is `{ value, effective, preset? }`: `value` is the style as the user picked it, `effective` the style submitted to the navigator. With `preset`, the highlight switches to the custom preset, starting from the current preset’s styles
- `setReadAlongHighlightPreset`: Apply a highlight preset, with payload `{ preset, values, effective }`
- `setReadAlongHighlightEffective`: Update the resolved styles only, e.g. when the reading theme changes
- `setReadAlongProsodyPreset`: Apply a prosody preset, with payload `{ preset, values, effective }`
- `setReadAlongProsodyEffective`: Update the resolved values only, e.g. when the auto pause is resolved against the layout
- `hydrateReadAlongSettings`: Merge a publication’s stored settings into the state, with payload `{ values, reset }`: `reset` lists the local settings it has no value for, which go back to their initial value

### ReadAlongPlayer Reducer

Manages the read-along player. `isActive` and `layout` are user state, stored per publication only, through `useSettingsStorage`: they aren’t persisted with the rest of the store, so read along doesn’t start in another publication. The other fields are session state, reset each time read-along loads.

**State Interface:**
```typescript
interface ReadAlongMetadata {
  title: string;
  subtitle?: string;
  authors?: string[];
  coverUrl?: string;
  language?: string;
}

interface ReadAlongVoiceControls {
  boundary: boolean; // The voice reports word boundaries, needed for word highlighting
  speed: boolean;    // The voice supports changing the rate
  pitch: boolean;    // The voice supports changing the pitch
}

type ReadAlongLayout = "mini" | "expanded";

interface ReadAlongPlayerReducerState {
  isActive: boolean;
  layout: ReadAlongLayout;     // Restored when read-along is activated again
  metadata: ReadAlongMetadata | null;
  status: ReadAloudState;
  voiceControls: ReadAlongVoiceControls;
  anyVoiceHasBoundaries: boolean | null; // Any voice for the publication's language reports word boundaries, null until known
  sleepTimer: { remainingSeconds: number | null };
  settingsContainer: ThReadAlongSettingsContainerKeys;
}
```

**Actions:**
- `setReadAlongActive`: Show or hide the player
- `setReadAlongLayout`: Set the layout restored on activation
- `setReadAlongStatus`: Set the navigator state
- `setReadAlongVoiceControls`: Set what the current voice supports
- `setReadAlongAnyVoiceHasBoundaries`: Set whether any voice for the publication's language reports word boundaries
- `setReadAlongSleepTimer`: Update the sleep timer
- `setReadAlongMetadata`: Set the publication metadata shown by the player
- `setReadAlongSettingsContainer`: Switch the settings menu between its main view and the voice, highlight, prosody or verbosity submenu
- `hydrateReadAlongPlayer`: Restore a publication’s stored `isActive` and `layout`, or their initial values when missing
- `resetReadAlongPlayer`: Reset the session fields, keeping `isActive`, `layout` and `metadata`

### Actions Reducer

Manages state for action-related features.

**State Interface:**
```typescript
interface ActionsReducerState {
  keys: {
    // Profile-keyed: `epub`, `webPub`, `audio`, `divina`
    [profile: string]: {
      [key in ActionsStateKeys]?: {
        isOpen?: boolean | null;
        docking?: ThDockingKeys | null;
        dockedWidth?: number;
      };
    };
  };
  dock: {
    [profile: string]: {
      [ThDockingKeys.start]: DockStateObject;
      [ThDockingKeys.end]: DockStateObject;
    };
  };
  overflow: {
    [key in OverflowStateKeys]?: {
      isOpen: boolean;
    };
  };
}

interface DockStateObject {
  actionKey: ActionsStateKeys | null;
  active: boolean;
  width?: number;
  // Set from the action’s `docked.reserved` preference, see the Docking doc
  reserved?: boolean;
}
```

**Actions:**
- `ensureProfileActions`: Create the `dock` and `keys` buckets of a profile if missing. `usePublication` dispatches it for the detected profile, to heal persisted states that predate a profile
- `dockAction`: Dock/undock an action. Takes the requester’s `reserved` flag, and arbitrates on it: a reserved occupant can’t be evicted by a non-reserved action
- `setActionOpen`: Set action state open/closed
- `toggleActionOpen`: Toggle action state
- `setOverflow`: Set overflow state open/closed
- `activateDockPanel`: Activate a dock panel
- `deactivateDockPanel`: Deactivate a dock panel
- `setDockPanelWidth`: Set dock panel width

### Publication Reducer

Manages state for EPUB publication data.

**State Interface:**
```typescript
interface PublicationReducerState {
  fontLanguage: string;
  isFXL: boolean;
  isManifestScrolled: boolean; // Divina manifest declares layout: "scrolled" (webtoons)
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
- `setManifestScrolled`: Set publication as natively scrolled (Divina only)
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
  profile: "epub" | "webPub" | "audio" | "divina" | undefined;
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
- `setReaderProfile`: Set reader profile (epub, webPub, audio, or divina)
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
- `hydrateSettings`: Merge a publication’s stored settings into the state, with payload `{ values, reset }`: `reset` lists the local settings it has no value for, which go back to their initial value

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
- `hydrateTheme`: Merge a publication’s stored reading theme into `theme`, with payload `{ values, reset }` like the settings

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
    divina?: ThLayoutUI;
  };
  scrollAffordances?: {
    hintInImmersive?: boolean;
    toggleOnMiddlePointer?: Array<"tap" | "click">;
    hideOnForwardScroll?: boolean;
    showOnBackwardScroll?: boolean;
  };
  readAlong?: {
    generateFromMarkup?: boolean;
    readFromPointer?: boolean;
    detachable?: boolean;
    startInViewport?: boolean;
    keepAwake?: boolean;
  };
}
```

**Actions:**
- `setProgressionFormat`: Update progression format for reflow or FXL modes
- `setRunningHeadFormat`: Update running head format
- `setUI`: Update UI settings
- `setScrollAffordances`: Configure scroll behavior
- `setPaginatedAffordance`: Update paginated affordance settings
- `setReadAlong`: Update read-along runtime preferences (generateFromMarkup, readFromPointer, detachable, startInViewport, keepAwake)
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

### DivinaSettings Reducer

Manages state for Divina-specific reader settings. Values are `null` until set, in which case the navigator’s defaults apply.

**State Interface:**
```typescript
interface DivinaSettingsReducerState {
  quality: string | null;     // DivinaQuality: "auto" | "low" | "high" | "max"
  scrolled: boolean | null;
  spreads: boolean | null;
  stripWidth: number | null;
}
```

**Actions:**
- `setDivinaQuality`: Set image quality
- `setDivinaScrolled`: Set scrolled or paged layout
- `setDivinaSpreads`: Set spreads (two pages side by side) for paged layout
- `setDivinaStripWidth`: Set strip width for scrolled layout
- `hydrateDivinaSettings`: Merge a publication’s stored settings into the state, with payload `{ values, reset }`: `reset` lists the local settings it has no value for, which go back to their initial value

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
- `hydrateWebPubSettings`: Merge a publication’s stored settings into the state, with payload `{ values, reset }`: `reset` lists the local settings it has no value for, which go back to their initial value