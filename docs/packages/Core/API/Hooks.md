# Core Hooks API Documentation

## Audio Navigator Hook

Manages audio publication playback and navigation.

```typescript
interface AudioNavigatorLoadProps {
  publication: Publication;
  listeners: AudioNavigatorListeners;
  initialPosition?: Locator;
  preferences?: IAudioPreferences;
  defaults?: IAudioDefaults;
  contentProtection?: IContentProtectionConfig;
  audioContext?: AudioContext;
}

function useAudioNavigator(): {
  AudioNavigatorLoad: (config: AudioNavigatorLoadProps, cb: Function) => void;
  AudioNavigatorDestroy: (cb: Function) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  jump: (seconds: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
  go: (locator: Locator, animated: boolean, callback: (ok: boolean) => void) => void;
  goLink: (link: Link, animated: boolean, callback: (ok: boolean) => void) => void;
  goForward: (animated: boolean, callback: (ok: boolean) => void) => void;
  goBackward: (animated: boolean, callback: (ok: boolean) => void) => void;
  currentLocator: () => Locator | undefined;
  canGoBackward: () => boolean;
  canGoForward: () => boolean;
  isTrackStart: () => boolean;
  isTrackEnd: () => boolean;
  isPlaying: () => boolean;
  isPaused: () => boolean;
  duration: () => number;
  currentTime: () => number;
  preferencesEditor: PreferencesEditor | undefined;
  getSetting: <K extends keyof AudioSettings>(settingKey: K) => AudioSettings[K] | undefined;
  submitPreferences: (preferences: IAudioPreferences) => Promise<void>;
};
```

**Features:**
- Audio playback control (play, pause, stop, seek, jump)
- Chapter and track navigation
- Position tracking and locator management
- Preferences and settings management

> [!IMPORTANT]
> When using Stateful Components, you must use the hook from the `@edrlab/thorium-web/audio` package so that they all share the same instance, not from `@edrlab/thorium-web/core`.

## Audio Settings Cache Hook

Provides a stateless cache for audio settings, mapping React state to mutable refs. Values never go stale and do not trigger navigator re-initialization.

```typescript
interface AudioSettings {
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

function useAudioSettingsCache(
  volume: number,
  playbackRate: number,
  preservePitch: boolean,
  skipBackwardInterval: number,
  skipForwardInterval: number,
  skipInterval: number,
  pollInterval: number,
  autoPlay: boolean,
  enableMediaSession: boolean
): React.MutableRefObject<{ settings: AudioSettings }>
```

## Epub Navigator Hook

Manages EPUB navigation and rendering.

```typescript
interface EpubNavigatorLoadProps {
  container: HTMLDivElement | null;
  publication: Publication;
  listeners: EpubNavigatorListeners;
  positionsList?: Locator[];
  initialPosition?: Locator;
  preferences?: IEpubPreferences;
  defaults?: IEpubDefaults;
  injectables?: IInjectablesConfig;
  contentProtection?: IContentProtectionConfig;
}

function useEpubNavigator(): {
  EpubNavigatorLoad: (config: EpubNavigatorLoadProps, cb: Function) => void;
  EpubNavigatorDestroy: (cb: Function) => void;
  goRight: (animated: boolean, callback: (ok: boolean) => void) => void;
  goLeft: (animated: boolean, callback: (ok: boolean) => void) => void;
  goBackward: (animated: boolean, callback: (ok: boolean) => void) => void;
  goForward: (animated: boolean, callback: (ok: boolean) => void) => void;
  goLink: (link: Link, animated: boolean, callback: (ok: boolean) => void) => void;
  go: (locator: Locator, animated: boolean, callback: (ok: boolean) => void) => void;
  navLayout: () => EPUBLayout | undefined;
  currentLocator: () => Locator | undefined;
  previousLocator: () => Locator | null;
  nextLocator: () => Locator | null;
  currentPositions: () => number[] | undefined;
  canGoBackward: () => boolean | undefined;
  canGoForward: () => boolean | undefined;
  isScrollStart: () => boolean | undefined;
  isScrollEnd: () => boolean | undefined;
  preferencesEditor: PreferencesEditor | undefined;
  getSetting: <K extends keyof EpubSettings>(settingKey: K) => EpubSettings[K];
  submitPreferences: (preferences: IEpubPreferences) => Promise<void>;
  getCframes: () => (FrameManager | FXLFrameManager | undefined)[] | undefined;
  onFXLPositionChange: (cb: (locator: Locator) => void) => void;
};
```

**Features:**
- EPUB navigation (forward, backward, by link, by locator, etc.)
- Layout detection and preferences
- Position tracking and locator management
- Frame management for fixed and reflowable layouts

