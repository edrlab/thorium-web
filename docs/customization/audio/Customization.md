# Audio Customization

This document covers customization options available for the `StatefulPlayer` audio component. Audio uses its own preferences system, separate from EPUB/WebPub — see [Handling Preferences](./HandlingPreferences.md) for how to create and provide audio preferences.

> [!NOTE]
> Several concepts from the EPUB/WebPub `StatefulReader` do **not** apply to audio:
> - **Layout mode** (`ThLayoutUI`, `stacked`, `layered`): audio has its own fixed layout.
> - **Immersive mode** / **hovering state**: not applicable to audio.
> - **Scroll / paged mode**: not applicable to audio.
> - **Typography**, **pagination arrows**: not applicable to audio.

## Theming

Audio shares the same theming system as the reader. You can configure themes, breakpoints, icon size, and spacing in `theming`. See the [Theming doc](../Theming.md) for details.

## Layout

Audio layout is configured under `theming.layout` with the following structure:

### Component Ordering

Configure component order for each layout type using `ThAudioPlayerComponent`:

- `cover`: cover image
- `metadata`: title and author
- `progressBar`: seekable progress bar
- `playbackControls`: previous, skip backward, play/pause, skip forward, next
- `mediaActions`: the primary actions bar (volume, playback rate, and other primary actions)

```typescript
import { ThAudioPlayerComponent } from "@edrlab/thorium-web/preferences";

theming: {
  layout: {
    compact: {
      order: [
        ThAudioPlayerComponent.cover,
        ThAudioPlayerComponent.metadata,
        ThAudioPlayerComponent.playbackControls,
        ThAudioPlayerComponent.progressBar,
        ThAudioPlayerComponent.mediaActions
      ]
    },
    expanded: {
      start: [
        ThAudioPlayerComponent.cover,
        ThAudioPlayerComponent.metadata
      ],
      end: [
        ThAudioPlayerComponent.playbackControls,
        ThAudioPlayerComponent.progressBar,
        ThAudioPlayerComponent.mediaActions
      ]
    }
  }
}
```

### Publication Metadata Ordering

Configure the order and visibility of publication metadata components (title, subtitle, authors) using `publicationMetadata.order`:

```typescript
import { ThAudioPublicationMetadataComponent } from "@edrlab/thorium-web/preferences";

theming: {
  layout: {
    publicationMetadata: {
      order: [
        ThAudioPublicationMetadataComponent.titleWithSubtitle
      ]
    }
  }
}
```

Available metadata components:
- `title`: Title only (no subtitle)
- `titleWithSubtitle`: Title with subtitle (default)
- `subtitleWithTitle`: Subtitle with title (subtitle rendered first)
- `authors`: Authors list

**Type Safety**: The type system enforces that only one title variant can be used. Invalid combinations like `[subtitleWithTitle, title]` will throw a TypeScript error.

**Runtime Validation**: If invalid combinations are provided at runtime, the system will deduplicate by keeping only the first title variant and logging a warning.

Valid combinations:
- Single title variant: `[title]`, `[titleWithSubtitle]`, `[subtitleWithTitle]`
- With authors: `[title, authors]`, `[titleWithSubtitle, authors]`, `[subtitleWithTitle, authors]`, `[authors, title]`, etc.
- Authors only: `[authors]`

### Layout Properties

Additional layout configuration options:

- `radius`: Border radius for layout elements
- `spacing`: Spacing between components
- `progressBar`: Progress bar variant configuration
- `defaults`: Default layout values (dockingWidth, scrim)
- `constraints`: Size constraints for different sheet types

#### Progress Bar Configuration

Configure progress bar appearance using the `progressBar` property:

```typescript
import { ThAudioProgressBarVariant } from "@edrlab/thorium-web/audio";

theming: {
  layout: {
    progressBar: {
      variant: ThAudioProgressBarVariant.segmented
    }
  }
}
```

Available progress bar variants:
- `ThAudioProgressBarVariant.normal`: Standard progress bar
- `ThAudioProgressBarVariant.segmented`: Progress bar with timeline segment ticks and hover tooltips

## Actions

Audio actions are split into two zones.

**Primary** (`actions.primary`) appears in the media actions bar. It uses `compactPopover` in place of `popover` — `popover` is not available. Built-in keys: `volume`, `playbackRate`, `toc`, `sleepTimer`.

> [!WARNING]
> If a primary action's content includes an input (text field, number field, etc.), we cannot guarantee it will not be hidden behind the virtual keyboard when using `compactPopover`. The React Aria Popover component has no concept of viewport resizing, so it will not reposition when the software keyboard appears.

**Secondary** (`actions.secondary`) appears in the header bar and works exactly like reader actions — `compactPopover` is not available. Built-in keys: `remotePlayback`, `settings`.

See the main [Customization doc](../Customization.md#actions) for the shared action token options (visibility, shortcut, sheet, docking, snapping).

## Affordances

Configure navigation behavior for previous/next track buttons using the `affordances` property:

```typescript
import { ThAudioAffordance } from "@edrlab/thorium-web/preferences";

// In your createAudioPreferences call:
affordances: {
  previous: ThAudioAffordance.timeline,    // Navigate within timeline segments
  next: ThAudioAffordance.readingOrder     // Navigate by reading order (tracks)
}
```

Available affordance types:
- `ThAudioAffordance.timeline`: Navigate within timeline segments (chapters, sections)
- `ThAudioAffordance.toc`: Navigate by table of contents items
- `ThAudioAffordance.readingOrder`: Navigate by reading order (individual audio tracks)

### Fragment-Based Navigation

When using `timeline` or `toc` affordances, the player supports fragment-based navigation and pause behavior:

- **Sleep Timer Integration**: The sleep timer's `endOfFragment` preset works with these affordances to pause playback at fragment boundaries
- **Continuous Play Control**: When `autoPlay` is disabled, playback automatically pauses when reaching the next fragment
- **Timeline Monitoring**: The player monitors `timelineItemChanged` events to detect fragment transitions

Example configuration with fragment-based sleep timer:

```typescript
import { createAudioPreferences, ThSettingsTimerVariant } from "@edrlab/thorium-web/audio";

const preferences = createAudioPreferences({
  affordances: {
    previous: ThAudioAffordance.toc,
    next: ThAudioAffordance.toc
  },
  settings: {
    order: ["sleepTimer"],
    keys: {
      sleepTimer: {
        variant: ThSettingsTimerVariant.presetList,
        presets: [15, 30, 45, 60, 90, "endOfFragment", "endOfResource"]
      }
    }
  }
});
```

## Docking

Audio supports the same docking system as the reader. See the [Docking doc](../Docking.md) for details.

## Content Protection

See the [Audio Protection doc](./Protection.md) for audio-specific content protection options.
