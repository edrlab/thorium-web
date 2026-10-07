# Using the Epub package

The Epub package provides with a ready-to-use EPUB reader React component with everything built-in: customizable actions and settings, a redux store and its reducers, custom hooks, and a preferences provider.

It also provides with its components to build your owns in a consistent way, and make them registrable through its plugins system.

> [!Note]
> Thorium Web’s packages are still a work in progress, and will be improved and extended in the future. Any help is appreciated if you’d like a component or a feature, or simply make it easier to use, and want to help.

## Installation

Thorium Web relies on peer dependencies to work. You must install them manually.

```bash
npm install @edrlab/thorium-web @readium/css @readium/navigator @readium/navigator-html-injectables @readium/shared react-redux @reduxjs/toolkit i18next i18next-browser-languagedetector i18next-http-backend motion react-aria react-aria-components react-stately react-modal-sheet react-resizable-panels 
```

## Reader Component

The Reader Component is the main component of this package. It is a React component that can be used to render an EPUB file, has state management built-in through Redux, and prefixed `thorium_web` classNames that you can target to style it.

> [!IMPORTANT]
> Theming initialization (breakpoints, theme, media queries) has been moved out of the Reader component. You must now initialize theming manually using the `useTheming` hook as shown in the example below.

You can use it like this:

```jsx
import { 
  usePublication, 
  StatefulReader, 
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
} from "@edrlab/thorium-web/epub";
import { useTheming } from "@edrlab/thorium-web/core/preferences";
import { propsToCSSVars, prefixString } from "@edrlab/thorium-web/core/helpers";

const ReaderWithTheming = ({ publication, localDataKey }) => {
  const { preferences } = usePreferences();
  const themeObject = useAppSelector(state => state.theming.theme);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const theme = isFXL ? themeObject.fxl : themeObject.reflow;
  const dispatch = useAppDispatch();

  // Init theming (breakpoints, theme, media queries…)
  // setContainerRef must be attached to the reader's root container so that
  // container-width breakpoints are resolved independently of the viewport.
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

  return <StatefulReader ref={ setContainerRef } publication={ publication } localDataKey={ localDataKey } />;
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
          <ReaderWithTheming 
            publication={ publication } 
            localDataKey={ localDataKey } 
          />
        </ThI18nProvider>
      </ThPreferencesProvider>
    </ThStoreProvider>
  );
};
```

The Reader expects the following props:

- `publication`: the Publication object representing the EPUB file.
- `localDataKey`: a key for storing reader position and settings locally.
- `plugins` (optional): the components (actions, settings) to use in the reader. More below.
- `positionStorage` (optional): custom storage interface for position data.

You can take a look how the NextJS app is currently doing in [the Read Page](../../../src/app/read/[identifier]/page.tsx).

> [!IMPORTANT]
> Due to the complexity the reader has to handle, it does not currently accept `children`. This also explains why it requires dependencies (Redux, Preferences) and is not directly stylable. We are hopeful these limitations may be removed in the future but it will require some additional effort. If you have any ideas, please let us know. In the meantime, you can build your own reader component if you want to use the other components exported from this package.

It is critical you wrap this component in a `<ThStoreProvider>`, a `<ThPreferencesProvider>`, and a `<ThI18nProvider>`, in this order, for it to work properly.

> [!CAUTION]
> When using this `<StatefulReader>` and all other components from `@edrlab/thorium-web/epub`, you must use the `<ThStoreProvider>`, `<ThPreferencesProvider>`, and `<ThI18nProvider>` from this same path, and not their specific ones.
> If you do not, they will not work as expected as your app will use specific providers that are not shared with the Stateful Components.

### ThStoreProvider

The `<ThStoreProvider>` is a Redux store provider that accepts two optional props:

- `storageKey`: the key to use to store the states in local storage. Defaults to `thorium-web-state`.
- `store`: your own Redux store if you need to modify or extend the default one.

### ThPreferencesProvider