**Example:**
```typescript
const MyEpubReader = ({ publication }) => {
  const {
    EpubNavigatorLoad,
    EpubNavigatorDestroy,
    goLeft,
    goRight
  } = useEpubNavigator();

  useEffect(() => {
    EpubNavigatorLoad({
      container: containerRef.current,
      publication: publication,
      listeners: {
        // Your listeners here
      }
    }, () => console.log("Navigator loaded"));

    return () => {
      EpubNavigatorDestroy(() => console.log("Navigator destroyed"));
    };
  }, [publication]);

  return (
    <button onClick={() => goLeft(true, () => {})}>
      Previous
    </button>
    <div ref={ containerRef }></div>
    <button onClick={() => goRight(true, () => {})}>
      Next
    </button>
  );
};
```

## WebPub Navigator Hook

Manages WebPub navigation and rendering.

```typescript
interface WebPubNavigatorLoadProps {
  container: HTMLDivElement | null;
  publication: Publication;
  listeners: WebPubNavigatorListeners;
  initialPosition?: Locator;
  preferences?: IWebPubPreferences;
  defaults?: IWebPubDefaults;
  injectables?: IInjectablesConfig;
  contentProtection?: IContentProtectionConfig;
}

function useWebPubNavigator(): {
  WebPubNavigatorLoad: (config: WebPubNavigatorLoadProps, cb: Function) => void;
  WebPubNavigatorDestroy: (cb: Function) => void;
  goRight: (animated: boolean, callback: (ok: boolean) => void) => void;
  goLeft: (animated: boolean, callback: (ok: boolean) => void) => void;
  goBackward: (animated: boolean, callback: (ok: boolean) => void) => void;
  goForward: (animated: boolean, callback: (ok: boolean) => void) => void;
  goLink: (link: Link, animated: boolean, callback: (ok: boolean) => void) => void;
  go: (locator: Locator, animated: boolean, callback: (ok: boolean) => void) => void;
  currentLocator: () => Locator | undefined;
  previousLocator: () => Locator | null;
  nextLocator: () => Locator | null;
  currentPositions: () => number[] | undefined;
  canGoBackward: () => boolean | undefined;
  canGoForward: () => boolean | undefined;
  isScrollStart: () => boolean | undefined;
  isScrollEnd: () => boolean | undefined;
  preferencesEditor: PreferencesEditor | undefined;
  getSetting: <K extends keyof WebPubSettings>(settingKey: K) => WebPubSettings[K];
  submitPreferences: (preferences: IWebPubPreferences) => Promise<void>;
  getCframes: () => (FrameManager | FXLFrameManager | undefined)[] | undefined;
}
```

**Features:**
- WebPub navigation (forward, backward, by link, by locator, etc.)
- Layout detection and preferences
- Position tracking and locator management
- Frame management for fixed and reflowable layouts

## Media Query Hooks

### useMediaQuery

A base hook for handling media query matches.

```typescript
function useMediaQuery(query: string | null): boolean
```

**Features:**
- Handles media query matching
- Validates query support and format
- Provides real-time updates
- Cleans up event listeners

### useBreakpoints

Manages responsive breakpoints with media queries.

```typescript
type ThBreakpointRange = {
  min: number | null,  // Minimum width in pixels
  max: number | null   // Maximum width in pixels
}

type BreakpointsMap<T> = {
  [key in ThBreakpoints]?: T  // Map of breakpoint values
}

type ThBreakpointsObject = {
  [key in ThBreakpoints]: boolean | null;  // Breakpoint match states
  current: string | null;                  // Current active breakpoint
  ranges: ThBreakpointRanges;              // Breakpoint range definitions
}

function useBreakpoints(
  map: BreakpointsMap<number | null>,
  onChange?: (breakpoint: ThBreakpoints | null) => void
): ThBreakpointsObject
```

## Accessibility Hooks

### useColorScheme

Detects system color scheme preferences.

```typescript
enum ThColorScheme {
  light = "light",
  dark = "dark"
}

function useColorScheme(
  onChange?: (colorScheme: ThColorScheme) => void
): ThColorScheme
```

### useContrast

Detects system contrast preferences.

```typescript
enum ThContrast {
  none = "no-preference",
  more = "more",
  less = "less",
  custom = "custom"
}

function useContrast(
  onChange?: (contrast: ThContrast) => void
): ThContrast
```

### useForcedColors

Detects if system is using forced colors.

```typescript
function useForcedColors(
  onChange?: (forcedColors: boolean) => void
): boolean
```

### useMonochrome

Detects if system is using monochrome display.

```typescript
function useMonochrome(
  onChange?: (isMonochrome: boolean) => void
): boolean
```

### useReducedMotion

Detects if user prefers reduced motion.

```typescript
function useReducedMotion(
  onChange?: (reducedMotion: boolean) => void
): boolean
```

### useReducedTransparency

Detects if user prefers reduced transparency.

