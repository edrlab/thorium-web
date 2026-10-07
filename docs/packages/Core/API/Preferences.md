# Preferences API Reference

This document details the preferences management system that handles user settings, theming, and layout preferences.

## Global Preferences

### ThGlobalPreferencesProvider

App-level provider that owns `locale` and makes UI direction available everywhere via React Aria's `useLocale()`. Must be placed above all readers, inside `ThStoreProvider`.

**Props:**
```typescript
interface Props {
  adapter?: ThGlobalPreferencesAdapter;
  initialPreferences?: ThGlobalPreferences;
  children: React.ReactNode;
}
```

**Features:**
- Wraps React Aria's `I18nProvider` so `useLocale()` works anywhere in the tree
- Sets `document.documentElement.dir` reactively after hydration
- Validates the locale via `createGlobalPreferences` (unsupported locales fall back to browser default)

```tsx
import { ThGlobalPreferencesProvider } from "@edrlab/thorium-web/preferences";

<ThStoreProvider>
  <ThGlobalPreferencesProvider initialPreferences={{ locale: "ar" }}>
    { children }
  </ThGlobalPreferencesProvider>
</ThStoreProvider>
```

### StatefulGlobalPreferencesProvider

Redux-backed wrapper around `ThGlobalPreferencesProvider`. Reads and writes locale through `globalPreferencesReducer` so it is persisted to `localStorage` automatically.

```tsx
import { StatefulGlobalPreferencesProvider } from "@edrlab/thorium-web/components";

<ThStoreProvider>
  <StatefulGlobalPreferencesProvider initialPreferences={{ locale: "fr" }}>
    { children }
  </StatefulGlobalPreferencesProvider>
</ThStoreProvider>
```

### createGlobalPreferences

Server-safe factory that validates the locale and returns a `ThGlobalPreferences` object. Unsupported locales are silently discarded.

```typescript
import { createGlobalPreferences } from "@edrlab/thorium-web/preferences";

const prefs = createGlobalPreferences({ locale: "ar" });
```

Can be called in Next.js Server Components and `layout.tsx` directly (no `"use client"` directive).

### useGlobalPreferences

Hook to read and update global preferences.

```typescript
import { useGlobalPreferences } from "@edrlab/thorium-web/preferences";

const { preferences, updatePreferences } = useGlobalPreferences();
// preferences.locale — current locale string or undefined

updatePreferences({ locale: "fr" });
```

Must be used within a `ThGlobalPreferencesProvider`.

### ThGlobalPreferencesAdapter

Interface for implementing a custom global preferences adapter.

```typescript
interface ThGlobalPreferencesAdapter {
  getPreferences(): ThGlobalPreferences;
  setPreferences(prefs: ThGlobalPreferences): void;
  subscribe(callback: (prefs: ThGlobalPreferences) => void): void;
  unsubscribe(callback: (prefs: ThGlobalPreferences) => void): void;
}
```

### ThGlobalMemoryPreferencesAdapter

In-memory implementation of `ThGlobalPreferencesAdapter`. Used as the default adapter by `ThGlobalPreferencesProvider`.

```typescript
new ThGlobalMemoryPreferencesAdapter(initialPreferences?: ThGlobalPreferences)
```

### ThReduxGlobalPreferencesAdapter

Redux-backed implementation of `ThGlobalPreferencesAdapter`. Reads `state.globalPreferences.locale` and dispatches `setLocale`. Used internally by `StatefulGlobalPreferencesProvider`.

---

## Audio Preferences

### ThAudioPreferencesProvider

Context provider component for audio preferences management.

**Props:**
```typescript
interface Props<K extends AudioCustomizableKeys = AudioDefaultKeys> {
  adapter?: ThAudioPreferencesAdapter<K>;
  initialPreferences?: ThAudioPreferences<K>;
  devMode?: boolean;
  children: React.ReactNode;
}
```

**Features:**
- Audio-specific preferences context management
- Default audio preferences handling
- Type-safe customization via `AudioCustomizableKeys`
- Adapter support for custom persistence
- Dev mode support (disables content protection)

### useAudioPreferences

Hook for accessing the audio preferences context.

```typescript
function useAudioPreferences<K extends AudioCustomizableKeys = AudioDefaultKeys>(): {
  preferences: ThAudioPreferences<K>;
  updatePreferences: (prefs: ThAudioPreferences<K>) => void;
}
```