The `<ThPreferencesProvider>` is a context provider used to configure all the reader’s components: the actions to display and their configuration, the settings to display and their order, the size of icons and navigation arrows, the themes exposed to users, etc.

It accepts two optional props:

- `adapter`: your own adapter if you need to modify or extend the default one.
- `devMode`: boolean to enable dev mode – this will turn every content protection setting to `false`.
- `initialPreferences`: your own preferences if you need to modify or extend the default ones – note this will override the default preferences and the dev mode

### StatefulPreferencesProvider

The `<StatefulPreferencesProvider>` is a Preferences Provider embedding a Redux Adapter. It is using a `PreferencesSlice` to handle the preferences through Redux states and persist their values. 

This can come in handy if you want to update the preferences through UI Components and keep the values persisted across sessions.

### ThI18nProvider

The `<ThI18nProvider>` is a context provider used to configure the i18next instance.

It accepts the same props as `InitOptions` from `i18next`.

### Styling

The component includes an optional default stylesheet that you can import:

```typescript
import "@edrlab/thorium-web/epub/styles";
```

If you need to customize the styling, you can provide your own CSS instead.

## Customizing the Reader

You can customize the Reader in multiple ways, by modifying the preferences for example, but also pick and build your own components and add them to the Plugins Registry.

### Building your own components

You can build your own components with the components exported from this package.

For instance, if you wanted to build a switch for paginated/scroll, you could do something like this:

```tsx
import { ThLayoutOptions } from "@edrlab/thorium-web/core/preferences";
import { 
  StatefulSwitch,
  useEpubNavigator,
  useAppDispatch,
  useAppSelector,
  setScroll
} from "@edrlab/thorium-web/epub";

const MyScrollSwitch = () => {
  const isScroll = useAppSelector(state => state.settings.scroll);

  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useEpubNavigator();

  const updatePreference = useCallback(async (value: string) => { 
    const derivedValue = value === ThLayoutOptions.scroll;
    await submitPreferences({ scroll: derivedValue });
    dispatch(setScroll(getSetting("scroll")));
  }, [submitPreferences, getSetting, dispatch]);

  return (
    <StatefulSwitch
      label="Enable scroll"
      onChange={ async (value: string) => await updatePreference(value) }
      isSelected={ isScroll }
    />
  );
}
```

> [!IMPORTANT]
> When building stateful components, you must import from `@edrlab/thorium-web/epub` so that it will use the same store, preferences, and hooks as the other components.

You now have a switch that is already styled and ready to use. The next step is registering it through Plugins.

### The Plugins Registry

The Plugins Registry is a provider that holds all the plugins that are registered in the app. It is currently used by the Reader Component to render the actions and settings components.

By default, it comes with a set of plugins that are already configured to work with the Reader Component. If the `plugins` prop (array of `ThPlugin`) is provided, it will override this default plugin of core components.

A plugin is an object that contains the following properties:

- `id`: a unique identifier for the plugin.
- `name`: the name of the plugin.
- `description`: a description of the plugin.
- `version`: the version of the plugin.
- `components`: an object that contains the components to register.

The `components` object contains the following properties:

- `actions`: an object that contains the actions to register.
- `settings`: an object that contains the settings to register.

An action is an object that contains the following properties:

- `Trigger`: the component that will trigger the action.
- `Target` (optional): the component that will be displayed when the action is triggered.

Some actions may not have a target e.g. fullscreen, bookmark, etc.

A setting is an object that contains the following properties:

- `Component`: the component that will be displayed when the settings target is rendered.
- `type` (optional): the type of the setting. Can be `undefined | "text" | "spacing"`

