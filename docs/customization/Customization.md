# Customization

This project has been designed to be highly customizable from the start, with [multiple options configurable in its Preferences](../../src/preferences/preferences.ts). This should help change a significant amount of features without having to fork and modify components heavily since the app is built almost entirely from Preferences.

If you are not forking this project but importing its packages, please refer to the [Handling Preferences doc](./HandlingPreferences.md) for more details. This explains how to use the `createPreferences` helper to create your own preferences object, and how to use the `PreferencesProvider` component to make them available to all components.

Otherwise you should be able to modify the preferences object directly in [defaultPreferences](../../src/preferences/defaultPreferences.ts).

> [!NOTE]
> Audio has its own separate preferences system. Use `createAudioPreferences` and `ThAudioPreferencesProvider` instead of their EPUB/WebPub equivalents. See the [Audio Customization doc](./audio/Customization.md) for a full overview.

## Metadata

### Document Title

The `documentTitle` preference allows you to configure the document title of the reader. It accepts the following properties:

- `format`: The format of the document title. Can be one of enum `ThDocumentTitleFormat`:
  - `title`: The publication title
  - `chapter`: The current chapter/section title
  - `titleAndChapter`: The publication title and the current chapter/section title
  - `none`: Use the default document title from markup

It can also be an object with property `key` and `fallback` to provide an arbitrary document title. The `key` should be a key from your translation files, and the `fallback` is the default value if the translation key is not found.

For instance:

```
documentTitle: {
  key: "documentTitle",
  fallback: "Default Document Title"
}
```

## Typography

The `typography` object can be used to set the following properties:

- `pageGutter`;
- `optimalLineLength`; 
- `minimalLineLength`;
- `maximalLineLength`.

For instance: 

```
typography: {
  minimalLineLength: 35,
  optimalLineLength: 65,
  maximalLineLength: 75,
  pageGutter: 20
}
```

### Page Gutter

The `padding` to add to `body` in publications, in `px`.

### Optimal Line Length

The optimal line length used for value `auto` when the publication is paginated, in `ch` (number of characters). 

This will be used to switch from one to two columns, taking page gutter into account.

### Minimal Line Length (optional)

The minimal line length a column of text can never go below when `n >= 2` columns are set by the user, in `ch`. 

If the value is `undefined`, then optimal line length is the minimal line length. The algorithm will also check this value is not higher than the optimal line length and apply the same logic.

If it’s `null` then this means it is disabled entirely, and there is no lower limit. This can be used to enforce `n` columns, even on smaller screens.

### Maximal Line Length (optional)

The maximal line length a column of text can reach in `ch`. 

If the value is `undefined`, then optimal line length is the maximal line length. The algorithm will also check this value is higher than the optimal line length and apply the same logic.

If it’s `null` then this means it is disabled entirely, and there is no upper limit. This can be used to enforce the line of text is as long as its container or column when the count is set by the user.

## Affordances

The `affordances` object can be used to set the following properties:

- `scroll` to configure the scroll affordances;
- `pagination` to configure the pagination affordances.

### Scroll

The `scroll` object can be used to set the following properties:

- `hintInImmersive` to configure whether the scroll affordances should be displayed in immersive mode.
- `toggleOnMiddlePointer` to configure whether the scroll affordances should be toggled on middle tap or click.
- `hideOnForwardScroll` to configure whether the scroll affordances should be hidden on forward scroll.
- `showOnBackwardScroll` to configure whether the scroll affordances should be shown on backward scroll.
- `affordance` to configure what previous/next chapter navigation in the scroll-mode footer is based on. Accepts a `ThScrollAffordance` value:
  - `ThNavigationAffordance.timeline` (default): navigate to the previous/next timeline segment.
  - `ThNavigationAffordance.readingOrder`: navigate to the previous/next resource in the reading order.

> [!NOTE]
> `ThNavigationAffordance.toc` is not a valid value here: a single toc entry can span multiple reading-order resources, so navigating strictly by toc entry can skip resources that have no toc entry of their own. Audio's per-track affordance preference (see the [Audio Customization doc](./audio/Customization.md#affordances)) is unaffected and still supports `toc`.

For instance:

```typescript
import { ThNavigationAffordance } from "@edrlab/thorium-web/preferences";

affordances: {
  scroll: {
    hintInImmersive: false,
    toggleOnMiddlePointer: ["tap", "click"],
    hideOnForwardScroll: true,
    showOnBackwardScroll: false,
    affordance: ThNavigationAffordance.readingOrder
  }
}
```

> [!NOTE]
> This only affects the scroll-mode chapter pagination footer. Paginated EPUB arrow buttons always page through content resource-by-resource, regardless of this setting.

