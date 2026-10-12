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