> [!NOTE]
> The `type` property is important for components that can be displayed in the text and spacing wrappers, which allows for displaying them in a subpanel of the settings menu. See the documentation for [these advanced components](../../customization/Settings.md#advanced-components) for more information.

Let’s imagine you want to extend the default plugins:

```tsx
import { 
  ThPlugin, 
  createDefaultPlugin, 
  StatefulReader, 
  StatefulReaderProps, 
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
} from "@edrlab/thorium-web/epub";
import { useTheming } from "@edrlab/thorium-web/core/preferences";
import { propsToCSSVars, prefixString } from "@edrlab/thorium-web/core/helpers";
import { MyActionTrigger } from "./Actions/MyActionTrigger";
import { MyActionContainer } from "./Actions/MyActionContainer";
import { MyScrollSwitch } from "./Settings/MyScrollSwitch";

const ReaderWithCustomPlugins = ({
  publication,
  localDataKey,
  plugins
}: StatefulReaderProps) => {
  
  const { preferences } = usePreferences();
  const themeObject = useAppSelector(state => state.theming.theme);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const theme = isFXL ? themeObject.fxl : themeObject.reflow;
  const dispatch = useAppDispatch();

  // Init theming (breakpoints, theme, media queries…)
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
    <StatefulReader 
      ref={ setContainerRef }
      publication={ publication } 
      localDataKey={ localDataKey } 
      plugins={ plugins }
    />
  )
}

export const MyCustomReader = ({
  publication,
  localDataKey
}: Omit<StatefulReaderProps, "plugins"> ) => {
    
  // Instantiate the default plugin
  const defaultPlugin: ThPlugin = createDefaultPlugin();

  // Add your custom components to the default ones
  const customPlugins: ThPlugin[] = [ defaultPlugin, {
    id: "custom",
    name: "Custom Components",
    description: "Custom components for my Reader",
    version: "1.0.0",
    components: {
      actions: {
        "my-custom-action-key": {
          Trigger: MyActionTrigger,
          Target: MyActionContainer
        }
      },
      settings: {
        "my-scroll-switch-key": {
          Component: MyScrollSwitch
        }
      }
    }
  }];
    
  return (
    <ReaderWithCustomPlugins 
      publication={ publication } 
      localDataKey={ localDataKey } 
      plugins={ customPlugins }
    />
  )
}
```

Then in your app:

```tsx
import { MyCustomReader } from "./MyCustomReader";
import { usePublication } from "@edrlab/thorium-web/epub";

const App = ({ manifestUrl }) => {
  const { publication, localDataKey, isLoading, error } = usePublication({
    url: manifestUrl,
    onError: (error) => console.error("Publication loading error:", error)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <MyCustomReader 
      publication={ publication } 
      localDataKey={ localDataKey }
      plugins={ customPlugins }
    />
  );
};
```

Of course you could also cherry-pick from the default components and only add the ones you need instead of using the `createDefaultPlugin` helper.

The `<StatefulReader>` Component will then register these components but will not automatically use them in its interface. For this to happen, you need to configure preferences.

### Customizing Preferences

`@edrlab/thorium-web/core/preferences` provides with default preferences, as well as default `enums`, and a helper to create them.

> [!NOTE]
> Preferences are extensively documented in the [Customization Guide](../../customization/Customization.md).
> [Handling Preferences](../../customization/HandlingPreferences.md) can serve as a good starting point to understand how to create your own.

To add your custom components to the Reader Component, you need to configure the preferences.

```tsx
import { createPreferences, ThPreferences } from "@edrlab/thorium-web/core/preferences";

// Define your custom keys
type YourCustomKeys = {
  action: "custom-action-key" | ThActionsKeys;
} & CustomizableKeys;

// Create your custom preferences
const myPreferences: ThPreferences = createPreferences<YourCustomKeys>({
  //... other preferences
  actions: {
    //... other props
    reflowOrder: [
      //... other actions
      "my-custom-action-key"
    ],
    keys: {
      //... other keys
      "my-custom-action-key": {
        visibility: "collapse", // Will be displayed in the overflow menu
        shortcut: null,
        // ... other action settings
      }
    }
  },
  settings: {
    reflowOrder: [
      //... other settings
      "my-scroll-switch-key"
    ]
  }
});
```

> [!NOTE]
> A console warning will be triggered if you try to use a component that has not been registered by the `<StatefulReader>`.

Once everything is set up, your scroll switch should be displayed in the settings menu.

## Related Documentation

- [Core Package](../Core/ReadMe.md)