Must be used within a `<ThAudioPreferencesProvider>`.

### createAudioPreferences

Helper to create a validated `ThAudioPreferences` object. Validates at runtime:
- Secondary action keys are present in `keys`
- `skipInterval` and `skipBackwardInterval`/`skipForwardInterval` are not used together
- Theme keys referenced in `audioOrder` exist in `keys`
- Slider presets are reachable given the configured `range` and `step`

```typescript
function createAudioPreferences<K extends AudioCustomizableKeys = {}>(
  params: ThAudioPreferences<K>
): ThAudioPreferences<K>
```

### ThAudioPreferencesAdapter

Interface for implementing a custom audio preferences adapter.

```typescript
interface ThAudioPreferencesAdapter<T extends AudioCustomizableKeys = AudioCustomizableKeys> {
  getPreferences(): ThAudioPreferences<T>;
  setPreferences(prefs: ThAudioPreferences<T>): void;
  subscribe(callback: (prefs: ThAudioPreferences<T>) => void): void;
  unsubscribe(callback: (prefs: ThAudioPreferences<T>) => void): void;
}
```

### ThAudioMemoryPreferencesAdapter

In-memory implementation of `ThAudioPreferencesAdapter`. Used as the default adapter by `ThAudioPreferencesProvider`.

```typescript
new ThAudioMemoryPreferencesAdapter<K>(initialPreferences: ThAudioPreferences<K>)
```

---

## Core Components

### ThPreferencesProvider

Context provider component for preferences management.

**Props:**
```typescript
interface Props<K extends CustomizableKeys = DefaultKeys> {
  adapter?: ThPreferencesAdapter<K>;
  devMode?: boolean;
  initialPreferences?: ThPreferences<K>;
  children: React.ReactNode;
}
```

**Features:**
- Preferences context management
- Default preferences handling
- Type-safe customization
- Direction setting
- Adapter support
- Dev mode support

## Hooks

### usePreferences

Hook for accessing the preferences context.

```typescript
function usePreferences<K extends CustomizableKeys = DefaultKeys>(): {
  preferences: ThPreferences<K>;
  updatePreferences: (prefs: ThPreferences<K>) => void;
  getFontInjectables: (options?: { language?: string } | { key?: string }, optimize?: boolean) => any;
  getFontsList: (options?: { language?: string } | { key?: string }) => FontCollection;
  getFontMetadata: (fontId: string) => any;
  resolveFontLanguage: (bcp47Tag: string | undefined, scriptMode: ScriptMode) => any;
}
```

**Features:**
- Type-safe read-only access to preferences
- Context validation
- Automatic type inference for custom preferences
- Font service integration for font management
- Preferences update functionality

### useReadAlongPreferences

Hook for accessing the read-along preferences (`preferences.readAlong`).

```typescript
function useReadAlongPreferences<K extends CustomizableKeys = DefaultKeys>(): ThReadAlongPref<K>
```

**Features:**
- Falls back to `defaultReadAlongPreferences` when `readAlong` isn’t set, or outside a `ThPreferencesProvider`
- Never throws

### usePreferenceKeys

Hook for accessing ordered preference keys from the current preferences.

```typescript
function usePreferenceKeys(): {
  reflowActionKeys: string[];
  fxlActionKeys: string[];
  webPubActionKeys: string[];
  reflowThemeKeys: string[];
  fxlThemeKeys: string[];
  reflowSettingsKeys: string[];
  fxlSettingsKeys: string[];
  webPubSettingsKeys: string[];
  mainTextSettingsKeys: string[];
  subPanelTextSettingsKeys: string[];
  mainSpacingSettingsKeys: string[];
  subPanelSpacingSettingsKeys: string[];
  reflowSpacingPresetKeys: ThSpacingPresetKeys[];
  fxlSpacingPresetKeys: ThSpacingPresetKeys[];
  webPubSpacingPresetKeys: ThSpacingPresetKeys[];
}
```

**Features:**
- Read-only access to ordered preference keys
- Automatically updates when preferences change
- Provides access to both reflowable and fixed-layout (FXL) keys
- Custom key support
- Helper functions for type assertion
- Includes WebPub-specific keys

### useFilteredPreferenceKeys

Drop-in replacement for `usePreferenceKeys` that additionally filters out settings keys not applicable to the current publication's script mode (`state.publication.scriptMode`). Use this wherever settings UI is rendered to avoid showing irrelevant controls (e.g. text-align in CJK, ruby toggle in Latin).

