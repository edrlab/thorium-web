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
- Opens when the mini player in the bottom bar is expanded, with a collapse button in its header
- The close button stops read along
- Reserves its dock slot only while read along is active
- Stays closed when the mini player is in a bottom sheet, which hosts the expanded player itself

## Players

### StatefulReadAlongMiniPlayer

The mini player: an expand button (bottom bar only) and a button stopping read along, cover, title, current chapter, previous sentence / play-pause / next sentence, and the mini player’s actions.

**Features:**
- Expand and close buttons, and the actions, are toolbars navigated with arrow keys
- Renders the actions in `readAlong.actions.miniPlayer.displayOrder`, collapsing them into an overflow menu per `readAlong.actions.miniPlayer.collapse`
- When narrower than 480px, only the cover shows, the title and chapter staying available to assistive technologies
- In the bottom bar, pressing the title or the expand button expands the player
- In the bottom sheet, the title is plain text so that it can be dragged

### StatefulReadAlongPlayer

The expanded player: cover, title, authors, current chapter, playback controls and the expanded player’s actions (`StatefulReadAlongMediaActions`).

### StatefulReadAlongSheet

A bottom sheet hosting both players, for the `bottomSheet` mini player placement. It doesn’t block the page while collapsed.

**Props:**
- `isOpen`: Whether the sheet is shown, i.e. read along is active and the placement is `bottomSheet`
- `style`: Style of the sheet’s root. `zIndex` defaults to `9998`, one below other bottom sheets so they open on top of it; set it higher to keep the sheet on top

**Features:**
- Collapsed to the mini player’s height, measured as it renders
- Expands to full height by dragging, or pressing the drag indicator, or with its arrow keys; collapses the same way, or with Escape
- Shows the expanded player while dragging up, inert until it is expanded
- Contains focus and locks page scrolling only while expanded
- Labels the drag indicator with the action it performs (expand or collapse)

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

## Settings Action

### StatefulReadAlongSettingsTrigger

Trigger of the `ThReadAlongActionKeys.settings` action.

### StatefulReadAlongSettingsContainer

The read-along settings menu.

**Props:**
- `triggerRef`: Reference to the trigger element
- `placement`: Popover placement, `"top"` by default

**Features:**
- Renders the settings in `readAlong.settings.order`
- Leaves out the components of the highlight and prosody groups, which render them themselves
- Switches to the highlight or prosody submenu, with a back button in its header; Escape returns to the menu
- Returns to the menu when closed

## Settings Components

All settings components accept `standalone` (`true` by default), like the [EPUB settings components](./Settings.md). They submit their value to the read-aloud navigator, then store the value it applied in the `readAlongSettings` slice. Changes are ignored until read along has loaded, and all but the range settings are disabled until then.

### StatefulReadAlongVoice

A dropdown of the voices for the publication’s main language, as filtered and sorted by the TS-Toolkit.

### StatefulReadAlongRate, StatefulReadAlongPitch, StatefulReadAlongVolume, StatefulReadAlongPauseDuration

Range settings, rendered according to their `variant` in `readAlong.settings.keys`. Their range is limited to what the TS-Toolkit supports, and they show the navigator’s value until the user sets one.

### StatefulReadAlongAutoPause, StatefulReadAlongVerbosity, StatefulReadAlongLanguage

Dropdowns of the values supported by the TS-Toolkit. Auto pause leaves out pausing after each block, and disables pausing after each page in scroll mode; verbosity doesn’t offer `custom`.

### StatefulReadAlongInlineContextualization

A switch reading notes and page breaks where they appear in a sentence.

### StatefulReadAlongHighlightGroup

The highlight group: the components in `readAlong.settings.highlight.main`, and an advanced button opening the submenu when `subPanel` isn’t `null`.

`StatefulReadAlongHighlightGroupContainer` renders the submenu’s components, from `subPanel`.

### StatefulReadAlongHighlightPresets

A radio group of the highlight presets in `readAlong.settings.highlight.presets.order`, with icons. Custom is hidden when the submenu has no style components.

Presets that need word boundaries are hidden when no voice for the publication’s language reports them, and disabled when the current voice doesn’t. A hidden preset that is selected shows as the preset it matches without the word.

### StatefulReadAlongUtteranceStyle, StatefulReadAlongWordStyle

A style dropdown and a color swatch picker, for the sentence and word highlights. Only the styles the browser supports are offered. The word style doesn’t offer `mask`, is disabled when the current voice doesn’t report word boundaries, and is hidden when no voice for the publication’s language does.

Changing a style switches the highlight presets to custom.

### StatefulReadAlongProsodyGroup

The prosody group: the components in `readAlong.settings.prosody.main`, and an advanced button opening the submenu when `subPanel` isn’t `null`.

`StatefulReadAlongProsodyGroupContainer` renders the submenu’s components, from `subPanel`.

### StatefulReadAlongProsodyPresets

A radio group of the prosody presets in `readAlong.settings.prosody.presets.order`, with icons. Custom is hidden when the submenu has no prosody components. Presets pausing after each page or spread are disabled in scroll mode.

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
- Keeps `readAlongPlayer.status` and the current voice’s capabilities up to date
- Runs the sleep timer countdown
- Recolors the highlight when the reading theme changes
- Resolves the auto pause of the prosody preset against the layout, pausing after each page outside fixed layout
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

### useReadAlongPlacement

Returns where the mini player shows at the current breakpoint, from enum `ThMiniPlayerTypes` (`bottomBar` or `bottomSheet`).

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
  applyTheme: () => Promise<void>;          // Recolors the styles with the reading theme
}
```

A style without a tint takes the reading theme’s color: `readAlongWord` for the word, `readAlongMask` for the mask, `readAlongUtterance` otherwise. A tint set in a preset or picked by the user is kept as-is. The navigator receives the styles without contrast adjustment.

## Accessibility

- Playback controls keep a left-to-right order, whatever the UI direction
- The mini player’s expand button is named after the publication and chapter
- The bottom sheet doesn’t trap focus while collapsed
- Dropdowns, radio groups and swatch pickers support keyboard navigation
