# Using the Audio package

The Audio package provides a ready-to-use audio player React component with everything built-in: customizable actions and settings, a Redux store and its reducers, custom hooks, and a preferences provider.

It also provides its components so you can build your own in a consistent way, and make them registrable through the plugins system.

> [!Note]
> Thorium Web's packages are still a work in progress, and will be improved and extended in the future. Any help is appreciated if you'd like a component or a feature, or simply make it easier to use, and want to help.

## Installation

Thorium Web relies on peer dependencies to work. You must install them manually.

```bash
npm install @edrlab/thorium-web @readium/css @readium/navigator @readium/navigator-html-injectables @readium/shared react-redux @reduxjs/toolkit i18next i18next-browser-languagedetector i18next-http-backend motion react-aria react-aria-components react-stately react-modal-sheet react-resizable-panels
```

## Player Component

The `StatefulPlayer` is the main component of this package. It renders a full-featured audio player for a Readium `Publication`, with Redux state management built-in.

```tsx
import {
  StatefulPlayer,
  ThStoreProvider,
  ThAudioPreferencesProvider,
  ThI18nProvider,
  usePublication
} from "@edrlab/thorium-web/audio";

const App = ({ manifestUrl }) => {
  const { publication, localDataKey, isLoading, error } = usePublication({
    url: manifestUrl,
    onError: (error) => console.error("Publication loading error:", error)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ThStoreProvider>
      <ThAudioPreferencesProvider>
        <ThI18nProvider>
          <StatefulPlayer
            publication={ publication }
            localDataKey={ localDataKey }
            positionStorage={{
              get: () => getStoredPosition(localDataKey),
              set: (locator) => storePosition(localDataKey, locator)
            }}
          />
        </ThI18nProvider>
      </ThAudioPreferencesProvider>
    </ThStoreProvider>
  );
};
```

The `StatefulPlayer` accepts the following props:

- `publication`: `Publication` — the Readium Publication object.
- `localDataKey`: `string | null` — unique key for storing local reading data (position, etc.).
- `positionStorage`: `PositionStorage` (optional) — custom interface for persisting the playback position.
- `settingsStorage`: `SettingsStorage` (optional) — custom interface for persisting the publication’s settings, see [SettingsStorage Interface](../Reader/ReadMe.md#settingsstorage-interface).
- `plugins`: `ThPlugin[]` (optional) — override the default plugin set.
- `coverUrl`: `string` (optional) — explicit cover image URL (falls back to publication metadata).

> [!IMPORTANT]
> Due to the complexity the player has to handle, it does not currently accept `children`. You must wrap it in a `<ThStoreProvider>`, a `<ThAudioPreferencesProvider>`, and a `<ThI18nProvider>`, in that order.

> [!CAUTION]
> When using `<StatefulPlayer>` and all other components from `@edrlab/thorium-web/audio`, you must use the `<ThStoreProvider>`, `<ThAudioPreferencesProvider>`, and `<ThI18nProvider>` from this same path. Using providers from a different path will result in a separate context that the Stateful Components cannot access.

### ThAudioPreferencesProvider

The `<ThAudioPreferencesProvider>` configures the player's appearance and behaviour: the actions displayed in the primary and secondary zones, the settings exposed to users, theming, breakpoints, etc.

It accepts three optional props:

- `adapter`: your own `ThAudioPreferencesAdapter` if you need custom persistence logic.
- `initialPreferences`: your own `ThAudioPreferences` to override the defaults.
- `devMode`: boolean to enable dev mode — this disables all content protection settings.

### Styling

The component includes an optional default stylesheet that you can import:

```typescript
import "@edrlab/thorium-web/audio/styles";
```

## Customizing the Player

### Building your own components

All controls and settings components exported from this package can be used individually to build your own player layout.

For example, building a custom progress bar using `ThAudioProgress` from `@edrlab/thorium-web/core/components`:

```tsx
import { ThAudioProgress } from "@edrlab/thorium-web/core/components";
import {
  useAudioNavigator,
  useAppSelector,
  useAppDispatch,
  setCurrentTime
} from "@edrlab/thorium-web/audio";

const MyProgressBar = () => {
  const currentTime = useAppSelector(state => state.player.currentTime);
  const duration = useAppSelector(state => state.player.duration);
  const currentChapter = useAppSelector(state => state.player.currentChapter);
  const dispatch = useAppDispatch();
  const { seek } = useAudioNavigator();

  return (
    <ThAudioProgress
      currentTime={ currentTime }
      duration={ duration }
      currentChapter={ currentChapter }
      onSeek={ (time) => {
        seek(time);
        dispatch(setCurrentTime(time));
      }}
    />
  );
};
```

> [!IMPORTANT]
> When building stateful components, import from `@edrlab/thorium-web/audio` so they share the same store, preferences, and hooks as the other components.

### The Plugins Registry

The Plugins Registry works the same way as in the EPUB package. Refer to the [EPUB Plugins documentation](../Epub/ReadMe.md#the-plugins-registry) for a full explanation.

For audio, actions are split into two zones:

- **Primary** (`primary.displayOrder`): the media controls bar — volume and playback rate live here.
- **Secondary** (`secondary.displayOrder`): the collapsible header bar — supports visibility tokens (`collapse`).

### Customizing Preferences

Use `createAudioPreferences` from `@edrlab/thorium-web/audio` to create type-safe preferences:

```tsx
import { createAudioPreferences } from "@edrlab/thorium-web/audio";

const myPreferences = createAudioPreferences({
  // ... your audio preferences
});
```

> [!NOTE]
> `createAudioPreferences` validates your preferences at runtime and warns about unreachable slider presets and conflicting skip interval keys (`skipInterval` vs `skipBackwardInterval`/`skipForwardInterval`).

## Related Documentation

- [Audio Hooks API](./API/Hooks.md)
- [Audio Settings API](./API/Settings.md)
- [Audio Controls API](./API/Controls.md)
- [Core Package](../Core/ReadMe.md)
- [Reader Package](../Reader/ReadMe.md)
- [Epub Package](../Epub/ReadMe.md)
