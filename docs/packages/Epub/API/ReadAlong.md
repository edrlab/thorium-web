# Read Along Components API Reference

This document details the Read Along components, which read EPUB and WebPub publications aloud. They are exported from the `epub`, `webpub` and `reader` packages.

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

The mini player: title, current chapter, previous sentence / play-pause / next sentence, the mini player’s actions, and a button stopping read along.

**Features:**
- Renders the actions in `readAlong.actions.miniPlayer.displayOrder`
- In the bottom bar, pressing the title or the expand button expands the player
- In the bottom sheet, the title is plain text so that it can be dragged

### StatefulReadAlongPlayer

The expanded player: cover, title, authors, current chapter, playback controls and the expanded player’s actions (`StatefulReadAlongMediaActions`).

### StatefulReadAlongSheet

A bottom sheet hosting both players, for the `bottomSheet` mini player placement. It doesn’t block the page while collapsed.

**Props:**
- `isOpen`: Whether the sheet is shown, i.e. read along is active and the placement is `bottomSheet`

**Features:**
- Collapsed to the mini player’s height, measured as it renders
- Expands to full height by dragging, or pressing the drag indicator, or with its arrow keys; collapses the same way, or with Escape
- Shows the expanded player while dragging up, inert until it is expanded
- Contains focus and locks page scrolling only while expanded
- Labels the drag indicator with the action it performs (expand or collapse)

### StatefulReadAlongMediaActions

The expanded player’s actions bar. Renders the actions in `readAlong.actions.expanded.displayOrder` from the plugin `readAlongActions` map. Keys without a component are skipped.

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
- Leaves out the components of the highlight group, which renders them itself
- Leaves out a setting when the current player already shows the matching action (`readAlongActionSettings`)
- Switches to the highlight submenu, with a back button in its header; Escape returns to the menu
- Returns to the menu when closed

## Settings Components

All settings components accept `standalone` (`true` by default), like the [EPUB settings components](./Settings.md). They submit their value to the read-aloud navigator, then store the value it applied in the `readAlongSettings` slice. Changes are ignored until read along has loaded, and all but the range settings are disabled until then.

### StatefulReadAlongVoice

A dropdown of the voices for the publication’s main language, as filtered and sorted by the TS-Toolkit.

### StatefulReadAlongRate, StatefulReadAlongPitch, StatefulReadAlongVolume, StatefulReadAlongPauseDuration

Range settings, rendered according to their `variant` in `readAlong.settings.keys`. Their range is limited to what the TS-Toolkit supports, and they show the navigator’s value until the user sets one.

### StatefulReadAlongAutoPause, StatefulReadAlongVerbosity, StatefulReadAlongLanguage

Dropdowns of the values supported by the TS-Toolkit. Auto pause disables pausing after each page in scroll mode; verbosity doesn’t offer `custom`.

### StatefulReadAlongInlineContextualization

A switch reading notes and page breaks where they appear in a sentence.

### StatefulReadAlongHighlightGroup

The highlight group: the components in `readAlong.settings.highlight.main`, and a “Customize” button opening the submenu when `subPanel` isn’t `null`.

`StatefulReadAlongHighlightGroupContainer` renders the submenu’s components, from `subPanel`.

### StatefulReadAlongHighlightPresets

A radio group of the highlight presets in `readAlong.settings.highlight.presets.order`, with icons. Custom is hidden when the submenu has no style components.

### StatefulReadAlongUtteranceStyle, StatefulReadAlongWordStyle

A style dropdown and a color swatch picker, for the sentence and word highlights. Only the styles the browser supports are offered. The word style doesn’t offer `mask`, and is disabled when the current voice doesn’t report word boundaries.

Changing a style switches the highlight presets to custom.

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
  presetKeys: ThReadAlongHighlightPresetKeys[]; // Presets to display
  shouldApplyPresets: boolean;              // The presets component is displayed
  getStoredStyle: (key: HighlightStateKey) => ReadAloudDecorationStyle | undefined; // Style as the user picked it
  applyPreset: (preset: ThReadAlongHighlightPresetKeys) => Promise<void>;
  setStyle: (key: HighlightStateKey, value: ReadAloudDecorationStyle) => Promise<void>; // Switches to custom
  applyTheme: () => Promise<void>;          // Recolors the styles with the reading theme
}
```

A style without a tint takes the reading theme’s color: `readAlongWord` for the word, `readAlongMask` for the mask, `readAlongUtterance` otherwise. A tint the user picked is kept as-is. The navigator receives the styles without contrast adjustment.

## Accessibility

- Playback controls keep a left-to-right order, whatever the UI direction
- The mini player’s expand button is named after the publication and chapter
- The bottom sheet doesn’t trap focus while collapsed
- Dropdowns, radio groups and swatch pickers support keyboard navigation
