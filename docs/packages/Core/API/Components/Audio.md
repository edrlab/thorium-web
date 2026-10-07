# Audio Components API Documentation

## ThAudioProgress

A seekable progress bar for audio playback. Displays elapsed time, remaining time, an optional chapter label, and optional seekable range indicators.

### Types

```typescript
interface SeekableRange {
  start: number;
  end: number;
}

interface TimelineSegment {
  title?: string;     // Optional label for the segment
  timestamp: number;  // Position in seconds
  percentage: number; // Pre-computed position as a percentage of total duration
}
```

### Props

```typescript
interface ThAudioProgressProps {
  isDisabled?: boolean;
  currentTime: number;                          // Current playback position in seconds
  duration: number;                             // Total duration in seconds
  onSeek: (time: number) => void;               // Callback when user seeks to a position
  currentChapter?: string;                      // Optional chapter label shown above the slider
  seekableRanges?: SeekableRange[];             // Optional buffered/seekable time ranges
  hoverLabel?: string;                          // Label shown in the tooltip when hovering
  onHoverProgression?: (progression: number | null) => void; // Callback when user hovers over the bar
  segments?: TimelineSegment[];                 // Optional segment tick marks along the timeline
  compounds?: {
    wrapper?: React.HTMLAttributes<HTMLDivElement>;
    chapter?: React.HTMLAttributes<HTMLDivElement>;
    slider?: WithRef<SliderProps, HTMLDivElement>;
    track?: WithRef<SliderTrackProps, HTMLDivElement>;
    thumb?: WithRef<SliderThumbProps, HTMLDivElement>;
    elapsedTime?: React.HTMLAttributes<HTMLSpanElement>;
    remainingTime?: React.HTMLAttributes<HTMLSpanElement>;
    seekableRange?: React.HTMLAttributes<HTMLDivElement>;
    segmentTick?: React.HTMLAttributes<HTMLDivElement>;
    tooltip?: WithRef<PositionProps & React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    overlayContainer?: OverlayContainerProps;
  };
}
```

### Features

- Formats time as `m:ss` or `h:mm:ss` automatically
- Renders seekable range overlays (e.g. buffered regions) as positioned divs within the track
- Seekable ranges outside the current duration are filtered out
- Disabled state propagates to the underlying slider
- Hover tooltip showing a custom label at the hovered position
- Optional segment ticks along the timeline (e.g. chapter markers)
- Full compound components pattern for layout control

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
    title?: React.HTMLAttributes<HTMLHeadingElement>;
    subtitle?: React.HTMLAttributes<HTMLParagraphElement>;
    authors?: React.HTMLAttributes<HTMLParagraphElement>;
  };
}
```

### Features

- `titleWithSubtitle` and `subtitleWithTitle` group the title and subtitle in an `<hgroup>`
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

A compact player: a metadata area (heading and subheading), plus slots for playback controls and actions.

### Props

```typescript
interface ThMiniPlayerProps extends React.HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  heading: string;              // e.g. the publication title
  subheading?: string;          // e.g. the current chapter
  onExpand?: () => void;        // Makes the metadata area a button expanding the player
  expandLabel?: string;         // Prefix of that button’s accessible name, followed by heading and subheading
  controls?: React.ReactNode;
  actions?: React.ReactNode;
  compounds?: {
    expandButton?: WithRef<Omit<ButtonProps, "onPress" | "aria-label">, HTMLButtonElement>;
    metadata?: HTMLAttributesWithRef<HTMLDivElement>;
    heading?: React.HTMLAttributes<HTMLSpanElement>;
    subheading?: React.HTMLAttributes<HTMLSpanElement>;
    controls?: HTMLAttributesWithRef<HTMLDivElement>;
    actions?: HTMLAttributesWithRef<HTMLDivElement>;
  };
}
```

### Features

- Renders a `<section>`
- With `onExpand`, the metadata area is a React Aria `Button` named `expandLabel: heading, subheading`; without it, a `div` using `compounds.metadata`
- Heading and subheading are `<span>`s, so they stay valid inside the button
