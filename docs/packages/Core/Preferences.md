# Core Preferences

The Core package ships with a preferences management system containing a provider, helpers, hooks, and models (defaults and enums).

## Provider

The Core package exposes a context provider to wrap your application and provide the preferences to all components:

```tsx
import { ThStoreProvider } from "@edrlab/thorium-web/core/lib";
import { ThPreferencesProvider } from "@edrlab/thorium-web/core/preferences";

const App = () => {
  return (
    <ThStoreProvider>
      <ThPreferencesProvider 
        adapter={ yourAdapter }  // Optional: custom adapter for persistence
        devMode={ process.env.NODE_ENV === "development" }  // Optional: enable dev mode
        initialPreferences={ yourInitialPrefs }  // Optional: initial preferences
      >
        {/* Your application */}
      </ThPreferencesProvider>
    </ThStoreProvider>
  );
};
```

### Provider Props

- `adapter?`: Optional custom adapter for persisting preferences
- `devMode?`: Optional boolean to enable dev mode – this will turn every content protection setting to `false`
- `initialPreferences?`: Optional initial preferences object – note this will override the default preferences and the dev mode
- `children`: Your application components

> [!IMPORTANT]
> When using stateful components from `@edrlab/thorium-web/epub`, you must use the `<ThPreferencesProvider>` from that package, not from `@edrlab/thorium-web/core`. Otherwise, your app and components will use different preferences.

## Helpers

```tsx
import { 
  createPreferences, 
  defaultPreferences,
  ThPreferences 
} from "@edrlab/thorium-web/core/preferences";

// Define your custom keys
type YourCustomKeys = {
  action: "custom-action" | ThActionsKeys;
} & CustomizableKeys;

// To override default preferences, you can spread the default preferences
// and override the ones you want to change.
const myPreferences: ThPreferences = createPreferences<YourCustomKeys>({
  ...defaultPreferences,

  actions: {
    ...defaultPreferences.actions,
    
    reflowOrder: ["settings", "toc", "search", "custom-action"],
    keys: {
      ...defaultPreferences.actions.keys,

      "custom-action": {
        visibility: "collapse",
        shortcut: null
      }
    }
  }
});
```

This will create a new preferences object with the default preferences and the ones you want to change. You can then pass this object to the provider so that components can consume them:

```tsx
import { ThPreferencesProvider } from "@edrlab/thorium-web/core/preferences";
const App = () => {
  return (
      <ThPreferencesProvider initialPreferences={ myPreferences }>
        {/* Your application */}
      </ThPreferencesProvider>
  )
}
```

TBD. buildThemeObject

## Hooks

The Core package exposes several hooks specific to preferences management:

- `usePreferenceKeys`: returns the keys of the preferences’ object e.g. `actions.reflowOrder`;
- `usePreferences`: returns the preferences object and an update method;
- `useReadAlongPreferences`: returns the read-along preferences, or their defaults when they aren’t set;
- `useTheming`: sets up responsive breakpoints based on preferences, and accessibility hooks – this can then be stored in the `themeReducer` of `lib`.

For instance, if your component needs to access the preferences, you can use the `usePreferences` hook:

```tsx
import { usePreferences } from "@edrlab/thorium-web/core/preferences";
import { ThLayoutDirection } from "@edrlab/thorium-web/core/preferences/models/enums";

const MyPreferencesComponent = () => {
  const { preferences } = usePreferences<YourCustomKeys>();

  return (
    <div>
      <p>Preferences: { JSON.stringify(preferences) }</p>
    </div>
  );
};
```

If you need keys of the preferences’ object, you can use the `usePreferenceKeys` hook:

```tsx
import { usePreferenceKeys } from "@edrlab/thorium-web/core/preferences";
const MyPreferencesComponent = () => {
  const { reflowThemeKeys } = usePreferenceKeys();
  return (
    <div>
      <p>Themes available for reflow EPUB are: { JSON.stringify(keys) }</p>
    </div>
  );
};
```

The `useTheming` hook is typically used once, to set up responsive breakpoints based on preferences, and accessibility hooks (reduced motion, reduced transparency, monochrome, color scheme, contrast, and forced colors).

TBD.

> [!IMPORTANT]
> When using stateful components from `@edrlab/thorium-web/epub`, you must use the hooks from that package, not from `@edrlab/thorium-web/core`. Otherwise, your app and components will use different preferences.

## Models

The Core package exposes default `const`ants and `enum`s in case you want to use them in your own implementation of an app.

For instance, if you want to import the default `enum` for Actions’ keys, you can do so:

```tsx
import { ThActionsKeys } from "@edrlab/thorium-web/core/preferences";

const myEnum = {
  settings = ThActionsKeys.settings,
  myAction = "my-action-key"
}
```

Read-along has its own models:

- `ThReadAlongActionKeys`: the player’s actions (`volume`, `rate`, `sleepTimer`, `settings`);
- `ThReadAlongKeys`: its settings, including the `highlightGroup` and `highlightPresets` components;
- `ThReadAlongHighlightKeys` and `ThReadAlongHighlightPresetKeys`: the highlight group’s components and presets;
- `ThMiniPlayerTypes`: where the mini player shows (`bottomBar` or `bottomSheet`);
- `defaultReadAlongPreferences` and the default constants it is built from, e.g. `defaultReadAlongAction` or `defaultReadAlongHighlightPresets`.

Reader themes are typed with `ThReaderThemeTokens`, which extends the `ThemeTokens` shared with audio themes with the read-along highlight colors. See [Theming](../../customization/Theming.md#keys-and-tokens).

Default `const`ants provides default preferences for multiple components, such as settings e.g. line-heights, font-size, word-spacing, etc. They also list settings components for text and spacing subpanels, see [Settings document in Customization](../../customization/Settings.md#advanced-components) for more details.