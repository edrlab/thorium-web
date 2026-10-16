# Playback Components API Documentation

Components shared by the audio and read-along players. They render no class of their own: pass yours with `className` and `compounds`.

## ThCover

A publication cover rendered as a `<figure>`, with a placeholder when there is no image and an optional loading indicator.

### Props

```typescript
interface ThCoverProps extends Omit<React.HTMLAttributes<HTMLElement>, "placeholder"> {
  ref?: Ref<HTMLElement>;
  src?: string;                      // Image URL, the placeholder is rendered without it
  alt: string;                       // Alternative text of the image
  isLoading?: boolean;               // Shows loadingIndicator
  placeholder?: React.ReactNode;     // Content rendered when there is no src
  loadingIndicator?: React.ReactNode; // Rendered in the placeholder, or over the image, while loading
  compounds?: {
    image?: Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;
    placeholder?: React.HTMLAttributes<HTMLDivElement>;
    loadingOverlay?: React.HTMLAttributes<HTMLDivElement>;
  };
}
```

### Features

- Without `src`, renders `placeholder`, or `loadingIndicator` while loading
- With `src` and `isLoading`, renders `loadingIndicator` in an `aria-hidden` overlay above the image

## ThPublicationMetadata

Publication metadata (title, subtitle, authors) rendered in a `<header>`, in a configurable order.

### Props

```typescript
interface ThPublicationMetadataProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  subtitle?: string;
  authors?: string[];
  order: string[];          // "title", "titleWithSubtitle", "subtitleWithTitle", "authors"
  extra?: React.ReactNode;  // Rendered after the ordered items, e.g. the current chapter
  compounds?: {
    titleGroup?: React.HTMLAttributes<HTMLElement>;  // The <hgroup> of titleWithSubtitle and subtitleWithTitle
    title?: React.HTMLAttributes<HTMLHeadingElement>;
    subtitle?: React.HTMLAttributes<HTMLParagraphElement>;
    authors?: React.HTMLAttributes<HTMLParagraphElement>;
  };
}
```

### Features

- `titleWithSubtitle` and `subtitleWithTitle` group the title and subtitle in an `<hgroup>`, which receives `compounds.titleGroup`
- Authors are joined with a comma, and not rendered when the list is empty
- Unknown items in `order` are ignored

## ThPlaybackControls

An actions bar laying out playback buttons in a fixed order: previous, skip backward, play/pause, skip forward, next.

### Props

```typescript
interface ThPlaybackControlsProps extends Omit<ThActionsBarProps, "children"> {
  previous?: React.ReactNode;
  skipBackward?: React.ReactNode;
  playPause: React.ReactNode;
  skipForward?: React.ReactNode;
  next?: React.ReactNode;
}
```

### Features

- Always laid out left to right, whatever the UI direction, as media controls are
- Each slot takes your own button, only `playPause` is required

## ThMiniPlayer

A compact player: actions on the player itself, a metadata area (cover, heading and subheading), then slots for playback controls and actions.

### Props

```typescript
interface ThMiniPlayerProps extends React.HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  heading: string;              // e.g. the publication title
  subheading?: string;          // e.g. the current chapter
  onExpand?: () => void;        // Makes the metadata area a button expanding the player
  expandLabel?: string;         // Prefix of that button’s accessible name, followed by heading and subheading
  cover?: React.ReactNode;      // Before the heading, inside the expand button if any, so phrasing content only
  playerActions?: React.ReactNode; // Actions on the player itself, e.g. expand and close
  controls?: React.ReactNode;
  actions?: React.ReactNode;
  compounds?: {
    expandButton?: WithRef<Omit<ButtonProps, "onPress" | "aria-label">, HTMLButtonElement>;
    metadata?: HTMLAttributesWithRef<HTMLDivElement>;
    text?: React.HTMLAttributes<HTMLSpanElement>;
    heading?: React.HTMLAttributes<HTMLSpanElement>;
    subheading?: React.HTMLAttributes<HTMLSpanElement>;
    playerActions?: HTMLAttributesWithRef<HTMLDivElement>;
    controls?: HTMLAttributesWithRef<HTMLDivElement>;
    actions?: HTMLAttributesWithRef<HTMLDivElement>;
  };
}
```

### Features

- Renders a `<section>`: `playerActions`, metadata, `controls`, then `actions`
- With `onExpand`, the metadata area is a React Aria `Button` named `expandLabel: heading, subheading`; without it, a `div` using `compounds.metadata`
- Heading and subheading are `<span>`s, wrapped in a `<span>` using `compounds.text` after the cover, so they stay valid inside the button
