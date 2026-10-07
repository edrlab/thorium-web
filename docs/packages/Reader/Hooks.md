# Reader Hooks API Reference

## usePublication

Fetches a Readium Web Publication Manifest from a URL, parses it into a `Publication` object, and detects the publication profile. Must be used inside a `ThStoreProvider`.

```typescript
import { usePublication } from "@edrlab/thorium-web/reader";

const { publication, profile, localDataKey, isLoading, error } = usePublication({
  url: manifestUrl,
  onError: (error) => console.error(error)
});
```

**Parameters**

```typescript
interface UsePublicationOptions {
  url: string;
  onError?: (error: ProcessedError) => void;
  fetcher?: Fetcher;
}
```

**Returns**

```typescript
interface UsePublicationReturn {
  isLoading: boolean;
  error: ProcessedError | null;
  publication: Publication | null;
  manifest: object | null;
  selfLink: string | null;
  localDataKey: string | null;
  profile: "epub" | "webPub" | "audio" | "divina" | null;
  isRTL: boolean;
  isFXL: boolean;
  hasDisplayTransformability: boolean;
}
```

Profile is detected from `conformsTo` in the manifest metadata — `"audio"` for audiobooks, `"divina"` for Divina, `"epub"` for EPUB, `"webPub"` for everything else.

For `"divina"`, it also sets `isManifestScrolled` in the publication store when the manifest declares `layout: "scrolled"`, and synthesizes one position per reading order image when the manifest has no positions list.

---

## useReaderTransitions

Derives boolean transition flags from the reader's Redux state. Useful for reacting to state changes (e.g. entering/leaving immersive mode) without manually tracking previous values.

```typescript
import { useReaderTransitions } from "@edrlab/thorium-web/reader";

const { toImmersive, fromImmersive, isScroll } = useReaderTransitions();
```

**Returns**

```typescript
interface ReaderTransitions {
  // Current states
  isImmersive: boolean;
  isFullscreen: boolean;
  isScroll: boolean;
  hasUserNavigated: boolean;

  // Previous states
  wasImmersive: boolean;
  wasFullscreen: boolean;
  wasScroll: boolean;
  wasUserNavigated: boolean;

  // Transitions (previous → current)
  fromImmersive: boolean;
  toImmersive: boolean;
  fromFullscreen: boolean;
  toFullscreen: boolean;
  fromScroll: boolean;
  toScroll: boolean;
  fromUserNavigation: boolean;
  toUserNavigation: boolean;
}
```

---

## Internal Hooks

> [!NOTE]
> These hooks are used by the built-in readers but are not exported from any entry point, so they cannot be imported. They are documented to explain the readers’ behaviour.

### usePositionStorage

Abstracts reading position persistence. Uses `localStorage` by default, or delegates to a custom `PositionStorage` implementation when provided.

```typescript
const { setLocalData, getLocalData, localData } = usePositionStorage(localDataKey, positionStorage);
```

**Parameters**

- `key`: `string | null` — the localStorage key (used when no custom storage is provided)
- `customStorage`: `PositionStorage` (optional) — a custom storage implementation

**Returns**

- `setLocalData`: `(locator: Locator | null) => void`
- `getLocalData`: `() => Locator | null`
- `localData`: `Locator | null` — the current stored position

---

### usePaginatedArrows

Computes the visibility and layout behaviour of pagination arrows based on preferences, breakpoint, FXL state, and reader transitions. Divina uses `affordances.paginated.divina`, EPUB uses `fxl` or `reflow`.

```typescript
const { isVisible, occupySpace, shouldTrackNavigation, supportsVariant } = usePaginatedArrows();
```

**Returns**

```typescript
interface UsePaginatedArrowsReturn {
  isVisible: boolean;           // Whether arrows should be rendered visible
  occupySpace: boolean;         // True when variant is "stacked" (arrows take up layout space)
  shouldTrackNavigation: boolean; // True when arrows should hide after user navigation
  supportsVariant: boolean;     // False for FXL (always layered)
}
```

---

### useIsScroll

Returns `true` when the reader is currently in scroll mode. This centralizes scroll detection across all publication profiles:

- Always `true` for `webPub` profile (WebPub is always scroll)
- For `epub`: `true` when the scroll setting is enabled, **or** when `scriptMode === "cjk-vertical"`, **and** the publication is not FXL
- For `divina`: `true` when the publication is natively scrolled (`isManifestScrolled`), **or** when the `divinaSettings.scrolled` setting is enabled

```typescript
const isScroll = useIsScroll();
```

**Returns** `boolean`

> [!NOTE]
> CJK-vertical publications are treated as scroll even when the user has not toggled scroll on, because navigators do not support paged for this writing mode.

---

### useIsPageBased

Returns `true` when the publication resources are pages rather than reflowable documents, i.e. FXL EPUB and Divina. Used rather than `isFXL` alone for page-related UI, e.g. labelling footer links “previous/next page” instead of “previous/next chapter”.

```typescript
const isPageBased = useIsPageBased();
```

**Returns** `boolean`

---

### useCoverBlobUrl

Fetches a cover image once and returns a stable blob URL. Both the theme extraction system and the cover image component receive the same URL, so the image is fetched exactly once and never reloaded on layout changes.

```typescript
const { coverBlobUrl, coverReady } = useCoverBlobUrl(coverUrl);
```

**Parameters**

- `coverUrl`: `string | undefined` — the original cover URL (remote or relative)

**Returns**

- `coverBlobUrl`: `string | undefined` — a `blob:` URL backed by the fetched image, or `undefined` while loading or if the fetch failed
- `coverReady`: `boolean` — `true` once the blob is available, the fetch failed, or no `coverUrl` was provided. Use this to gate UI that depends on the cover being resolved.

On fetch failure the UI is unblocked (`coverReady` becomes `true`) and `coverBlobUrl` remains `undefined`, so the cover placeholder is shown. The fetch is aborted and the blob URL is revoked on cleanup.
