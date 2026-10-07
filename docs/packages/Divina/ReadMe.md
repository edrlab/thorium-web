# Using the Divina package

The Divina package provides a ready-to-use reader React component for [Divina](https://readium.org/webpub-manifest/profiles/divina) publications – comics, manga, webtoons, and other image-based publications – with everything built-in: customizable actions and settings, a Redux store and its reducers, custom hooks, and a preferences provider.

It shares its preferences system, store, and most of its components with the EPUB reader, so everything documented in the [Epub package](../Epub/ReadMe.md) and the [Customization Guide](../../customization/Customization.md) applies, unless stated otherwise below.

> [!Note]
> Thorium Web’s packages are still a work in progress, and will be improved and extended in the future. Any help is appreciated if you’d like a component or a feature, or simply make it easier to use, and want to help.

## Installation

Thorium Web relies on peer dependencies to work. You must install them manually.

```bash
npm install @edrlab/thorium-web @readium/css @readium/navigator @readium/navigator-html-injectables @readium/shared react-redux @reduxjs/toolkit i18next i18next-browser-languagedetector i18next-http-backend motion react-aria react-aria-components react-stately react-modal-sheet react-resizable-panels
```

> [!IMPORTANT]
> Divina requires `@readium/navigator` `^2.11.1`, `@readium/shared` `^2.6.0`, and `@readium/navigator-html-injectables` `^2.8.4`.

## Reader Component

### With the Reader package

The simplest way to render a Divina publication is the `StatefulReaderWrapper` from the [Reader package](../Reader/ReadMe.md). `usePublication` detects the `"divina"` profile from the manifest’s `conformsTo`, and the wrapper renders the Divina reader, initializes theming, and mounts `ThPreferencesProvider` and `ThI18nProvider` for you.

```tsx
import { StatefulReaderWrapper, ThStoreProvider, usePublication } from "@edrlab/thorium-web/reader";

const App = ({ manifestUrl }) => {
  const { publication, profile, localDataKey, isLoading, error } = usePublication({
    url: manifestUrl,
    onError: (error) => console.error("Publication loading error:", error)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ThStoreProvider>
      <StatefulReaderWrapper
        profile={ profile }
        publication={ publication }
        localDataKey={ localDataKey }
      />
    </ThStoreProvider>
  );
};
```

### Standalone

`StatefulDivinaReader` is the main component of this package. Like the EPUB `StatefulReader`, you must wrap it in a `<ThStoreProvider>`, a `<ThPreferencesProvider>`, and a `<ThI18nProvider>`, in this order, and initialize theming yourself with `useTheming`.

Divina shares the Fixed-Layout theme slot, so the theme is read from `themeObject.fxl`, and the themes displayed to users come from `theming.themes.fxlOrder`.

```tsx
import {
  usePublication,
  usePreferences,
  StatefulDivinaReader,
  ThStoreProvider,
  ThPreferencesProvider,
  ThI18nProvider,
  useAppSelector,
  useAppDispatch,
  setBreakpoint,
  setContainerBreakpoint,
  setColorScheme,
  setContrast,
  setForcedColors,
  setMonochrome,
  setReducedMotion,
  setReducedTransparency
} from "@edrlab/thorium-web/divina";
import { useTheming } from "@edrlab/thorium-web/core/preferences";
import { propsToCSSVars, prefixString } from "@edrlab/thorium-web/core/helpers";

const DivinaWithTheming = ({ publication, localDataKey }) => {
  const { preferences } = usePreferences();
  const theme = useAppSelector(state => state.theming.theme.fxl);
  const dispatch = useAppDispatch();

  const { setContainerRef } = useTheming({
    theme: theme,
    themeKeys: preferences.theming.themes.keys,
    systemKeys: preferences.theming.themes.systemThemes,
    breakpointsMap: preferences.theming.breakpoints,
    initProps: {
      ...propsToCSSVars(preferences.theming.arrow, { prefix: prefixString("arrow") }),
      ...propsToCSSVars(preferences.theming.icon, { prefix: prefixString("icon") }),
      ...propsToCSSVars(preferences.theming.layout, {
        prefix: prefixString("layout"),
        exclude: ["ui"]
      })
    },
    onBreakpointChange: (breakpoint) => dispatch(setBreakpoint(breakpoint)),
    onContainerBreakpointChange: (breakpoint) => dispatch(setContainerBreakpoint(breakpoint)),
    onColorSchemeChange: (colorScheme) => dispatch(setColorScheme(colorScheme)),
    onContrastChange: (contrast) => dispatch(setContrast(contrast)),
    onForcedColorsChange: (forcedColors) => dispatch(setForcedColors(forcedColors)),
    onMonochromeChange: (isMonochrome) => dispatch(setMonochrome(isMonochrome)),
    onReducedMotionChange: (reducedMotion) => dispatch(setReducedMotion(reducedMotion)),
    onReducedTransparencyChange: (reducedTransparency) => dispatch(setReducedTransparency(reducedTransparency))
  });

  return (
    <StatefulDivinaReader
      publication={ publication }
      localDataKey={ localDataKey }
      containerRefSetter={ setContainerRef }
    />
  );
};

const App = ({ manifestUrl }) => {
  const { publication, localDataKey, isLoading, error } = usePublication({
    url: manifestUrl,
    onError: (error) => console.error("Publication loading error:", error)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ThStoreProvider>
      <ThPreferencesProvider>
        <ThI18nProvider>
          <DivinaWithTheming
            publication={ publication }
            localDataKey={ localDataKey }
          />
        </ThI18nProvider>
      </ThPreferencesProvider>
    </ThStoreProvider>
  );
};
```

The `StatefulDivinaReader` accepts the same props as the other visual readers:

- `publication`: `Publication` — the Readium Publication object.
- `localDataKey`: `string | null` — unique key for storing local reading data (position, etc.).
- `plugins`: `ThPlugin[]` (optional) — override the default plugin set.
- `positionStorage`: `PositionStorage` (optional) — custom interface for persisting the reading position.
- `containerRefSetter`: `(el: Element | null) => void` (optional) — attach the reader’s root container, e.g. `setContainerRef` from `useTheming`, so that container breakpoints are resolved against it.

> [!CAUTION]
> When using `<StatefulDivinaReader>` and all other components from `@edrlab/thorium-web/divina`, you must use the `<ThStoreProvider>`, `<ThPreferencesProvider>`, and `<ThI18nProvider>` from this same path. Using providers from a different path will result in a separate context that the Stateful Components cannot access.

### Styling

The component includes an optional default stylesheet that you can import:

```typescript
import "@edrlab/thorium-web/divina/styles";
```

The reader uses the same classNames as the EPUB reader, and always applies `.thorium_web_isFXL` since Divina resources are pages.

## Reading Experience

### Layout

Divina publications can be read paged or scrolled. Users switch between both with the shared `ThSettingsKeys.layout` setting, which maps to the navigator’s `scrolled` preference.

Publications whose manifest declares `layout: "scrolled"` (e.g. webtoons) are natively scrolled: the navigator forces scrolled mode and the layout setting is disabled. This is exposed as `isManifestScrolled` in the [publication store](../Core/API/Store.md#publication-reducer).

Some settings only apply to one of these modes, and are disabled in the other one:

- Spreads (two pages side by side) apply to paged mode only.
- Strip width applies to scrolled mode only.

### Navigation

- Pointer: tapping or clicking the left or right quarter of the page turns the page, the middle zone toggles immersive mode.
- Keyboard: arrow keys, Space, Page Up/Down, Home and End navigate the publication. In scrolled mode, arrow keys scroll by a line while Space and Page Up/Down scroll by a viewport.
- Paged mode enters immersive mode on page turns, and scrolled mode follows the [scroll affordances](../../customization/Customization.md#scroll) preferences.
- Paginated arrows are configured with `affordances.paginated.divina`. See [Pagination](../../customization/Customization.md#pagination).

### Zoom

In paged mode, users can zoom with `Ctrl`/`Cmd` + `+`, `-`, and `0` (reset), as well as with bare `+`, `-`, and `0` keys. Zoom is not available in scrolled mode.

### Positions

Divina has one position per image in the reading order. When the manifest does not provide a positions list, `usePublication` synthesizes it.

Jumping to a position never animates, since animating across the publication would load every page in between.

## Customizing the Reader

### Default Actions and Settings

Divina uses its own display orders in preferences:

- `actions.divinaOrder`: defaults to `settings`, `toc`, `fullscreen`, and `jumpToPosition`;
- `settings.divinaOrder`: defaults to `theme`, `layout`, `divinaSpreads`, `divinaStripWidth`, and `divinaQuality`.

Both are **required** in `ThPreferences`. Text and spacing settings rely on ReadiumCSS and do not apply to Divina.

The `divinaQuality` setting also has a `choices` key, which restricts the image qualities offered to users, for instance if your platform does not serve `max` variants:

```tsx
import { DivinaQuality } from "@readium/navigator";
import { createPreferences, ThSettingsKeys } from "@edrlab/thorium-web/core/preferences";

const myPreferences = createPreferences({
  // ... other preferences
  settings: {
    // ... other props
    keys: {
      // ... other keys
      [ThSettingsKeys.divinaQuality]: {
        choices: [DivinaQuality.auto, DivinaQuality.low, DivinaQuality.high]
      }
    }
  }
});
```

Like the other profiles, Divina has its own entries in theming:

- `theming.layout.ui.divina`;
- `theming.header.runningHead.format.divina`;
- `theming.progression.format.divina`.

See the [Customization Guide](../../customization/Customization.md) for more details.

### The Plugins Registry

The Plugins Registry works the same way as in the EPUB package. Refer to the [EPUB Plugins documentation](../Epub/ReadMe.md#the-plugins-registry) for a full explanation.

`createDefaultPlugin` registers the Divina settings components alongside the other ones. When using `StatefulReaderWrapper`, you can provide Divina-specific plugins through the `divina` factory of its `plugins` prop.

### Building your own components

Settings components use `useDivinaNavigator` to submit preferences, then sync the effective value to the `divinaSettings` store slice. For instance, a switch for spreads:

```tsx
import { useCallback } from "react";
import {
  StatefulSwitch,
  useDivinaNavigator,
  useAppDispatch,
  useAppSelector,
  setDivinaSpreads
} from "@edrlab/thorium-web/divina";

const MySpreadsSwitch = () => {
  const spreads = useAppSelector(state => state.divinaSettings.spreads);
  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useDivinaNavigator();

  const updatePreference = useCallback(async (value: boolean) => {
    await submitPreferences({ spreads: value });
    dispatch(setDivinaSpreads(getSetting("spreads")));
  }, [submitPreferences, getSetting, dispatch]);

  return (
    <StatefulSwitch
      label="Display two pages side-by-side"
      onChange={ updatePreference }
      isSelected={ spreads ?? true }
    />
  );
};
```

> [!IMPORTANT]
> When building stateful components, import from `@edrlab/thorium-web/divina` so they share the same store, preferences, and hooks as the other components.

## Related Documentation

- [Divina Settings API](./API/Settings.md)
- [Divina Navigator Hook](../Core/API/Hooks.md#divina-navigator-hook)
- [Reader Package](../Reader/ReadMe.md)
- [Epub Package](../Epub/ReadMe.md)
- [Core Package](../Core/ReadMe.md)
