# Audio Controls API Reference

Audio control components are fully self-contained — they connect to the navigator, Redux state, and preferences internally. They are exported from `@edrlab/thorium-web/audio`.

## Composite Controls

### StatefulAudioMediaActions

Renders the primary action bar. Components and their order are driven by the plugin registry's `primaryAudioActionsMap` and `actions.primary.displayOrder` in preferences. Controls are disabled when the track is not ready or stalled.

```typescript
interface StatefulAudioMediaActionsProps {}
```

### PlaybackActionPair

Renders a plugin action as a button `Trigger` and its `Target`, sharing the trigger’s ref so the target opens from it. Used by the audio and read-along players’ actions bars, and also exported from the `divina`, `epub`, `webpub` and `reader` packages.

```typescript
interface PlaybackActionPairProps {
  action: ActionComponent; // { Trigger, Target? } from the plugin registry
}
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

Shared with the read-along players, and also exported from the `divina`, `epub`, `webpub` and `reader` packages. It renders no class of its own: `StatefulAudioPlaybackControls` passes `.thorium_web_audioPlayback_audioPlayPauseButton`.

```typescript
interface StatefulPlayPauseButtonProps {
  ref?: React.Ref<HTMLButtonElement>;
  id?: string;
  className: string;
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

In audio, skips backward by `skipBackwardInterval` seconds. Icon updates dynamically (replay 5/10/30s or generic) based on the configured interval. In read along, goes to the previous sentence.

Shared with the read-along players, and also exported from the `divina`, `epub`, `webpub` and `reader` packages. It renders no class of its own: `StatefulAudioPlaybackControls` passes `.thorium_web_audioPlayback_audioSkipBackwardButton`.

```typescript
interface StatefulSkipBackwardButtonProps {
  className: string;
  isDisabled?: boolean;
}
```

### StatefulSkipForwardButton

In audio, skips forward by `skipForwardInterval` seconds. Icon updates dynamically (forward 5/10/30s or generic) based on the configured interval. In read along, goes to the next sentence.

Shared with the read-along players, and also exported from the `divina`, `epub`, `webpub` and `reader` packages. It renders no class of its own: `StatefulAudioPlaybackControls` passes `.thorium_web_audioPlayback_audioSkipForwardButton`.

```typescript
interface StatefulSkipForwardButtonProps {
  className: string;
  isDisabled?: boolean;
}
```

### StatefulAudioVolumeTrigger, StatefulAudioVolumeContainer

Volume button that opens a slider: vertical in popovers, horizontal in other sheets. The button icon changes dynamically between mute, low, medium, high, and off states based on the current volume level. Not rendered on iOS, where volume can’t be set.

They render the shared `StatefulVolumeTrigger` and `StatefulVolumeContainer` with the audio classes (`.thorium_web_volume_*`), and take the plugin’s `StatefulActionTriggerProps` and `StatefulActionContainerProps`.

### StatefulVolumeTrigger, StatefulVolumeContainer

Shared by the audio and read-along players, and also exported from the `divina`, `epub`, `webpub` and `reader` packages. They render no class of their own, and use `useVolumeAction`, which reads and sets the volume of the current profile.

```typescript
interface StatefulVolumeTriggerProps extends StatefulActionTriggerProps {
  className: string;                  // The button
}

interface StatefulVolumeContainerProps extends StatefulActionContainerProps {
  className: string;                  // The sheet
  compounds: {
    slider: { className: string };
    sliderTrack: { className: string };
    sliderThumb: { className: string };
  };
}
```

### StatefulAudioPlaybackRateTrigger, StatefulAudioPlaybackRateContainer

Playback rate button that opens a popover with a configurable control. Displays the current rate as a label (e.g. `1.5×`). The popover content renders as a slider, slider with presets, or number field based on `settings.keys.playbackRate.variant`.

They render the shared `StatefulPlaybackRateTrigger` and `StatefulPlaybackRateContainer` with the audio classes (`.thorium_web_playbackRate_*`), and take the plugin’s `StatefulActionTriggerProps` and `StatefulActionContainerProps`.

### StatefulPlaybackRateTrigger, StatefulPlaybackRateContainer

Shared by the audio and read-along players, and also exported from the `divina`, `epub`, `webpub` and `reader` packages. They render no class of their own, and use `usePlaybackRateAction`, which reads and sets the rate of the current profile. In read along, they are disabled when the voice can’t change its rate.

```typescript
interface StatefulPlaybackRateTriggerProps extends StatefulActionTriggerProps {
  className: string;                  // The button
  compounds: {
    label: { className: string };     // The current rate, e.g. 1.5×
  };
}

interface StatefulPlaybackRateContainerProps extends StatefulActionContainerProps {
  className: string;                  // The sheet
  compounds: {
    slider: { className: string };      // Wrapper of the slider and slider-with-presets variants
    numberField: { className: string }; // Wrapper of the number field variant
  };
}
```

### StatefulAudioSleepTimerTrigger, StatefulAudioSleepTimerContainer

Sleep timer button with preset or custom duration modes. Shows a remaining-time badge when active. Automatically pauses playback when the timer expires.

Supports both duration-based presets (15, 30, 45, 60, 90 minutes) and content-based presets:

- **endOfResource**: Pause at the end of the current track/resource
- **endOfFragment**: Pause at the end of the current fragment when using timeline or toc affordances

When `endOfFragment` is selected, the player monitors timeline changes and pauses playback when reaching the next fragment. This works in conjunction with the `affordances.next` preference setting - when set to `"timeline"` or `"toc"`, fragment-based pausing is enabled.

They render the shared `StatefulSleepTimerTrigger` and `StatefulSleepTimerContainer` with the audio classes (`.thorium_web_sleepTimer_*`), and take the plugin’s `StatefulActionTriggerProps` and `StatefulActionContainerProps`.

### StatefulSleepTimerTrigger, StatefulSleepTimerContainer

Shared by the audio and read-along players, and also exported from the `divina`, `epub`, `webpub` and `reader` packages. They render no class of their own, and use `useSleepTimerAction`, which reads and sets the timer of the current profile. `useSleepTimerCountdown` runs the countdown and pauses playback; call it where the player is always mounted.

```typescript
interface StatefulSleepTimerTriggerProps extends StatefulActionTriggerProps {
  className: string;                  // The button
  compounds: {
    label: { className: string };     // The remaining-time badge
  };
}

interface StatefulSleepTimerContainerProps extends StatefulActionContainerProps {
  className: string;                  // The sheet
  compounds: {
    listbox: { className: string };
    listboxItem: { className: string };
    durationField: { className: string };
    instruction: { className: string };
    inputs: { className: string };
    fieldGroup: { className: string };
    fieldInput: { className: string };
    unitLabel: { className: string };
    remaining: { className: string };
    startButton: { className: string };
    cancelButton: { className: string };
  };
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

The volume, playback rate and sleep timer actions also make up the read-along player’s actions, and the playback buttons its controls, styled with read-along classes instead of the audio ones. They pick their context from the preferences provider they are rendered in:

- **In the audio player** (`ThAudioPreferencesProvider`): audio preferences, the audio navigator and the `audioSettings` / `player` state, as described above.
- **In a reader** (`ThPreferencesProvider`): `preferences.readAlong`, the read-aloud navigator and the `readAlongSettings` / `readAlongPlayer` state. They are disabled until read-along has loaded, and the playback rate also when the current voice can’t change its rate.

In read-along, the sleep timer only supports durations: the end of resource and end of fragment presets have no effect there, and its default presets don’t include them.

See [Read Along](../../../customization/ReadAlong.md) for configuring them.
