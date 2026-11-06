# Audio Hooks API Reference

## useAudioNavigator

Provides access to the Readium `AudioNavigator` instance and all playback/navigation methods. See the [Core Hooks API](../../Core/API/Hooks.md#audio-navigator-hook) for the full interface reference.

> [!IMPORTANT]
> Import from `@edrlab/thorium-web/audio` when used alongside Stateful Components, not from `@edrlab/thorium-web/core/hooks`. All components must share the same navigator instance.

```tsx
import { useAudioNavigator } from "@edrlab/thorium-web/audio";

const MyControls = () => {
  const { play, pause, isPlaying, seek } = useAudioNavigator();

  return (
    <button onClick={ () => isPlaying() ? pause() : play() }>
      { isPlaying() ? "Pause" : "Play" }
    </button>
  );
};
```

## Playback Hooks

Shared by the audio and read-along players, and also exported from the `divina`, `epub`, `webpub` and `reader` packages. They pick the audio or read-along state from the reader profile, and return the same shape in both.

### usePlaybackStatus

```typescript
const { isPlaying, isLoading } = usePlaybackStatus();
```

- `isPlaying`: whether playback is running
- `isLoading`: in audio, the track is not ready or stalled; in read along, the read-aloud navigator is loading

### useVolumeAction, usePlaybackRateAction, useSleepTimerAction

State and setters of the volume, playback rate and sleep timer actions, used by their shared triggers and containers.

```typescript
const { actionKey, config, range, volume, isDisabled, updateVolume } = useVolumeAction();
const { actionKey, config, range, presets, playbackRate, isDisabled, updatePlaybackRate } = usePlaybackRateAction();
const {
  actionKey, config, remainingSeconds, onTrackEnd, onFragmentEnd, isPlaying, isDisabled,
  setRemainingSeconds, setOnTrackEnd, setOnFragmentEnd
} = useSleepTimerAction();
```

- `actionKey`: the action key of the current profile, e.g. `ThAudioActionKeys.volume` or `ThReadAlongActionKeys.volume`
- `config`: the action’s preferences
- `range`: the configured range, narrowed to the range the navigator supports
- `onTrackEnd`, `onFragmentEnd`: always `false` in read along, which has no track or fragment

### useSleepTimerCountdown

Runs the sleep timer’s countdown, and pauses playback when it ends. Call it where the player is always mounted, as the sleep timer’s container is not.