### Pagination

The `pagination` object configures the behavior of pagination arrows in the reader. It has two main configurations:

1. `reflow`: Settings for reflowable content (standard EPUB)
2. `fxl`: Settings for fixed-layout content (FXL)

Each configuration (`reflow` and `fxl`) accepts the following properties:

- `default`: the default configuration for the pagination arrows
- `breakpoints`: the breakpoints configuration for the pagination arrows

When using breakpoints, the configuration will be applied when the reader is in the corresponding breakpoint. It is expecting an object with keys from enum `ThBreakpoints`.

The configuration object can have the following properties:

- `variant`: Controls the visual style of the pagination arrows
  - `"none"`: No arrows shown
  - `"stacked"`: Arrows are stacked on each side of the content
  - `"layered"`: Arrows are layered over the content (default)
- `discard` (required for `default`, optional for `breakpoints`): 
  - `"none"`: No conditions
  - Array of conditions that will hide the arrows when they become true
    - `"navigation"`: Hide after user navigation
    - `"immersive"`: Hide when entering immersive mode
    - `"fullscreen"`: Hide when entering fullscreen
- `hint` (required for `default`, optional for `breakpoints`): 
  - `"none"`: No conditions
  - Array of conditions that will show the arrows when they transition from true to false
    - `"immersiveChange"`: Show when exiting immersive mode
    - `"fullscreenChange"`: Show when exiting fullscreen
    - `"layoutChange"`: Show when layout changes from scroll to paginated

> [!NOTE]
> FXL arrows `variant` is always `layered`, no matter the configuration. FXL navigator is using the window width to calculate the layout, so we need to force the layered variant to prevent layout issues at the time being.

For instance:

```
affordances: {
  paginated: {
    reflow: {
      default: {
        variant: "layered",
        discard: ["navigation", "immersive"],
        hint: ["layoutChange"]
      },
      breakpoints: {
        [ThBreakpoints.large]: {
          variant: "stacked"
        }
      }
    }
  }
}
```

## Theming

See the [dedicated Theming doc](./Theming.md).

You can configure `breakpoints`, that are re-used multiple times throughout preferences, in `theming`. 

This document also explains in depth how you can add your own themes, customize, or remove existing ones. Without having to add or modify any component.

## Shortcuts

Action shortcuts are powered by the Readium Navigator's keyboard peripheral system. Each action that has a shortcut configured is registered as a peripheral and fires when the matching key combination is pressed inside the reader iframe.

### Display format

You can set the `representation` of the modifier keys displayed in the shortcut component with enum `ShortcutRepresentation` (`symbol`, `short`, `long`).

For instance, for the Option key on Mac: `symbol` → `⌥`, `short` → `Alt`, `long` → `Option`.

You can also configure an optional `joiner` string placed between key labels.

```typescript
shortcuts: {
  representation: ShortcutRepresentation.short,
  joiner: "+"
}
```

Will display shortcuts as `Alt+Shift+{ Key }`.

### Display locations

Use `displayIn` to control where keyboard shortcuts are rendered. It accepts an array of location strings:

- `"tooltip"` — shows the shortcut inside the action icon's tooltip, alongside the label.
- `"menuItem"` — shows the shortcut in the overflow menu item.

```typescript
shortcuts: {
  representation: ShortcutRepresentation.symbol,
  joiner: "+",
  displayIn: ["tooltip", "menuItem"]
}
```

Omit a location to hide shortcuts there, or pass an empty array to suppress them entirely. Shortcuts use the same `representation` and `joiner` settings as elsewhere. Actions with no shortcut configured are unaffected.

## Actions

Action Components can be a simple trigger (e.g. fullscreen), or a combination of a trigger and a sheet/container (e.g. Settings, Toc). This should explain why a lot of their properties are optional when configured in `keys`.

### Display Order

You can customize the order of the actions in the `displayOrder` array, and remove them as well if you don’t want to expose some. 

Enum `ThActionKeys` is provided to keep things consistent across the entire codebase.

For instance:

```
actions: {
  ...
  displayOrder: [
    ThActionKeys.settings,
    ThActionKeys.toc,
    ThActionKeys.fullscreen
  ]
}
```

### Collapsibility and Visibility

You can enable collapsibility i.e. an overflow menu will be used based on your configuration, and set the visibility of eact action. More details in the dedicated [Collapsibility doc](Collapsibility.md).

### Keys

The `keys` object contains the configuration for each `action`, with optional properties that can be used when the action’s is not just a trigger, but also has a sheet/container:

- `sheet` to specify the type of sheet the action’s container should use:
  - as a `defaultSheet` (`fullscreen`, `modal`, `popover`, or `bottomSheet`);
  - as an override of this default for specific breakpoints in a `breakpoints` object (value is a key of `ThSheetTypes` enum).
