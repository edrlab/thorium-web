# Core Hooks

The Core package provides various hooks, including custom hooks for handling audio, EPUB, and WebPub publications, accessibility, and responsive design.

## Audio Support Hook

```tsx
import {
  useAudioNavigator,
  useAudioSettingsCache
} from "@edrlab/thorium-web/core/hooks";
```

`useAudioNavigator` exposes the Readium TS-Toolkit `AudioNavigator` and provides methods to load and destroy the navigator, control playback, navigate to positions, and submit preferences.

`useAudioSettingsCache` provides a stateless cache for audio settings that maps React state to mutable refs — useful for settings that need to persist across re-renders without triggering navigator re-initialization.

> [!IMPORTANT]
> When using Stateful Components, you must use the hook from the `@edrlab/thorium-web/audio` package so that they all share the same instance, not from `@edrlab/thorium-web/core`.

## EPUB Support Hook

```tsx
import {
  useEpubNavigator,
  useEpubSettingsCache
} from "@edrlab/thorium-web/core/hooks";
```

This hook exposes Readium TS-Toolkit `Navigator` object and provides methods to navigate through the publication, apply preferences, etc.

It is the most important hook of the Core package, as it provides the foundation for building an Epub Reader.

The `useEpubSettingsCache` hook provides a stateless cache for EPUB settings that maps React state to mutable refs. It's useful for storing settings that need to persist across component re-renders without causing navigator re-initialization, and the cached values never go stale.

> [!IMPORTANT]
> When using Stateful Components, you must use the hook from the `@edrlab/thorium-web/epub` package so that they all use the same one, not from `@edrlab/thorium-web/core`.

## WebPub Support Hook

```tsx
import {
  useWebPubNavigator,
  useWebPubSettingsCache
} from "@edrlab/thorium-web/core/hooks";
```

Similar to the EPUB navigator hook, this hook provides navigation functionality for Web Publications using the Readium TS-Toolkit `Navigator` object.

The `useWebPubSettingsCache` hook provides a stateless cache for WebPub settings that maps React state to mutable refs. It's useful for storing settings that need to persist across component re-renders without causing navigator re-initialization, and the cached values never go stale.

> [!IMPORTANT]
> When using Stateful Components, you must use the hook from the `@edrlab/thorium-web/webpub` package so that they all use the same one, not from `@edrlab/thorium-web/core`.

## Read Aloud Support Hook

```tsx
import {
  useReadAloudNavigator
} from "@edrlab/thorium-web/core/hooks";
```

This hook exposes the Readium TS-Toolkit `ReadAloudNavigator`, which reads an EPUB or WebPub publication aloud on top of its loaded visual navigator. It provides methods to load and destroy it, control playback by utterance, pick a voice, and submit preferences.

Unlike the other navigator hooks, it doesn’t throw: methods do nothing and return empty values until the navigator is loaded, and `isLoaded` tells you when it is.

## Responsive Design Hooks

```tsx
import { 
  useBreakpoints,
  useContainerBreakpoints,
  useMediaQuery 
} from "@edrlab/thorium-web/core/hooks";
```

These hooks are used internally by `useTheming` from `@edrlab/thorium-web/core/preferences`. They are exposed for custom implementations.

### `useMediaQuery`

Returns `true` when the given media query string matches, `false` otherwise. Responds to changes in real time.

```tsx
const isLandscape = useMediaQuery("(orientation: landscape)");
```

### `useBreakpoints`

Converts the `breakpointsMap` from preferences into CSS media queries evaluated against the **viewport (window) width**. Returns a `ThBreakpointsObject` with a boolean per breakpoint and a `current` property holding the active `ThBreakpoints` key.

```tsx
const breakpoints = useBreakpoints(preferences.theming.breakpoints, (bp) => {
  // called when the active breakpoint changes
  console.log("window breakpoint:", bp);
});

if (breakpoints.current === ThBreakpoints.compact) { ... }
```

### `useContainerBreakpoints`

Resolves the active `ThBreakpoints` value against the **width of a specific DOM element** (the reader's root container) rather than the viewport. Uses a ResizeObserver so it updates whenever the element resizes — equivalent to a CSS container query.

```tsx
const setContainerRef = useContainerBreakpoints(
  preferences.theming.breakpoints,
  (breakpoint) => {
    // called each time the container crosses a breakpoint threshold
    dispatch(setContainerBreakpoint(breakpoint));
  }
);

// Attach to whichever element defines the reader's available width
return <div ref={ setContainerRef } className={ styles.readerShell }>...</div>;
```

`setContainerRef` is a stable callback ref — pass it directly as a `ref` prop. You do not need to manage the element reference yourself.

## Accessibility Hooks

```tsx
import { 
  useColorScheme, 
  useContrast, 
  useForcedColors, 
  useMonochrome, 
  useReducedMotion, 
  useReducedTransparency 
} from "@edrlab/thorium-web/core/hooks";

const MyAccessibleComponent = () => {
  const reducedMotion = useReducedMotion();
  
  return (
    <MyAnimatedComponent disableMotion={ reducedMotion }>
      {/* Content with conditional animations */}
    </MyAnimatedComponent>
  );
};
```

These hooks are used in `useTheming` hook from `@edrlab/thorium-web/core/preferences` package. They are exposed in case they can be useful or if you want to use them in your own implementation of an app.

## Utility Hooks

```tsx
import { useState } from "react";

import { 
  useIsClient, 
  usePrevious, 
  useFullscreen
} from "@edrlab/thorium-web/core/hooks";

const MyIncrementButton = () => {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);
  
  return (
    <div>
      <p>Current count: { count } (Previous: { previousCount ?? "none"} )</p>
      <button onClick={ () => setCount(count + 1) }>Increment</button>
    </div>
  );
};

const myFullscreenButton = () => {
  const { isFullscreen, handleFullscreen } = useFullscreen();

  return (
    <button onClick={ handleFullscreen }>
      { isFullscreen? "Exit Fullscreen" : "Enter Fullscreen"}
    </button>
  );
}
```