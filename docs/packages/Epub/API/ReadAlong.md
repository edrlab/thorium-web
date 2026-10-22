# Read Along Components API Reference

This document details the Read Along components, which read EPUB and WebPub publications aloud. They are exported from the `divina`, `epub`, `webpub` and `reader` packages.

They rely on the read-aloud navigator (see [Read Aloud Navigator Hook](../../Core/API/Hooks.md#read-aloud-navigator-hook)), which loads after the reader. Until it has loaded, `useNavigator().readAloud` is `null` and controls depending on it are disabled.

For configuration, see the [Read Along customization doc](../../../customization/ReadAlong.md).

## Action

### StatefulReadAlongTrigger

Trigger of the `ThActionsKeys.readAlong` action. It starts read along, or stops it when it is active.

**Props:**
- `variant`: Visual variant of the trigger (icon button or overflow menu item)

**Features:**
- Label switching between starting and stopping read along
- Keyboard shortcut support

### StatefulReadAlongContainer

Target of the `ThActionsKeys.readAlong` action: the expanded player in the sheet resolved from the action’s `sheet` and `docked` tokens (docked at the end by default).

**Props:**
- `triggerRef`: Reference to the trigger element

**Features:**
- Opens when the mini player is expanded, with a collapse button in its header
- The close button stops read along
- Reserves its dock slot only while read along is active

## Players

### StatefulReadAlongMiniPlayer

The mini player, in place of the progression in the reader’s bottom bar: the mini player’s actions, cover, title, current chapter, previous sentence / play-pause / next sentence, and an expand button and a button stopping read along. With type `controlsOnly`, cover, title and chapter are left out, and the playback controls are centered.

**Features:**
- Expand and close buttons, and the actions, are toolbars navigated with arrow keys
- Renders the actions in `readAlong.actions.miniPlayer.displayOrder`, collapsing them into an overflow menu per `readAlong.actions.miniPlayer.collapse`
- When narrower than 480px, only the cover shows, the title and chapter staying available to assistive technologies
- Pressing the title or the expand button expands the player
- A region landmark named “Read along”, whatever its type

### StatefulReadAlongMiniPlayerProgression

The reader’s progression, shown in the space the mini player leaves after its player actions when `miniPlayer.progression` is `true`. Rendered by the reader’s bottom bar next to `StatefulReadAlongMiniPlayer`.

**Features:**
- Uses the reader’s progression format, in its normal form if it fits, then its compact form, and hides when neither fits
- Measures the space with ResizeObserver, so the mini player’s own sizing and layout are unaffected

### StatefulReadAlongPlayer

The expanded player: cover, title, authors, current chapter, playback controls and the expanded player’s actions (`StatefulReadAlongMediaActions`).

### StatefulReadAlongMediaActions

The expanded player’s actions bar. Renders the actions in `readAlong.actions.expanded.displayOrder` from the plugin `readAlongActions` map. Keys without a component are skipped.

## Volume Action

### StatefulReadAlongVolumeTrigger, StatefulReadAlongVolumeContainer

Trigger and container of the `ThReadAlongActionKeys.volume` action. They render the shared [`StatefulVolumeTrigger` and `StatefulVolumeContainer`](../../Audio/API/Controls.md#statefulvolumetrigger-statefulvolumecontainer) with the read-along classes (`.thorium_web_readAlongVolume_*`).

**Features:**
- Read the range from `readAlong.settings.keys.volume` and the range the voice supports
- Disabled until read along has loaded, and while it is loading
- The slider is vertical in popovers, horizontal in other sheets

## Rate Action

### StatefulReadAlongRateTrigger, StatefulReadAlongRateContainer

Trigger and container of the `ThReadAlongActionKeys.rate` action. They render the shared [`StatefulPlaybackRateTrigger` and `StatefulPlaybackRateContainer`](../../Audio/API/Controls.md#statefulplaybackratetrigger-statefulplaybackratecontainer) with the read-along classes (`.thorium_web_readAlongRate_*`).

**Features:**
- Show the current rate as a label on the button, e.g. `1.5×`
- Render a slider, slider with presets, or number field based on `readAlong.settings.keys.rate.variant`
- Read the range from `readAlong.settings.keys.rate` and the range the voice supports
- Disabled until read along has loaded, while it is loading, and when the voice can’t change its rate

## Sleep Timer Action

### StatefulReadAlongSleepTimerTrigger, StatefulReadAlongSleepTimerContainer

Trigger and container of the `ThReadAlongActionKeys.sleepTimer` action. They render the shared [`StatefulSleepTimerTrigger` and `StatefulSleepTimerContainer`](../../Audio/API/Controls.md#statefulsleeptimertrigger-statefulsleeptimercontainer) with the read-along classes (`.thorium_web_readAlongSleepTimer_*`).

**Features:**
- Render a preset list or duration fields based on `readAlong.settings.keys.sleepTimer.variant`
- Show the remaining time as a badge on the button while the timer runs
- Pause read along when the timer expires; the countdown runs only while it is playing
- Disabled until read along has loaded, and while it is loading

## Reattach Action

### StatefulReadAlongReattachTrigger

Trigger of the `ThReadAlongActionKeys.reattach` action. It has no container.

**Features:**
- Rendered only while the reader is away from the spoken text (`readAlongPlayer.isDetached`)
- Goes back to the spoken text and follows it again, without changing playback

## Settings Action

### StatefulReadAlongSettingsTrigger

Trigger of the `ThReadAlongActionKeys.settings` action.

### StatefulReadAlongSettingsContainer

The read-along settings.

**Props:**
- `triggerRef`: Reference to the trigger element
- `placement`: Popover placement, `"top"` by default

**Features:**
- Renders the settings in `readAlong.settings.order`
- Leaves out the components of the voice, highlight, prosody and verbosity groups, which render them themselves
- Switches to the voice, highlight, prosody or verbosity subpanel, with a back button in its header; Escape returns to the main panel
- In popover and modal sheets, subpanels take the main panel’s height, scrolling when taller, so the header stays in place
- Returns to the main panel when closed

## Settings Components

All settings components accept `standalone` (`true` by default), like the [EPUB settings components](./Settings.md). They submit their value to the read-aloud navigator, then store the value it applied in the `readAlongSettings` slice. Changes are ignored until read along has loaded, and all but the range settings are disabled until then.

### StatefulReadAlongVoice

A dropdown of the voices for the publication’s main language, or its language override, as filtered and sorted by the TS-Toolkit. It shows the navigator’s own voice until one is chosen.

### StatefulReadAlongAdditionalVoices

A dropdown of voices for each language the publication declares besides its main one, or nothing when it declares only one.

### StatefulReadAlongLanguageVoice

The dropdown both are built with, for one `language` with its `label`. Voices are stored by base language, with the others, and submitted to the navigator as one `voice` preference. `onChange` receives the voice chosen.

### StatefulReadAlongRate, StatefulReadAlongPitch, StatefulReadAlongVolume, StatefulReadAlongPauseDuration

Range settings, rendered according to their `variant` in `readAlong.settings.keys`. Their range is limited to what the TS-Toolkit supports, and they show the navigator’s value until the user sets one. Rate and pitch are disabled when the current voice doesn’t support changing them.

### StatefulReadAlongAutoPause, StatefulReadAlongLanguage

Dropdowns of the values supported by the TS-Toolkit. Auto pause disables pausing after each page in scroll mode.

### StatefulReadAlongLanguageOverride

A dropdown of the languages the TS-Toolkit’s `getLanguages()` lists, after the publication’s declared language. Picking one corrects the publication’s language: the voices listed, and the language its content is spoken in, follow it.

### StatefulReadAlongVerbosity

A radio group of the verbosity presets supported by the TS-Toolkit. `custom` is left out unless the verbosity subpanel has other components, and starts from the current preset when picked without having been customized.

### StatefulReadAlongNotes, StatefulReadAlongPageBreaks

Dropdowns reading notes and page breaks never, inline (where they are referenced or appear), or after the sentence. Their value is derived from the navigator’s current settings, so it matches any preset. Changing whether they are read switches verbosity to `custom`, starting from the current preset’s tables.

### StatefulReadAlongKeepCentered

A switch keeping the sentence being read in the middle of the screen when scrolling. It is disabled in paginated mode.

### StatefulReadAlongVoiceGroup

The voice group: the components in `readAlong.settings.voice.main`, and an advanced button opening the subpanel when `subPanel` isn’t `null`.

`StatefulReadAlongVoiceGroupContainer` renders the subpanel’s components, from `subPanel`.

### StatefulReadAlongVerbosityGroup

The verbosity group: the components in `readAlong.settings.verbosity.main`, and an advanced button opening the subpanel when `subPanel` isn’t `null`.

`StatefulReadAlongVerbosityGroupContainer` renders the subpanel’s components, from `subPanel`.

### StatefulReadAlongHighlightGroup

The highlight group: the components in `readAlong.settings.highlight.main`, and an advanced button opening the subpanel when `subPanel` isn’t `null`.

`StatefulReadAlongHighlightGroupContainer` renders the subpanel’s components, from `subPanel`.

### StatefulReadAlongHighlightPresets

A radio group of the highlight presets in `readAlong.settings.highlight.presets.order`, with icons. Custom is hidden when the subpanel has no style components.

Presets that need word boundaries are hidden when no voice for the publication’s language reports them, and disabled when the current voice doesn’t. A hidden preset that is selected shows as the preset it matches without the word.

### StatefulReadAlongUtteranceStyle, StatefulReadAlongWordStyle

A style dropdown, for the sentence and word highlights. Only the styles the browser supports are offered. The word style doesn’t offer `mask`, is disabled when the current voice doesn’t report word boundaries, and is hidden when no voice for the publication’s language does.

Changing a style switches the highlight presets to custom.

### StatefulReadAlongProsodyGroup

The prosody group: the components in `readAlong.settings.prosody.main`, and an advanced button opening the subpanel when `subPanel` isn’t `null`.

`StatefulReadAlongProsodyGroupContainer` renders the subpanel’s components, from `subPanel`.

### StatefulReadAlongProsodyPresets

A radio group of the prosody presets in `readAlong.settings.prosody.presets.order`, with icons. Custom is hidden when the subpanel has no prosody components. Presets pausing after each page or spread are disabled in scroll mode.

Changing the rate, pause duration or auto pause, including from the rate action, switches the prosody presets to custom.

## Hooks

### useReadAlongInit

Manages the read-aloud navigator for a reader. The EPUB and WebPub readers call it once their visual navigator is set up.

```typescript
function useReadAlongInit(props: {
  navigatorReady: boolean;
  getVisualNavigator: () => ReadAloudNavigatorLoadProps["navigator"] | null; // e.g. useEpubNavigator().getInstance
}): void
```

**Features:**
- Loads the navigator when read along is activated, with the stored preferences and voice; destroys it when deactivated
- Keeps `readAlongPlayer.status`, `readAlongPlayer.isDetached` and the current voice’s capabilities up to date
- Runs the sleep timer countdown
- Recolors the highlight when the reading theme changes
- Resolves the auto pause of the prosody preset against the layout, pausing after each sentence outside fixed layout
- Deactivates read along when the reader unmounts

### useReadAlongMetadata

Stores the title, subtitle, authors, cover URL and main language of the publication for the players, as action targets don’t receive the publication.

```typescript
function useReadAlongMetadata(publication: Publication): void
```

### useReadAlongState

```typescript
function useReadAlongState(): {
  isActive: boolean;                  // A player is shown
  isExpanded: boolean;                // The expanded player is shown
  setActive: (value: boolean) => void;
  setExpanded: (value: boolean) => void;
  toggleActive: () => void;           // Starts or stops read along, as its trigger and shortcut do
}
```

Activating restores the layout read along was in when it was stopped (mini or expanded).

### useReadAlongMiniPlayerType

Returns what the mini player shows at the current breakpoint, from enum `ThMiniPlayerTypes` (`withMetadata` or `controlsOnly`).

### useHighlightPresets

Applies highlight presets and resolves styles against the reading theme.

```typescript
function useHighlightPresets(): {
  preset: ThReadAlongHighlightPresetKeys;   // Current preset
  displayedPreset: ThReadAlongHighlightPresetKeys | null; // Current preset, or the one it matches when hidden
  presetKeys: ThReadAlongHighlightPresetKeys[]; // Presets to display
  requiresWordBoundaries: (key: ThReadAlongHighlightPresetKeys) => boolean; // The preset needs word boundaries
  shouldApplyPresets: boolean;              // The presets component is displayed
  getStoredStyle: (key: HighlightStateKey) => ReadAloudDecorationStyle | undefined; // Style as the user picked it
  applyPreset: (preset: ThReadAlongHighlightPresetKeys) => Promise<void>;
  setStyle: (key: HighlightStateKey, value: ReadAloudDecorationStyle) => Promise<void>; // Switches to custom
  applyTheme: () => Promise<void>;          // Recolors the styles for the reading theme
}
```

A style without a tint takes its color from the default highlight theme for the reading theme, by the kind of style (fill, line, text or mask) and its role. The word’s color also depends on the kind of sentence style it is drawn on. See [Highlight Themes](../../../customization/ReadAlong.md#highlight-themes). A tint set in a preset or picked by the user is kept as-is. The navigator receives the styles without contrast adjustment.

## Accessibility

- Playback controls keep a left-to-right order, whatever the UI direction
- The mini player’s expand button is named after the publication and chapter
- The bottom sheet doesn’t trap focus while collapsed
- Dropdowns and radio groups support keyboard navigation
