# Core Helpers API Documentation

The Core package provides utility functions for common tasks in building reading applications. These helpers are designed to be efficient, type-safe, and easy to use.

## Focus Utilities

A collection of utilities for managing focus and interactive elements.

```typescript
import { focusUtilities } from "@edrlab/thorium-web/core/helpers";
```

### `isActiveElement`

Checks if an element is currently focused.

```typescript
function isActiveElement(el: Element | undefined | null): boolean
```

### `isKeyboardTriggered`

Determines if an element was focused via keyboard (matches :focus-visible).

```typescript
function isKeyboardTriggered(el: Element | undefined | null): boolean
```

### `isInteractiveElement`

Checks if an element is interactive (can receive focus and user input).

```typescript
function isInteractiveElement(element: Element | null): boolean
```

## Keyboard Utilities

Utilities for displaying keyboard shortcuts and mapping platform-specific modifier keys.

```typescript
import {
  metaKeys,
  defaultPlatformModifier,
  getPlatformModifier,
  ShortcutRepresentation
} from "@edrlab/thorium-web/core/helpers";
```

### `metaKeys`

Object containing platform-specific modifier key definitions.

```typescript
const metaKeys: UnstableMetaKeys = {
  altKey: UnstableMetaKey,
  ctrlKey: UnstableMetaKey & UnstablePlatformModifier,
  metaKey: UnstableMetaKey & UnstablePlatformModifier, // Command on Mac, Windows on PC
  shiftKey: UnstableMetaKey
}
```

Each modifier key contains:
- `longform`: Full name (e.g., "Command", "Control")
- `shortform`: Short name (e.g., "Cmd", "Ctrl")
- `modifier`: Event property name (e.g., "metaKey", "ctrlKey")
- `symbol`: Unicode symbol (e.g., "⌘", "^")

### `getPlatformModifier`

Returns the appropriate platform modifier key for the current operating system.

```typescript
function getPlatformModifier(): UnstablePlatformModifier
```

**Returns:** Platform modifier key object (Command on Mac, Control on Windows/Linux).

### `defaultPlatformModifier`

Default platform modifier key (Control key).

```typescript
const defaultPlatformModifier: UnstablePlatformModifier
```

### `ShortcutRepresentation`

Enum controlling how modifier keys are rendered in the `StatefulShortcut` component.

```typescript
enum ShortcutRepresentation {
  symbol = "symbol",   // ⌥, ⇧, ⌘ …
  short  = "shortform", // Alt, Shift, Cmd …
  long   = "longform"  // Option, Shift, Command …
}
```

## Platform Detection

Utilities for detecting the user's platform and operating system.

```typescript
import { getPlatform, isMacish, isIpadOS } from "@edrlab/thorium-web/core/helpers";
```

### `getPlatform`

Returns the current platform identifier.

```typescript
function getPlatform(): string
```

### `isMacish`

Checks if the current platform is macOS or iOS-based.

```typescript
function isMacish(): boolean
```

### `isIpadOS`

Detects if the current platform is iPadOS.

```typescript
function isIpadOS(): boolean
```

## Breakpoints Map

Utility for creating responsive breakpoint maps.

```typescript
import { makeBreakpointsMap } from "@edrlab/thorium-web/core/helpers";
```

### `makeBreakpointsMap`

Creates a map of breakpoints with specified values.

Breakpoints are defined as an object with breakpoint names as keys and their corresponding values. The keys are:
- `ThBreakpoints.small`
- `ThBreakpoints.medium`
- `ThBreakpoints.expanded`
- `ThBreakpoints.large`
- `ThBreakpoints.xlarge`

This is useful when using [Preferences](../Preferences.md) as it will return the value for all breakpoints e.g. type of sheet in the vanilla Reader, even if they are not defined in preferences.

```typescript
function makeBreakpointsMap<T>({
  defaultValue,
  fromEnum,
  pref,
  disabledValue,
}: {
  defaultValue: T;
  fromEnum: any;
  pref?: BreakpointsMap<T> | boolean;
  disabledValue?: T;
}): Required<BreakpointsMap<T>>
```

