# Audio Controls API Reference

Audio control components are fully self-contained — they connect to the navigator, Redux state, and preferences internally. They are exported from `@edrlab/thorium-web/audio`.

## Composite Controls

### StatefulAudioMediaActions

Renders the primary action bar. Components and their order are driven by the plugin registry's `primaryAudioActionsMap` and `actions.primary.displayOrder` in preferences. Controls are disabled when the track is not ready or stalled.

```typescript
interface StatefulAudioMediaActionsProps {}
```

### StatefulAudioPlaybackControls

Renders the standard playback row: previous track, skip backward, play/pause, skip forward, next track. All buttons are automatically disabled based on track readiness and stall state.

```typescript
interface StatefulAudioPlaybackControlsProps {}
```

### StatefulAudioProgressBar

Seekable progress bar showing elapsed time, remaining time, an optional chapter label, seekable range overlays, and timeline segment ticks (when configured). Disabled when the track is not ready or stalled. Pressing Escape blurs the slider.

The progress bar appearance is controlled by the `progressBar.variant` preference:
- `ThAudioProgressBarVariant.normal`: Standard progress bar
- `ThAudioProgressBarVariant.segmented`: Shows timeline segment ticks with hover tooltips

```typescript
interface StatefulAudioProgressBarProps {}
```

## Individual Controls

### StatefulPlayPauseButton

Play/pause toggle. Icon and aria-label update based on current playback status.

```typescript
interface StatefulPlayPauseButtonProps {
  isDisabled?: boolean;
}
```

### StatefulPreviousTrackButton

Navigates to the previous track. Automatically disabled at the start of the publication.

```typescript
interface StatefulPreviousTrackButtonProps {
  isDisabled?: boolean;
}
```

### StatefulNextTrackButton

Navigates to the next track. Automatically disabled at the end of the publication.

```typescript
interface StatefulNextTrackButtonProps {
  isDisabled?: boolean;
}
```

### StatefulSkipBackwardButton

Skips backward by `skipBackwardInterval` seconds. Icon updates dynamically (replay 5/10/30s or generic) based on the configured interval.

```typescript
interface StatefulSkipBackwardButtonProps {
  isDisabled?: boolean;
}
```

### StatefulSkipForwardButton

Skips forward by `skipForwardInterval` seconds. Icon updates dynamically (forward 5/10/30s or generic) based on the configured interval.

```typescript
interface StatefulSkipForwardButtonProps {
  isDisabled?: boolean;
}
```

### StatefulAudioVolume

Volume button that opens a vertical slider popover. The button icon changes dynamically between mute, low, medium, high, and off states based on the current volume level.

```typescript
interface StatefulAudioVolumeProps {
  isDisabled: boolean;
}
```

### StatefulAudioPlaybackRate

Playback rate button that opens a popover with a configurable control. Displays the current rate as a label (e.g. `1.5×`). The popover content renders as a slider, slider with presets, or number field based on `settings.keys.playbackRate.variant`.

```typescript
interface StatefulAudioPlaybackRateProps {
  isDisabled: boolean;
}
```

### StatefulSleepTimer

Sleep timer button with preset or custom duration modes. Shows a remaining-time badge when active. Automatically pauses playback when the timer expires.

Supports both duration-based presets (15, 30, 45, 60, 90 minutes) and content-based presets:

- **endOfResource**: Pause at the end of the current track/resource
- **endOfFragment**: Pause at the end of the current fragment when using timeline or toc affordances

When `endOfFragment` is selected, the player monitors timeline changes and pauses playback when reaching the next fragment. This works in conjunction with the `affordances.next` preference setting - when set to `"timeline"` or `"toc"`, fragment-based pausing is enabled.

```typescript
interface StatefulSleepTimerProps {
  isDisabled?: boolean;
}
```

### StatefulAudioTocAction

Table of contents button. Opens a popover with a filterable, expandable TOC tree. Navigates to the selected section and enables immersive mode on selection. Supports RTL.

```typescript
interface StatefulAudioTocActionProps {
  isDisabled: boolean;
}
```

## Shared with Read Along

The volume, playback rate and sleep timer actions also make up the read-along player’s actions, and the playback buttons its controls. They pick their context from the preferences provider they are rendered in:

- **In the audio player** (`ThAudioPreferencesProvider`): audio preferences, the audio navigator and the `audioSettings` / `player` state, as described above.
- **In a reader** (`ThPreferencesProvider`): `preferences.readAlong`, the read-aloud navigator and the `readAlongSettings` / `readAlongPlayer` state. They are disabled until read-along has loaded, and the playback rate also when the current voice can’t change its rate.

In read-along, the sleep timer only supports durations: the end of resource and end of fragment presets have no effect there, and its default presets don’t include them.

See [Read Along](../../../customization/ReadAlong.md) for configuring them.
