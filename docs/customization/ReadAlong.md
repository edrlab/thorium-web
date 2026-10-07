# Read Along

Read along reads EPUB and WebPub publications aloud with text-to-speech, highlighting the sentence and word being read and turning pages as it goes. It is built on the TS-Toolkit `ReadAloudNavigator`, which uses `@readium/speech`.

Playback is by utterance, not by time: there is no duration, seek bar or time-based skipping. Skipping moves to the previous or next sentence.

It is configured in two places:

- `actions.keys.readAlong`: the reader action that starts read along, and where its players show;
- `readAlong`: the players’ own actions and the read-along settings.

## The Read Along Action

`ThActionsKeys.readAlong` starts and stops read along. Add it to `reflowOrder`, `fxlOrder` and/or `webPubOrder` like any other action (see [Actions](./Customization.md#actions)). The default shortcut is `Shift + Alt + R`, which starts or stops read along like the action’s button.

Once started, read along shows a mini player. Its tokens in `actions.keys.readAlong` extend the usual action tokens with `miniPlayer`:

- `miniPlayer.defaultType`: where the mini player shows, from enum `ThMiniPlayerTypes`:
  - `bottomBar`: in place of the progression in the reader’s bottom bar;
  - `bottomSheet`: in a bottom sheet that doesn’t block the page.
- `miniPlayer.breakpoints`: overrides of `defaultType` per breakpoint.

The mini player expands into the full player (cover, metadata, playback controls and actions):

- in the bottom bar, with its expand button or by pressing its title. The full player then opens in the sheet configured in `sheet` and `docked`, like any other action’s container;
- in the bottom sheet, by dragging the sheet up or using its drag indicator. The sheet itself becomes the full player, so `sheet` and `docked` don’t apply.

While the mini player is in the bottom bar, the bar stays visible in immersive mode.

For instance, the defaults:

```typescript
[ThActionsKeys.readAlong]: {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: {
    label: "R",
    keyCombos: [{ keyCode: 82, shift: true, alt: true }]
  },
  miniPlayer: {
    defaultType: ThMiniPlayerTypes.bottomBar,
    breakpoints: {
      [ThBreakpoints.compact]: ThMiniPlayerTypes.bottomSheet
    }
  },
  sheet: {
    defaultSheet: ThSheetTypes.dockedEnd,
    fallbackSheet: ThSheetTypes.popover,
    breakpoints: {}
  },
  docked: {
    dockable: ThDockingTypes.end,
    reserved: true,
    dragIndicator: false,
    width: 360,
    minWidth: 320,
    maxWidth: 450
  }
}
```

The full player is docked at the end by default, and its slot is [reserved](./Docking.md#reserved-actions) while read along is active. With a single dockable slot, it shows no docker.

## Player Actions

`readAlong.actions` configures the buttons of the players. Use enum `ThReadAlongActionKeys` to reference them: `volume`, `rate`, `sleepTimer` and `settings`.

The mini player and the expanded player each have their own display order, and share the same `keys`:

```typescript
readAlong: {
  actions: {
    miniPlayer: {
      displayOrder: [
        ThReadAlongActionKeys.settings
      ]
    },
    expanded: {
      displayOrder: [
        ThReadAlongActionKeys.volume,
        ThReadAlongActionKeys.rate,
        ThReadAlongActionKeys.sleepTimer,
        ThReadAlongActionKeys.settings
      ]
    },
    keys: {
      [ThReadAlongActionKeys.volume]: defaultReadAlongVolumeAction,
      [ThReadAlongActionKeys.rate]: defaultReadAlongRateAction,
      [ThReadAlongActionKeys.sleepTimer]: defaultReadAlongSleepTimerAction,
      [ThReadAlongActionKeys.settings]: defaultReadAlongSettingsAction
    }
  }
}
```

The rate action is disabled when the current voice can’t change its rate.

Each key accepts the tokens of reader actions or of audio primary actions, so a key can use either `popover` or `compactPopover` (see [`fallbackSheet`](./Docking.md#fallbacksheet)). By default, volume and rate use `compactPopover`, while the settings use `popover`, as its header holds the back button of the highlight submenu.

The settings menu leaves out a setting when the player it was opened from already shows the matching action. With the defaults, the mini player’s menu includes rate and volume, and the expanded player’s menu doesn’t. The matching actions and settings are listed in `readAlongActionSettings`: `rate` and `volume`.

## Settings

`readAlong.settings` configures the settings menu. Use enum `ThReadAlongKeys` to reference them.

### Display Order

The `order` array controls which settings are shown, and in what order:

```typescript
readAlong: {
  settings: {
    order: [
      ThReadAlongKeys.voice,
      ThReadAlongKeys.rate,
      ThReadAlongKeys.pitch,
      ThReadAlongKeys.volume,
      ThReadAlongKeys.highlightGroup,
      ThReadAlongKeys.autoPause,
      ThReadAlongKeys.pauseDuration,
      ThReadAlongKeys.verbosity,
      ThReadAlongKeys.language,
      ThReadAlongKeys.inlineContextualization
    ]
  }
}
```

- `voice`: a list of the voices for the publication’s main language, sorted by the TS-Toolkit.
- `rate`, `pitch`, `volume`, `pauseDuration`: ranges, see below.
- `highlightGroup`: the highlight presets, with a submenu for the highlight styles, see [Highlight](#highlight).
- `autoPause`: pause after each sentence, paragraph, page or spread. Spreads only apply to fixed layout, and pausing after each page isn’t available in scroll mode.
- `verbosity`: how much is announced besides the text, such as images, figures or tables.
- `language`: whether to switch voices for passages in another language.
- `inlineContextualization`: whether notes and page breaks are read where they appear in a sentence.

The options of these settings come from what the TS-Toolkit supports. The segmentation (by sentence) and the text format (plain) are pinned by Thorium and aren’t offered as settings.

### Keys

The `keys` object configures some of the settings.

`rate`, `pitch`, `volume` and `pauseDuration` accept a `ThSettingsRangePrefRequired` object, like [audio range settings](./audio/Settings.md#range-settings):

- `variant`: `slider`, `incrementedSlider`, or `numberField`. `rate` also supports `sliderWithPresets`.
- `range`, `step`, `placeholder`, and `presets` for `sliderWithPresets`.

The range is limited to what the TS-Toolkit supports. `pauseDuration` is in milliseconds.

`utteranceStyle` and `wordStyle` accept a `ThReadAlongStylePref` object, whose `swatches` are the colors offered for the sentence and word highlights.

`sleepTimer` configures the sleep timer action, like the [audio sleep timer](./audio/Settings.md#sleep-timer), with durations only.

For instance:

```typescript
readAlong: {
  settings: {
    keys: {
      [ThReadAlongKeys.rate]: {
        variant: ThSettingsRangeVariant.sliderWithPresets,
        range: [0.5, 3],
        step: 0.05,
        placeholder: ThSettingsRangePlaceholder.range,
        presets: [0.75, 1, 1.25, 1.5, 2]
      },
      [ThReadAlongKeys.utteranceStyle]: {
        swatches: ["#ffeb3b80", "#8bc34a80", "#4fc3f780"]
      },
      [ThReadAlongKeys.sleepTimer]: {
        variant: ThSettingsTimerVariant.presetList,
        presets: [15, 30, 45, 60, 90]
      }
    }
  }
}
```

### Highlight

`readAlong.settings.highlight` configures the highlight group, like the [spacing group](./Settings.md#spacing-optional). Use enum `ThReadAlongHighlightKeys` to reference its components: `highlightPresets`, `utteranceStyle` and `wordStyle`.

- `main`: the components shown in the settings menu. Defaults to the presets.
- `subPanel`: the components shown in the highlight submenu, opened with the “Customize” button. Defaults to the presets, then the sentence and word styles. Set it to `null` to remove the submenu.
- `header`: the header of the submenu, from enum `ThSheetHeaderVariant`. Defaults to `previous`, a back button.
- `presets`: the highlight presets.

Presets only set which styles apply, using enum `ThReadAlongHighlightPresetKeys`:

- `sentenceAndWord`: highlights the sentence and the word;
- `word`: highlights the word only;
- `mask`: dims everything but the sentence, and highlights the word. It is labelled “Focus”;
- `custom`: selected automatically when the user changes a style in the submenu. It isn’t configured in `keys`, and is hidden when the submenu has no style components.

```typescript
readAlong: {
  settings: {
    highlight: {
      header: ThSheetHeaderVariant.previous,
      main: [ThReadAlongHighlightKeys.highlightPresets],
      subPanel: [
        ThReadAlongHighlightKeys.highlightPresets,
        ThReadAlongHighlightKeys.utteranceStyle,
        ThReadAlongHighlightKeys.wordStyle
      ],
      presets: {
        order: [
          ThReadAlongHighlightPresetKeys.sentenceAndWord,
          ThReadAlongHighlightPresetKeys.word,
          ThReadAlongHighlightPresetKeys.mask,
          ThReadAlongHighlightPresetKeys.custom
        ],
        keys: {
          [ThReadAlongHighlightPresetKeys.sentenceAndWord]: {
            utteranceStyle: DecorationStyleType.Highlight,
            wordStyle: DecorationStyleType.Highlight
          },
          [ThReadAlongHighlightPresetKeys.word]: {
            utteranceStyle: false,
            wordStyle: DecorationStyleType.Highlight
          },
          [ThReadAlongHighlightPresetKeys.mask]: {
            utteranceStyle: DecorationStyleType.Mask,
            wordStyle: DecorationStyleType.Highlight
          }
        }
      }
    }
  }
}
```

A style is a `DecorationStyleType` from `@readium/navigator`, or `false` for none. The word style can’t be `mask`, and is disabled when the current voice doesn’t report word boundaries.

The colors of the presets come from the reading theme, so the highlight changes with it: see the `readAlong*` tokens in [Theming](./Theming.md#keys-and-tokens). A color the user picks in the submenu is used as-is, whatever the theme.

The presets are only applied when `highlightGroup` is in `order` and `highlightPresets` is in its `main` or `subPanel`.

## Validation

`createPreferences` warns, without throwing, when:

- a key in either `displayOrder` has no entry in `readAlong.actions.keys`;
- a preset in `highlight.presets.order` has no entry in its `keys`, except `custom`;
- a range preset can’t be reached with its `range` and `step`.

## Extending Read Along

Read along accepts custom actions and settings, declared with the `readAlongAction` and `readAlong` customizable keys (see [Custom Action Keys](./HandlingPreferences.md#custom-action-keys)).

- **Actions:** add your key to the display order of either player, configure its tokens in `readAlong.actions.keys`, and register its Trigger/Target pair in the `readAlongActions` map of a plugin.
- **Settings:** add your key to `readAlong.settings.order`, and register its component in the `settings` map of a plugin. Its entry in `readAlong.settings.keys` is typed as a range setting. Its value lives in your own state, as the `readAlongSettings` slice only holds built-in preferences.
- **Highlight components:** register a component with `type: "readAlongHighlight"` under one of the `ThReadAlongHighlightKeys` to replace the built-in one in the highlight group.

```typescript
{
  id: "my-plugin",
  name: "My Plugin",
  components: {
    readAlongActions: {
      myReadAlongAction: {
        Trigger: MyReadAlongTrigger,
        Target: MyReadAlongContainer
      }
    },
    settings: {
      myReadAlongSetting: {
        Comp: MyReadAlongSetting
      }
    }
  }
}
```

Keys without a component are skipped.
