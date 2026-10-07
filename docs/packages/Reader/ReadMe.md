# Using the Reader package

The Reader package provides a wrapper component that conditionally renders the appropriate reader based on the publication profile (EPUB, WebPub, or Audio).

It automatically selects between EPUB, WebPub, and Audio readers while handling theme management, Redux integration, and accessibility features.

> [!Note]
> Thorium Web's packages are still a work in progress, and will be improved and extended in the future. Any help is appreciated if you'd like a component or a feature, or simply make it easier to use, and want to help.

## Installation

Thorium Web relies on peer dependencies to work. You must install them manually.

```bash
npm install @edrlab/thorium-web @readium/css @readium/navigator @readium/navigator-html-injectables @readium/shared react-redux @reduxjs/toolkit i18next i18next-browser-languagedetector i18next-http-backend motion react-aria react-aria-components react-stately react-modal-sheet react-resizable-panels
```

## Reader Component

The Reader Component is the main component of this package. It automatically selects and renders the appropriate reader component based on the publication profile.

You can use it like this:

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
        positionStorage={{
          get: () => getStoredPosition(localDataKey),
          set: (locator) => storePosition(localDataKey, locator)
        }}
      />
    </ThStoreProvider>
  );
};
```

`StatefulReaderWrapper` manages `ThPreferencesProvider` (or `ThAudioPreferencesProvider` for audio) and `ThI18nProvider` internally. Do not add them as outer wrappers — only `ThStoreProvider` needs to wrap the component.

The Reader expects the following props:

- `profile`: `"epub" | "webPub" | "audio" | undefined | null` — the publication profile to determine which reader to render
- `publication`: `Publication` — the Readium Publication object
- `localDataKey`: `string | null` — a unique key for storing local reading data (bookmarks, positions, etc.)
- `positionStorage`: `PositionStorage` (optional) — an interface for persisting reading positions
- `plugins`: `ReaderPlugins` (optional) — per-profile plugin factories (see [Plugins](#plugins))
- `i18n`: `Partial<InitOptions>` (optional) — i18next initialization options forwarded to `ThI18nProvider`. Use this to add extra namespaces, change the backend load path, or pass any other i18next config (see [i18n configuration](#i18n-configuration))
- `preferences`: (optional) — profile-specific preferences to pass to the underlying provider. The shape depends on `profile`:
  - For `"audio"`: `{ initialPreferences?: ThAudioPreferences; adapter?: ThAudioPreferencesAdapter }`
  - For `"epub"` / `"webPub"`: `{ initialPreferences?: ThPreferences; adapter?: ThPreferencesAdapter }`

```tsx
import { createAudioPreferences } from "@edrlab/thorium-web/audio";
import { createPreferences } from "@edrlab/thorium-web/reader";

// Audio
<StatefulReaderWrapper
  profile="audio"
  publication={ publication }
  localDataKey={ localDataKey }
  preferences={{
    initialPreferences: createAudioPreferences({ /* ... */ })
  }}
/>

// EPUB
<StatefulReaderWrapper
  profile="epub"
  publication={ publication }
  localDataKey={ localDataKey }
  preferences={{
    initialPreferences: createPreferences({ /* ... */ })
  }}
/>
```

> [!IMPORTANT]
> Due to the complexity the reader has to handle, it does not currently accept `children`. This also explains why it requires dependencies (Redux, Preferences) and is not directly stylable. We are hopeful these limitations may be removed in the future but it will require some additional effort. If you have any ideas, please let us know. In the meantime, you can build your own reader component if you want to use the other components exported from this package.

It is critical you wrap this component in a `<ThStoreProvider>` for it to work properly. The preferences provider and i18n provider are managed internally by the wrapper.

> [!CAUTION]
> When using `<StatefulReaderWrapper>` and all other components from `@edrlab/thorium-web/reader`, you must use `<ThStoreProvider>` from this same path. Using a store from a different path will result in a separate context that the components cannot access.

### i18n configuration

`StatefulReaderWrapper` mounts `ThI18nProvider` internally. Pass an `i18n` prop to forward i18next initialization options — useful when you need extra namespaces for your own translated strings or a custom backend load path.

```tsx
<StatefulReaderWrapper
  profile={ profile }
  publication={ publication }
  localDataKey={ localDataKey }
  i18n={{
    ns: ["thorium-shared", "thorium-web", "my-app"],
    defaultNS: ["my-app", "thorium-web", "thorium-shared"],
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json"
    }
  }}
/>
```

> [!IMPORTANT]
> `initI18n` merges your options with the defaults using a shallow spread, so array fields like `ns` and `defaultNS` are **replaced**, not merged. Always include the built-in namespaces (`"thorium-shared"`, `"thorium-web"`) when extending them.

See the [i18n documentation](../Core/i18n.md) for the full list of available options.

### Plugins

Plugins let you extend the reader UI with custom actions and settings components. Each profile has its own factory so only the relevant code is loaded.

Factories can be async, which allows you to use dynamic imports and avoid loading plugin components until the reader actually mounts.

```tsx
const epubPlugins = async (): Promise<ThPlugin[]> => {
  const { createDefaultPlugin } = await import("@edrlab/thorium-web/reader");
  const { MyActionTrigger } = await import("./actions/MyActionTrigger");
  const { MyActionContainer } = await import("./actions/MyActionContainer");

  return [
    createDefaultPlugin(),
    {
      id: "my-plugin",
      name: "My Plugin",
      version: "1.0.0",
      components: {
        actions: {
          myAction: {
            Trigger: MyActionTrigger,
            Target: MyActionContainer
          }
        }
      }
    }
  ];
};

<StatefulReaderWrapper
  profile="epub"
  publication={ publication }
  localDataKey={ localDataKey }
  plugins={{ epub: epubPlugins }}
/>
```

Besides `actions` and `settings`, `components` accepts `primaryAudioActions` for the audio player’s media bar, and `readAlongActions` for the read-along players. Read-along actions are Trigger/Target pairs like reader actions, keyed by the `readAlongAction` custom key (see [Read Along](../../customization/ReadAlong.md#extending-read-along)).

The wrapper will not mount the reader until the factory has resolved, ensuring the plugin registry is initialised with the correct plugins from the start. Only the factory matching the active profile is called — unused factories are never loaded.

### ReaderPlugins Interface

```typescript
type ThPluginFactory = () => ThPlugin[] | Promise<ThPlugin[]>;

interface ReaderPlugins {
  epub?: ThPluginFactory;
  webPub?: ThPluginFactory;
  audio?: ThPluginFactory;
}
```

### PositionStorage Interface

```typescript
interface PositionStorage {
  get: () => Locator | undefined; // Get current reading position
  set: (locator: Locator) => void | Promise<void>; // Set reading position
}
```

### Supported Profiles

- **"epub"**: Renders the EPUB StatefulReader with FXL or reflow rendition
- **"webPub"**: Renders the WebPub ExperimentalStatefulReader
- **"audio"**: Renders the audio StatefulPlayer

### Features

- **Conditional Rendering**: Automatically renders EPUB, WebPub, or Audio readers based on profile
- **Theme Management**: Initializes the theme system automatically
- **Preferences Management**: Sets up preferences for each profile
- **Redux State Management**: Integrates with Thorium's Redux store for theme, publication, and settings state
- **Accessibility**: Manages breakpoints, color schemes, contrast, and motion preferences
- **Position Storage**: Optional interface for overriding the built-in position persistence

## Hooks

See the [Reader Hooks](./Hooks.md) reference for the full API.