```typescript
import { useFilteredPreferenceKeys } from "@edrlab/thorium-web/preferences";

function usePreferenceKeys(): {
  reflowSettingsKeys: string[];
  fxlSettingsKeys: string[];
  webPubSettingsKeys: string[];
  mainTextSettingsKeys: string[];
  subPanelTextSettingsKeys: string[];
  mainSpacingSettingsKeys: string[];
  subPanelSpacingSettingsKeys: string[];
  // ... same shape as usePreferenceKeys
}
```

Must be used within a `ThPreferencesProvider` and a `ThStoreProvider` (reads `scriptMode` and `isFXL` from the store).

---

## Helpers

### SETTINGS_KEY_TO_PREFERENCE

A record mapping every `ThSettingsKeys` value to the corresponding preference property name. Useful when building generic settings components that need to map a key to its underlying preference.

```typescript
import { SETTINGS_KEY_TO_PREFERENCE } from "@edrlab/thorium-web/preferences";

// Example: ThSettingsKeys.ligatures → "ligatures"
// Example: ThSettingsKeys.layout    → "scroll"
const prefKey = SETTINGS_KEY_TO_PREFERENCE[ThSettingsKeys.layout]; // "scroll"
```

---

### useTheming

Hook for managing theme-related preferences and side effects.

```typescript
interface useThemingProps<T extends string> {
  theme?: string;
  themeKeys: { [key in T]?: ThemeTokens };
  systemKeys?: {
    light: T;
    dark: T;
  };
  breakpointsMap: BreakpointsMap<number | null>;
  initProps?: Record<string, any>;
  coverUrl?: string;
  autoThemeSource?: "cover" | "system";
  onCoverThemeGenerated?: (themeTokens: ThemeTokens) => void;
  onBreakpointChange?: (breakpoint: ThBreakpoints | null) => void;
  onContainerBreakpointChange?: (breakpoint: ThBreakpoints | null) => void;
  onColorSchemeChange?: (colorScheme: ThColorScheme) => void;
  onContrastChange?: (contrast: ThContrast) => void;
  onForcedColorsChange?: (forcedColors: boolean) => void;
  onMonochromeChange?: (isMonochrome: boolean) => void;
  onReducedMotionChange?: (reducedMotion: boolean) => void;
  onReducedTransparencyChange?: (reducedTransparency: boolean) => void;
}

function useTheming<T extends string>(props: useThemingProps<T>): {
  inferThemeAuto: () => T | undefined;
  theme?: string;
  breakpoints: ThBreakpoints | null;
  setContainerRef: (el: Element | null) => void;
  colorScheme: ThColorScheme;
  contrast: ThContrast;
  forcedColors: boolean;
  monochrome: boolean;
  reducedMotion: boolean;
  reducedTransparency: boolean;
  coverThemeTokens: ThemeTokens | null;
  themeResolved: boolean;
}
```

**Features:**
- Theme management
- System theme detection
- Cover-based automatic theme generation (`autoThemeSource: "cover"`)
- CSS variable handling
- Viewport media query breakpoints (`onBreakpointChange`) and container-width breakpoints (`onContainerBreakpointChange`) via ResizeObserver
- `setContainerRef` — callback ref to attach to the reader's root container element; drives `onContainerBreakpointChange` (see [Theming — Window breakpoint vs. container breakpoint](../../../customization/Theming.md#window-breakpoint-vs-container-breakpoint))
- Automatic theme color meta tag updates
- `themeResolved` flag to defer rendering until cover theme extraction completes

## Helpers

### buildThemeObject

Utility for creating theme objects.

```typescript
interface buildThemeProps<T extends string> {
  theme?: string;
  themeKeys: { [key in T]?: ThemeTokens };
  systemThemes?: {
    light: T;
    dark: T;
  };
  colorScheme?: ThColorScheme;
}

function buildThemeObject<T extends string>(props: buildThemeProps<T>): {
  backgroundColor: CSSColor | null;
  textColor: CSSColor | null;
  linkColor: CSSColor | null;
  selectionBackgroundColor: CSSColor | null;
  selectionTextColor: CSSColor | null;
  visitedColor: CSSColor | null;
}
```

**Features:**
- Theme object creation
- System theme handling
- Automatic fallback for missing themes
- CSS color value generation