- `docked`: the configuration for docking. See the [docking doc](./Docking.md) for further details.
- `snapped`: the configuration for snap points. See the [snap points doc](Snappoints.md) for further details.

For instance, if you want a popover sheet for Settings, except in the smaller breakpoint, you would do:

```
keys: {
  ...
  [ThActionKeys.settings]: {
    ...
    sheet: {
      defaultSheet: ThSheetTypes.popover,
      breakpoints: {
        [ThBreakpoints.compact]: ThSheetTypes.bottomSheet
      }
    }
  }
}
```

This means a bottom sheet will be used when the breakpoint is `compact`, and a popover in all other breakpoints.

### Shortcut

You can configure a shortcut for each action by setting property `shortcut` to a `ThShortcutConfig` object, or `null` to disable it.

```typescript
import type { ThShortcutConfig } from "@edrlab/thorium-web/preferences";
import type { KeyCombo } from "@readium/navigator-html-injectables";
```

`ThShortcutConfig` has two fields:

- `keyCombos: KeyCombo[]` — one or more key combinations. Multiple entries allow platform variants (e.g. one with `ctrl: true` for Windows, one with `meta: true` for Mac).
- `label?: I18nValue<string>` — optional display label for the main key (e.g. `"T"`). Supports i18n via `{ key: string; fallback?: string }`. Falls back to deriving the label from `keyCode` for A–Z and digit keys.

`KeyCombo` comes from Readium’s injectables package and has these fields:

```typescript
interface KeyCombo {
  keyCode: number;                              // stable numeric keyCode
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  suppressOnInteractiveElement?: boolean | string[];
  condition?: ObservableCondition;
}
```

Be cautious with your key combinations. Some modifier+letter combinations produce special characters on certain systems — for instance, Option+letter on macOS yields characters like ∏, †, ∆. If your shortcut could conflict with character input, use `suppressOnInteractiveElement` to prevent it from firing when the user is typing.

`suppressOnInteractiveElement` accepts `true` (suppress on all interactive elements) or an array of CSS selectors for finer control. The built-in shortcuts use `TEXT_INPUT_SELECTORS` (exported from `@edrlab/thorium-web/preferences`), which targets text inputs, textareas, and contenteditable elements — but the right value depends on your combination and your content.

**Example — single cross-platform combo:**

```typescript
[ThActionKeys.toc]: {
  shortcut: {
    label: "T",
    keyCombos: [{ keyCode: 84, shift: true, alt: true, suppressOnInteractiveElement: true }]
  }
}
```

Will toggle the Table of Contents when Shift+Alt+T (Shift+Option+T on Mac) is pressed.

**Example — platform-specific combos:**

```typescript
[ThActionKeys.settings]: {
  shortcut: {
    label: "D",
    keyCombos: [
      { keyCode: 68, ctrl: true, suppressOnInteractiveElement: true },  // Ctrl+D on Windows/Linux
      { keyCode: 68, meta: true, suppressOnInteractiveElement: true },  // Cmd+D on Mac
    ]
  }
}
```

The display component automatically picks the combo matching the current platform.

**Custom action keys** also support shortcuts — any key in the `actionsKeys` map that has a non-null `shortcut` is automatically registered as a peripheral. No changes to the reader components are needed.

#### Avoiding conflicts with built-in peripherals

The Readium Navigator reserves some key combinations internally. When choosing shortcuts, avoid:

| Reserved for | Keys to avoid |
|---|---|
| Print | keyCode 80 (P) with any Ctrl/Cmd/Shift/Alt combination |
| Save | keyCode 83 (S) with Ctrl or Meta |
| Select all | keyCode 65 (A) with Ctrl or Meta |
| Dev tools | keyCodes 73 (I), 74 (J), 85 (U), 67 (C), 65 (A), 84 (T) with Meta+Alt or Ctrl+Shift; also Shift+Alt+C and F12 |
| Navigation | Space (32), arrow keys (37–40), PgUp (33), PgDn (34), Home (36), End (35) |

## Docking

Docking is partly similar to actions in the sense it has its own special docking actions you can configure: display order, collapsibility and visibility.

See the [dedicated Docking doc](./Docking.md) for more details.

## Settings

Settings can be set and or nested in a specific order for both reflowable and Fixed-Layout EPUB. Some settings’ values can also be customized.

See [Settings doc](./Settings.md) for more details.

## Content Protection

Contents can be protected in several ways, including:

- disabling drag and drop
- disabling right click
- disabling save
- disabling print
- etc. 

See [Protection doc](./Protection.md) for more details.
