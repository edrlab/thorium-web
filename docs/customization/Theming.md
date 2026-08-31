# Theming

The `theming` property is responsible for the look and feel of the app, as it allows to specify a large amount of properties:

- breakpoints;
- layout UI, defaults and constraints;
- header’s back link;
- progression;
- arrows and icons; 
- themes.

## Breakpoints

Object `breakpoints` can be used to customize the breakpoint thresholds used throughout the UI. It is taking inspiration from [Material Design’s Window-size classes](https://m3.material.io/foundations/layout/applying-layout/window-size-classes). 

The property is in enum `ThBreakpoints` and the value a `number` (in `px`). This value represents the `max-width` for each breakpoint. 

If the value is set to `null` then the breakpoint is simply ignored and the next one (if any) will be used to construct a range.

For instance:

```
theming: {
  ...
  breakpoints: {
    [ThBreakpoints.compact]: 600,
    [ThBreakpoints.medium]: 840, 
    [ThBreakpoints.expanded]: null,
    [ThBreakpoints.large]: 1600,
    [ThBreakpoints.xLarge]: null
  }
}
```

Here we nullify the `expanded` breakpoint, which means it won’t be used. We will directly switch from `medium` to `large`. 

Note that applying a number to `xLarge` will effectively constrain the range to this max value. In other words, if your screen/window is larger than this value, then all breakpoints will be false. This is why it will almost always be `null`.

### Window breakpoint vs. container breakpoint

The same `ThBreakpoints` thresholds are evaluated in two distinct contexts and exposed separately in Redux state:

- **`breakpoint`** — resolved against the **viewport (window) width** via CSS media queries. Used for layout decisions that depend on the overall screen size.
- **`containerBreakpoint`** — resolved against the **reader container’s width** via a ResizeObserver. This is the equivalent of a CSS container query: if the reader is embedded in a panel or a smaller layout, its container breakpoint may differ from the window breakpoint.

Most UI components — collapsibility (breakpoint mode), running head format, footer display, paginated arrows — consume `containerBreakpoint` rather than `breakpoint`, so that they respond to the space actually available to the reader, not to the full viewport.

## Layout

Object `layout` allows to configure:

- `ui` for the layout of reflowable (scroll) and Fixed-Layout EPUBs;
- the border `radius` of button icons and sheets/containers (in `px`);
- the `spacing` of components (in `px`) when applicable e.g. padding and spacing of sheets/containers;
- `defaults` for:
  - `dockingWidth` or the size of dock panels by default – accepts a `ThDockingSizeValue`: a plain `number` (`px`), a unitless string (percentage), or a string with an explicit CSS unit (`px`, `%`, `em`, `rem`, `vh`, `vw`);
  - `scrim` or the CSS-valid string value for the bottom sheet’s underlay `background` – is overridable in each action’s `snapped` preference.
- `constraints` for some components:
  - the `max-width` of the bottom sheet component – is overridable in each action’s `snapped` preference;
  - the `max-width` of the popover sheet component.

For instance: 

```
theming: {
  ...
  layout: {
    ui: {
      reflow: ThLayoutUI.layered,
      fxl: ThLayoutUI.layered
    },
    radius: 0,
    spacing: 20,
    defaults: {
      dockingWidth: 300,
      scrim: "rgba(0, 0, 0, 0.2)"
    },
    constraints: {
      [ThSheetTypes.bottomSheet]: 600,
      [ThSheetTypes.popover]: 400
    }
  }
}
```
This means:

- reflowable EPUBs will use `stacked` layout for paginated contents – top bar, contents, and bottom bar are stacked on top of one another –, and `layered` for scrolled contents – contents occupy the full size of the viewport, nav bars are layered on top of it;
- Fixed-Layout EPUBs will use `layered` layout;
- your actions’ triggers and containers won’t have any border radius;
- they’ll use `20px` as a reference for padding and their sections’ margins;
- the default for the docking width is `300px`;
- the default scrim is color black with `20%` alpha;
- the bottom sheets are constrained to `600px`, unless overridden for an action;
- the popover sheets are constrained to `400px`.

## Header

The `header` preference allows you to configure the header of the reader. It accepts the following properties:

- `backLink`: The back link configuration
- `runningHead`: The running head format

### BackLink

The `backLink` preference allows you to configure the back button in the header. It accepts the following properties:

- `href`: (string) The URL to navigate to when the back button is clicked
- `visibility`: Visibility of the back button. If `always`, the back button will be always visible. If `partially`, the back button will be hidden in immersive mode. It is `partially` by default.
- `variant?`: Variant for the back link. Can be one of enum `ThBackLinkVariant`:
  - `arrow`: Shows an arrow icon (the default if `undefined`)
  - `home`: Shows a home icon
  - `library`: Shows a library/books icon
  - `custom`: Use with `content` to provide a custom icon
- `content?`: Optional custom content for the back button when `variant` is set to `custom`. Can be either:
  - An image with `{ type: "img"; src: string; alt?: string }`
  - An SVG with `{ type: "svg"; content: string }` with the `content` string being the raw inline SVG markup

For example:

```typescript
theming: {
  ...
  header: {
    backLink: {
      href: "/library",
      variant: ThBackLinkVariant.custom,
      visibility: "always",
      content: {
        type: "img",
        src: "/path/to/custom-icon.png",
        alt: "Back to Library"
      }
    }
  }
}
```

Or for a simple home button:

```typescript
theming: {
  ...
  header: {
    backLink: {
      href: "/",
      variant: ThBackLinkVariant.home
    }
  }
}
```

If `backLink` is `undefined` or `null`, then the back button will not be rendered.

### Running Head

The `runningHead` preference allows you to configure the running head format in the header. It accepts the following properties:

- `format`: Format of the running head, with properties for both reflowable and fixed-layout EPUBs:
  - `reflow`: Configuration for reflowable EPUBs
  - `fxl`: Configuration for Fixed-Layout EPUBs

Both `reflow` and `fxl` share the same structure:
- `default`: Default format configuration
  - `variants`: The format variant to use (e.g., `ThRunningHeadFormat.chapter` or `ThRunningHeadFormat.title`)
  - `displayInImmersive`: Whether to show in immersive mode (default: `true`)
  - `displayInFullscreen`: Whether to show in fullscreen mode (default: `false` for reflow, `true` for fxl)
- `breakpoints` (optional): Breakpoint-specific configurations
  - `[breakpoint]`: Breakpoint name (e.g., `ThBreakpoints.compact`)
    - `variants`: Format variant for this breakpoint
    - `displayInImmersive`: Whether to show in immersive mode for this breakpoint
    - `displayInFullscreen`: Whether to show in fullscreen mode for this breakpoint

Available `ThRunningHeadFormat` variants:
- `title`: Displays the publication title
- `chapter`: Displays the current chapter/section title
- `none`: Hides the running head display

Example configuration:

```typescript
theming: {
  header: {
    runningHead: {
      format: {
        reflow: {
          default: {
            variants: ThRunningHeadFormat.chapter,
            displayInImmersive: true,
            displayInFullscreen: false
          },
          breakpoints: {
            [ThBreakpoints.compact]: {
              variants: ThRunningHeadFormat.chapter,
              displayInImmersive: false
            }
          }
        },
        fxl: {
          default: {
            variants: ThRunningHeadFormat.title,
            displayInFullscreen: true
          }
        }
      }
    }
  }
}
```

## Progression

The `progression` preference allows you to configure the progression display format. It accepts the following properties:

- `format`: Format of the progression display, with properties for both reflowable and fixed-layout EPUBs:
  - `reflow`: Configuration for reflowable EPUBs
  - `fxl`: Configuration for Fixed-Layout EPUBs

Both `reflow` and `fxl` share the same structure:
- `default`: Default format configuration
  - `variants`: The format variant(s) to use (e.g., `ThProgressionFormat.positionsPercentOfTotal` or an array of formats)
  - `displayInImmersive`: Whether to show in immersive mode
  - `displayInFullscreen`: Whether to show in fullscreen mode
- `breakpoints` (optional): Breakpoint-specific configurations
  - `[breakpoint]`: Breakpoint name (e.g., `ThBreakpoints.compact`)
    - `variants`: Format variant(s) for this breakpoint
    - `displayInImmersive`: Whether to show in immersive mode for this breakpoint
    - `displayInFullscreen`: Whether to show in fullscreen mode for this breakpoint

Available `ThProgressionFormat` variants:
- `positionsPercentOfTotal`: "x-y of z (%)" (e.g. "25 of 50 (50%)")
- `positionsOfTotal`: "x-y of z" (e.g. "10-12 of 50")
- `positions`: "x-y" (e.g. "10-12")
- `overallProgression`: "x%" (e.g. "25%")
- `positionsLeft`: "x left in chapter" (e.g. "5 left in Chapter 1")
- `readingOrderIndex`: "x of y" (e.g. "1 of 5")
- `resourceProgression`: "x%" (e.g. "75%")
- `progressionOfResource`: "x% of y" (e.g. "75% of Chapter 1")
- `none`: Hides the progression display

Example configuration:

```typescript
theming: {
  progression: {
    format: {
      reflow: {
        default: {
          variants: [
            ThProgressionFormat.positionsPercentOfTotal,
            ThProgressionFormat.progressionOfResource
          ],
          displayInImmersive: true,
          displayInFullscreen: false
        },
        breakpoints: {
          [ThBreakpoints.compact]: {
            variants: [
              ThProgressionFormat.positionsOfTotal,
              ThProgressionFormat.resourceProgression
            ],
            displayInImmersive: false
          }
        }
      },
      fxl: {
        default: {
          variants: [
            ThProgressionFormat.positionsOfTotal,
            ThProgressionFormat.overallProgression
          ],
          displayInFullscreen: true
        }
      }
    }
  }
}
```

## Arrows and icons

Object `arrow` allows to configure the `size` and `offset` (in `px`), as well as the `tooltipDelay` (in `ms`), of the left and right `arrow` used to progress through paged resources.

Object `icon` allows to configure the `size` and `tooltipOffset` (in `px`), as well as the `tooltipDelay` (in `ms`), of icon buttons throughout the UI.

For instance:

```
theming: {
  ...
  icon: {
    size: 24,
    tooltipOffset: 10,
    tooltipDelay: 500
  }
}
```

Will make the icons 24-pixel wide and tall, their tooltip will be placed 10 pixels from their reference, and their delay will be 500ms.

## Themes

Object `themes` allows to customize the themes used and provided to users in Settings. 

As a matter of fact, this user setting is created dynamically from these preferences.

> [!WARNING] 
> **Although not recommended**, this means creating a theme took 4 steps if you were forking the project.

- add it to the `ThThemeKeys` enum;
- add its display string to `settings.themes` in [resources/locales](../../resources/locales/en.json);
- add it to `reflowOrder` and/or `fxlOrder`;
- add and configure them in `themes.keys`.

Your custom theme was then available without having to create or modify any component.

TBD: document new way of customizing theme keys.

### Display Order

You can set the display order of themes for formats/renditions the Reader supports:

- `reflowOrder` for reflowable EPUB;
- `fxlOrder` for Fixed-Layout EPUB.

Note value `"auto"` is a special case that maps the theme to the OS’ preference (light or dark), it’s not a theme *per se.* It is **required** `systemThemes` is defined for it to work properly.

For instance, to provide light and dark mode (and the `auto` option mentioned above) for Fixed-Layout EPUB:

```
theming: {
  theme: {
    ...
    fxlOrder: [
      "auto",
      ThThemeKeys.light,
      ThThemeKeys.dark
    ],
    systemThemes: {
      light: ThThemeKeys.light,
      dark: ThThemeKeys.dark
    }
  }
}
```

### System Themes

If you want to provide an `auto` theme that maps to the OS’ preference (light or dark), you need to define `systemThemes` in your preferences.

For instance, to provide light and dark mode (and the `auto` option mentioned above) for Fixed-Layout EPUB:
```
theming: {
  theme: {
   ...
    fxlOrder: [
      "auto",
      ThThemeKeys.light,
      ThThemeKeys.dark
    ],
    systemThemes: {
      light: ThThemeKeys.light,
      dark: ThThemeKeys.dark
    }
  }
}
```

If you do not, the `auto` theme will not be rendered. In case it was previously selected, it will be set to the first theme in the `fxlOrder` array – excluding value `auto`.

### Keys and Tokens

The `keys` object contains the themes (key of `ThThemeKeys` enum as a property) and their tokens, whose value is a CSS-valid string:

- `background`: the color of the background
- `text`: the color of the text
- `link`: the color of links
- `visited`: the color of visited links
- `subdue`: the color of subdued elements such as borders
- `disable`: the color on `:disabled`
- `hover`: the color of the background on `:hover`
- `onHover`: the color of the text on `:hover`
- `select`: the color of the background on `::selection`
- `onSelect`: the color of the text on `::selection`
- `focus`: the color of the outline on `:focus-visible`
- `elevate`: the drop shadow of containers
- `immerse`: the opacity of immersive mode (value in the range `[0...1]` as a string)