```typescript
function useReducedTransparency(
  onChange?: (reducedTransparency: boolean) => void
): boolean
```

## Utility Hooks

### useObservableCondition

Converts React boolean state to ObservableCondition objects required by Readium Navigator peripherals API, enabling dynamic conditional behavior for keyboard and input peripherals.

```typescript
function useObservableCondition(value: boolean): ObservableCondition
```

### useDocumentTitle

Manages document title.

```typescript
function useDocumentTitle(
  title?: string
): void
```

**Features:**
- Sets document title if truthy

### useFullscreen

Manages fullscreen state and transitions.

```typescript
function useFullscreen(
  onChange?: (isFullscreen: boolean) => void
): {
  isFullscreen: boolean;
  isSupported: boolean;
  handleFullscreen: () => void;
}
```

**Features:**
- Toggles fullscreen mode
- Provides current fullscreen state
- Handles fullscreen change events
- No-op on iOS (Fullscreen API not supported)

### useIsClient

Determines if code is running on client side.

```typescript
function useIsClient(): {
  isClient: boolean;
  isClientRef: React.MutableRefObject<boolean>;
}
```

**Features:**
- Safe hydration handling — `isClient` is `false` during SSR, `true` after mount
- `isClient` state for conditional rendering of client-only UI
- `isClientRef` for reading inside stable callbacks without adding a reactive dep (ref identity is stable; `.current` always reflects the latest value)

### useLocalStorage

Manages local storage with React state synchronization.

```typescript
function useLocalStorage(
  key: string
): {
  localData: any;
  setLocalData: (value: any) => void;
  getLocalData: () => any;
  clearLocalData: () => void;
  cachedLocalData: React.MutableRefObject<any>;
}
```

**Features:**
- Automatically syncs with localStorage
- Provides getter, setter, and clear methods
- Maintains local state and a cached ref of the value
- Handles JSON serialization/deserialization
- Returns the current value and cached ref

### usePrevious

Stores and returns the previous value of a variable.

```typescript
function usePrevious<T>(
  value: T
): T | null
```

**Features:**
- Generic type support
- Ref-based storage for performance
- Updates only after render

### usePublicationProgress

Computes reading-progress data (position/percentage math, current chapter title) for EPUB/WebPub, decoupled from the real Readium `Timeline` and from TOC tracking. Position/percentage math is derived from `positionsList`/`currentLocation`; the current chapter's identity comes from the real `TimelineItem` supplied by the navigator's `timelineItemChanged` listener.

```typescript
function usePublicationProgress(options: {
  publication: Publication | null;
  getNavigatorTimeline: () => Timeline | undefined;
  currentTimelineItem?: TimelineItem; // from @readium/shared
  currentLocation?: Locator;
  currentPositions?: number[];
  positionsList?: SerializedLocator[];
  onChange?: (progress: Progress) => void;
}): Progress
```

**Features:**
- Computes position ranges, relative/total progression, and positions-left from `positionsList`
- Sources the current chapter's title from the real Timeline via `getNavigatorTimeline()` and `currentTimelineItem`
- Independent of TOC tracking (see `useTocEntryTracking`) and Timeline adjacency (see `useTimelineAdjacency`)

### useTimelineAdjacency

Resolves previous/next chapter via the navigator's real Readium `Timeline` (`Timeline.navigableFrom()`), dispatching to the `adjacentTimelineItems` store slice. Shared by Epub, WebPub, and Audio.

```typescript
function useTimelineAdjacency(getNavigatorTimeline: () => Timeline | undefined): {
  updateAdjacentItems: (item: TimelineItem) => void;
  clearAdjacentItems: () => void;
}
```

### useTocEntryTracking

Resolves/clears the current TOC entry from a `TimelineItem` via `Timeline.tocEntryFor()`, reusing `findTocItemByHref` to map it to the local tree's row id. Pure TOC logic — has no knowledge of Timeline resolution itself; callers pass the `TimelineItem` obtained from the navigator's `timelineItemChanged` listener.

```typescript
function useTocEntryTracking(
  getNavigatorTimeline: () => Timeline | undefined,
  tocTree: TocItem[] | undefined
): {
  updateCurrentTocEntry: (item: TimelineItem) => void;
  clearCurrentTocEntry: () => void;
}
```

### useFonts

Manages font injection and resource management for EPUB/WebPub readers.

```typescript
function useFonts(fontResources?: InjectableFontResources | null): {
  injectFontResources: (resources: InjectableFontResources | null) => void;
  removeFontResources: () => void;
  getAndroidFXLPatch: () => (ILinkInjectable & IBlobInjectable) | null;
}
```

**Features:**
- Injects font resources into the document head
- Manages font resource lifecycle (injection and removal)
- Provides Android FXL-specific font patches
- Handles different font resource types (URL, blob, link)
- Automatic cleanup on unmount or resource changes
