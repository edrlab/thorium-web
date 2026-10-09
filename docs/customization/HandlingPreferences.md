# Handling Preferences

Thorium Web has two preference layers:

- **Global preferences** — app-level settings that apply regardless of which reader is active. Currently owns `locale`, from which UI direction is derived automatically.
- **Reader preferences** — reader-specific settings (typography, theming, actions, etc.) passed to `ThPreferencesProvider` or `ThAudioPreferencesProvider`.

---

## Global Preferences

### Setup

`ThGlobalPreferencesProvider` must wrap your entire application, outside of any reader. It provides React Aria's `I18nProvider` internally so that `useLocale()` is available everywhere, and keeps `document.documentElement.dir` in sync with the locale.

```tsx
import { createGlobalPreferences, ThGlobalPreferencesProvider } from "@edrlab/thorium-web/core/preferences";

const globalPrefs = createGlobalPreferences({ locale: "ar" });

export default function App() {
  return (
    <ThStoreProvider>
      <ThGlobalPreferencesProvider initialPreferences={ globalPrefs }>
        { children }
      </ThGlobalPreferencesProvider>
    </ThStoreProvider>
  );
}
```

`createGlobalPreferences` is server-safe — it can be called in a Next.js `layout.tsx` Server Component without triggering a `"use client"` boundary error.

Unsupported locales are silently discarded and the UI falls back to browser language detection.

### Redux persistence

Use `StatefulGlobalPreferencesProvider` to persist the locale to `localStorage` via Redux:

```tsx
import { StatefulGlobalPreferencesProvider } from "@edrlab/thorium-web/reader";

<ThStoreProvider>
  <StatefulGlobalPreferencesProvider initialPreferences={ globalPrefs }>
    { children }
  </StatefulGlobalPreferencesProvider>
</ThStoreProvider>
```

### Reading and updating global preferences

```tsx
import { useGlobalPreferences } from "@edrlab/thorium-web/core/preferences";

function LocaleSwitcher() {
  const { preferences, updatePreferences } = useGlobalPreferences();

  return (
    <select
      value={ preferences.locale ?? "" }
      onChange={ e => updatePreferences({ locale: e.target.value || undefined }) }
    >
      <option value="">Browser default</option>
      <option value="fr">Français</option>
      <option value="ar">العربية</option>
    </select>
  );
}
```

### Getting UI direction

Direction is derived from the locale by React Aria — it is not stored. Use `useLocale()` anywhere inside `ThGlobalPreferencesProvider`:

```tsx
import { useLocale } from "react-aria";

function MyComponent() {
  const { direction } = useLocale(); // "ltr" | "rtl"
}
```

> [!IMPORTANT]
> `useLocale().direction` reflects the **UI locale direction**. For publication reading direction (e.g. an RTL Arabic ebook), use `state.publication.isRTL` from the Redux store instead.

### Custom adapter

Implement `ThGlobalPreferencesAdapter` to plug in your own storage:

```ts
import { ThGlobalPreferencesAdapter, ThGlobalPreferences } from "@edrlab/thorium-web/core/preferences";

class MyGlobalAdapter implements ThGlobalPreferencesAdapter {
  getPreferences(): ThGlobalPreferences { /* ... */ }
  setPreferences(prefs: ThGlobalPreferences): void { /* ... */ }
  subscribe(cb: (prefs: ThGlobalPreferences) => void): void { /* ... */ }
  unsubscribe(cb: (prefs: ThGlobalPreferences) => void): void { /* ... */ }
}

<ThGlobalPreferencesProvider adapter={ new MyGlobalAdapter() }>
  { children }
</ThGlobalPreferencesProvider>
```

---

## Reader Preferences

In case you need to use the Preferences package, you can use the following helpers to create and merge preferences objects.

It also provides a `ThPreferencesProvider` component that makes the preferences available to all components, as well as a context hook, `usePreferences()`, that allows you to access and update the preferences.

### Create Preferences

The `createPreferences` helper allows you to create a new preferences object with your own custom configuration. This is the primary way to set up the preferences for your Thorium Web implementation.

#### Basic Usage

```typescript
import { createPreferences, ThSettingsKeys, ThActionsKeys, ThDocumentTitleFormat } from "@edrlab/thorium-web/core/preferences";

const prefs = createPreferences({
  metadata: {
    documentTitle: { format: ThDocumentTitleFormat.title }
  },
  typography: {
    optimalLineLength: 55,
    minimalLineLength: 40,
    maximalLineLength: 70,
    pageGutter: 20,
  },
  settings: {
    reflowOrder: [ThSettingsKeys.theme, ThSettingsKeys.textGroup, ThSettingsKeys.layout],
    fxlOrder: [ThSettingsKeys.theme],
    webPubOrder: [ThSettingsKeys.theme, ThSettingsKeys.textGroup],
    divinaOrder: [ThSettingsKeys.theme, ThSettingsKeys.layout],
    // keys, text, spacing…
  },
  actions: {
    reflowOrder: [ThActionsKeys.toc, ThActionsKeys.settings],
    fxlOrder: [ThActionsKeys.toc, ThActionsKeys.settings],
    webPubOrder: [ThActionsKeys.toc, ThActionsKeys.settings],
    divinaOrder: [ThActionsKeys.toc, ThActionsKeys.settings],
    // keys, collapse…
  },
  // theming, affordances, shortcuts, docking…
});
```