## Props to CSS Variables

Utility for converting object properties to CSS custom properties.

```typescript
import { propsToCSSVars } from "@edrlab/thorium-web/core/helpers";
```

### `propsToCSSVars`

Converts object properties to CSS custom properties recursively, with options for prefixing and property exclusion.

```typescript
function propsToCSSVars(
  props: { [x: string]: any },
  options?: {
    prefix?: string;
    exclude?: string[];
  } | string
): { [key: string]: any }
```

**Examples:**

Basic usage with prefix:
```typescript
const props = {
  color: "blue",
  spacing: {
    padding: 16,
    margin: 8
  }
};

const cssVars = propsToCSSVars(props, { prefix: "theme" });
// Result:
// {
//   "--theme-color": "blue",
//   "--theme-spacing-padding": "16px",
//   "--theme-spacing-margin": "8px"
// }
```

With exclude option:
```typescript
const cssVars = propsToCSSVars({
  color: "red",
  size: 14,
  spacing: { top: 8, bottom: 16 }
}, { 
  prefix: "app",
  exclude: ["size"]
});
// Result:
// {
//   "--app-color": "red",
//   "--app-spacing-top": "8px",
//   "--app-spacing-bottom": "16px"
// }
```

### `prefixString`

Prefixes a string with Thorium Web’s namespace. Use it with `propsToCSSVars` to generate the CSS custom properties the built-in components expect (e.g. `--th-arrow-*`, `--th-icon-*`, `--th-layout-*`).

```typescript
import { prefixString } from "@edrlab/thorium-web/core/helpers";

function prefixString(
  str: string,
  variant?: "short" | "full" // default: "short"
): string
```

**Examples:**
```typescript
prefixString("arrow");          // "th-arrow"
prefixString("arrow", "full");  // "thorium_web-arrow"

const cssVars = propsToCSSVars(preferences.theming.arrow, { prefix: prefixString("arrow") });
```

## Progression Format Utilities

Utilities for determining supported progression formats based on timeline data.

```typescript
import { 
  getSupportedProgressionFormats, 
  canRenderProgressionFormat,
  getBestMatchingProgressionFormat 
} from "@edrlab/thorium-web/core/helpers";
```

### `getSupportedProgressionFormats`

Returns an array of progression formats that can be rendered given the current timeline state.

```typescript
function getSupportedProgressionFormats(timeline?: TimelineProgression): ThProgressionFormat[]
```

**Returns:** Array of supported `ThProgressionFormat` values. Always includes `ThProgressionFormat.none` at minimum.

**Parameters:**
- `timeline` - Optional timeline progression data containing position and progression information

### `canRenderProgressionFormat`

Checks if a specific progression format is supported given the supported formats array.

```typescript
function canRenderProgressionFormat(
  format: ThProgressionFormat,
  supportedFormats: ThProgressionFormat[]
): boolean
```

**Returns:** `true` if the format is supported, `false` otherwise.

### `getBestMatchingProgressionFormat`

Finds the first supported progression format from a list of preferred formats.

```typescript
function getBestMatchingProgressionFormat(
  preferredFormats: ThProgressionFormat[],
  timeline?: TimelineProgression
): ThProgressionFormat | null
```

**Returns:** The first preferred format that is supported, or `null` if none are supported.

**Parameters:**
- `preferredFormats` - Array of progression formats in order of preference
- `timeline` - Optional timeline progression data

**Example:**
```typescript
const supported = getSupportedProgressionFormats(timeline);
// Result: [ThProgressionFormat.none, ThProgressionFormat.positions, ThProgressionFormat.positionsOfTotal, ...]

const canRender = canRenderProgressionFormat(ThProgressionFormat.overallProgression, supported);
// Result: true or false

const bestFormat = getBestMatchingProgressionFormat(
  [ThProgressionFormat.overallProgression, ThProgressionFormat.positionsOfTotal],
  timeline
);
// Result: ThProgressionFormat.overallProgression (if supported) or ThProgressionFormat.positionsOfTotal (if preferred and supported)