> [!NOTE]
> `locale` and `direction` are not accepted here — use `createGlobalPreferences` instead. See [Global Preferences](#global-preferences) above.

`createPreferences` is server-safe and can be called in Server Components.

### Custom Action Keys

Let's imagine you need to add a custom action key to the preferences. You can do this by following these steps:

1. Define your action keys
2. Extend `CustomizableKeys`
3. Create preferences with your custom keys type

```typescript
import { createPreferences, CustomizableKeys, ThActionsKeys } from "@edrlab/thorium-web/core/preferences";

// 1. Define your action keys
enum MyActions {
  customAction = "customAction"
}

// 2. Extend CustomizableKeys
type MyKeys = {
  action: MyActions | ThActionsKeys;  // Include default actions
} & CustomizableKeys;

// 3. Create preferences
const prefs = createPreferences<MyKeys>({
  actions: {
    reflowOrder: [ThActionsKeys.settings, MyActions.customAction],
    keys: {
      [MyActions.customAction]: {
        visibility: "always",
        shortcut: null
      }
    }
  }
});
```

Read-along has its own customizable keys, declared the same way:

- `readAlongAction`: actions of the read-along player, added to `readAlong.actions` and rendered through the plugin `readAlongActions` map;
- `readAlong`: read-along settings, added to `readAlong.settings`. Their `keys` entries are typed as range settings.

```typescript
type MyKeys = {
  readAlongAction: ThReadAlongActionKeys | "myReadAlongAction";
  readAlong: ThReadAlongKeys | "myReadAlongSetting";
} & CustomizableKeys;
```

See the [Read Along doc](./ReadAlong.md) for more details.

### Using the Provider

The `ThPreferencesProvider` component provides a React context for accessing Thorium Web preferences throughout your application. It serves as the central point for managing and distributing preference settings to all components.

```typescript
import { ThPreferencesProvider } from "@edrlab/thorium-web/core/preferences";

function App() {
  return (
    <ThPreferencesProvider 
      adapter={ yourAdapter }  // Optional: custom adapter for persistence
      devMode={ true }  // Optional: enable dev mode
      initialPreferences={ prefs }  // Optional: initial preferences
    >
      <YourApp />
    </ThPreferencesProvider>
  );
}
```

#### Provider Props

- `adapter?`: Optional custom adapter for persisting preferences
- `devMode?`: Optional boolean to enable dev mode – this will turn every content protection setting to `false`
- `initialPreferences?`: Optional initial preferences object – note this will override the default preferences and the dev mode
- `children`: Your application components

### Accessing Preferences

```typescript
import { usePreferences } from "@edrlab/thorium-web/core/preferences";

function MyComponent() {
  const { preferences } = usePreferences<MyKeys>();
}
```

### Updating Preferences

The `updatePreferences` function allows you to update preferences values. It expects a complete preferences object.

```typescript
import { usePreferences } from "@edrlab/thorium-web/core/preferences";

function MyComponent() {
  const { preferences, updatePreferences } = usePreferences<MyKeys>();

  const handleUpdate = () => {
    updatePreferences({
      ...preferences,
      metadata: { documentTitle: { format: ThDocumentTitleFormat.titleAndAuthor } }
    });
  };

  return (
    <button onClick={ handleUpdate }>Update Document Title Format</button>
  );
}
```

#### Important Notes

- The provider should be placed high in your component tree
- Use a custom adapter for persistence if needed
- The `usePreferences` hook is read-only - updates should be handled through your adapter
- You can nest multiple providers to override preferences for specific parts of your application

### Custom adapter

Implement `ThPreferencesAdapter` to plug in your own storage (e.g. a database, `AsyncStorage`, or a custom Redux slice):

```ts
import { ThPreferencesAdapter, ThPreferences } from "@edrlab/thorium-web/core/preferences";

class MyAdapter<T extends CustomizableKeys> implements ThPreferencesAdapter<T> {
  getPreferences(): ThPreferences<T> { /* ... */ }
  setPreferences(prefs: ThPreferences<T>): void { /* ... */ }
  subscribe(cb: (prefs: ThPreferences<T>) => void): void { /* ... */ }
  unsubscribe(cb: (prefs: ThPreferences<T>) => void): void { /* ... */ }
}
```

---

## Full Provider Hierarchy

```tsx
// layout.tsx — Server Component
import { createGlobalPreferences, ThGlobalPreferencesProvider } from "@edrlab/thorium-web/core/preferences";
import { ThStoreProvider } from "@edrlab/thorium-web/core/lib";

const globalPrefs = createGlobalPreferences({ locale: "fr" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThStoreProvider>
          <ThGlobalPreferencesProvider initialPreferences={ globalPrefs }>
            { children }
          </ThGlobalPreferencesProvider>
        </ThStoreProvider>
      </body>
    </html>
  );
}
```

```tsx
// reader page — Client Component
import { createPreferences } from "@edrlab/thorium-web/core/preferences";
import { StatefulReaderWrapper } from "@edrlab/thorium-web/reader";

const readerPrefs = createPreferences({ /* ... */ });

export default function ReaderPage() {
  return (
    <StatefulReaderWrapper
      { ...publicationProps }
      preferences={{ initialPreferences: readerPrefs }}
    />
  );
}
```

> [!NOTE]
> `html[suppressHydrationWarning]` is required because `ThDirectionSetter` writes `document.documentElement.dir` client-side after hydration. The attribute is not present in the server-rendered HTML.
