# Read Along

Read along reads EPUB and WebPub publications aloud with text-to-speech, highlighting the sentence and word being read and turning pages as it goes. It is built on the TS-Toolkit `ReadAloudNavigator`, which uses `@readium/speech`.

Playback is by utterance, not by time: there is no duration, seek bar or time-based skipping. Skipping moves to the previous or next sentence.

It is configured in three places:

- `actions.keys.readAlong`: the reader action that starts read along, and where its players show;
- `readAlong`: the players’ own actions and the read-along settings;
- the reader’s `readAlong` prop: the Guided Navigation provider and speech engine, see [Provider and Engine](#provider-and-engine).

## What Is Read

By default, read along reads each resource from the publication’s [Guided Navigation](https://github.com/readium/guided-navigation) document when it has one, and from the resource’s markup otherwise.

Set `readAlong.generateFromMarkup` to `true` to always read from the markup, ignoring the Guided Navigation document.

```typescript
readAlong: {
  ...defaultReadAlongPreferences,
  generateFromMarkup: true
}
```

It applies when read along starts.

## Reading From a Press

While read along is active, clicking or tapping content (text, an image…) reads from there, including in another resource than the one being read, for instance after pausing and turning pages. Presses on empty space, links and other interactive elements, or content that isn’t read, are handled as usual, so turning pages keeps working.

Set `readAlong.readFromPointer` to `false` to turn this off.

```typescript
readAlong: {
  ...defaultReadAlongPreferences,
  readFromPointer: false
}
```

It applies when read along starts.

## Where Reading Starts

By default, read along starts from the beginning of the current resource.

Set `readAlong.startInViewport` to `true` to start from the first sentence starting on screen instead, or the one going on at the top when none does. It has no effect in fixed layout.

```typescript
readAlong: {
  ...defaultReadAlongPreferences,
  startInViewport: true
}
```

It applies when read along starts.

## Keyboard

While read along is active, Space pauses and resumes it instead of turning pages or scrolling. Shift + Space no longer goes back a page in paginated EPUB.

## Navigating While Reading

By default, users can scroll, turn pages and navigate while read along is playing. It then stops following what is read until they are back on it, or play, skip, or read from a press.

Set `readAlong.detachable` to `false` to lock navigation while read along is playing or loading: scrolling, swiping and links in the content, as well as page turns, the table of contents, go to position, and previous/next links in the reader. Read along still turns pages as it goes, and pressing content still reads from there. Everything is unlocked when read along is paused or stopped.

```typescript
readAlong: {
  ...defaultReadAlongPreferences,
  detachable: false
}
```

It applies when read along starts.

## Keeping the Screen Awake

By default, the screen is kept awake while read along is playing, where the browser grants a screen wake lock.

Set `readAlong.keepAwake` to `false` to let the screen turn off as usual:

```typescript
readAlong: {
  ...defaultReadAlongPreferences,
  keepAwake: false
}
```

It applies when read along starts.

## Provider and Engine

The reader’s `readAlong` prop, for the `"epub"` and `"webPub"` profiles, replaces what the TS-Toolkit `ReadAloudNavigator` uses by default. Both are factories, called with the publication each time read along starts:

- `provider`: returns the `GuidedNavigationProvider` giving what is read. It replaces the default one, so `generateFromMarkup` is then ignored.
- `engine`: returns the `ReadiumSpeechPlaybackEngine` speaking it. Defaults to the TS-Toolkit’s Web Speech engine. A new engine is needed on each start, as it is destroyed when read along stops.

```tsx
<StatefulReaderWrapper
  profile="epub"
  publication={ publication }
  localDataKey={ localDataKey }
  readAlong={{
    provider: (publication) => new MyGuidedNavigationProvider(publication),
    engine: (publication) => new MySpeechEngine(publication.metadata.languages)
  }}
/>
```

## The Read Along Action

`ThActionsKeys.readAlong` starts and stops read along. Add it to `reflowOrder`, `fxlOrder` and/or `webPubOrder` like any other action (see [Actions](./Customization.md#actions)). The default shortcut is `Shift + Alt + R`, which starts or stops read along like the action’s button.

Once started, read along shows a mini player. Its tokens in `actions.keys.readAlong` extend the usual action tokens with `miniPlayer`:

- `miniPlayer.defaultType`: what the mini player shows, from enum `ThMiniPlayerTypes`:
  - `withMetadata`: the cover, title and current chapter, along with the playback controls and actions;
  - `controlsOnly`: only the playback controls, centered, and actions.
- `miniPlayer.breakpoints`: overrides of `defaultType` per breakpoint.

The mini player shows in place of the progression in the reader’s bottom bar, which stays visible in immersive mode. It expands into the full player (cover, metadata, playback controls and actions) with its expand button or by pressing its title. The full player then opens in the sheet configured in `sheet` and `docked`, like any other action’s container.

For instance, the defaults:

```typescript
[ThActionsKeys.readAlong]: {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: {
    label: "R",
    keyCombos: [{ keyCode: 82, shift: true, alt: true }]
  },
  miniPlayer: {
    defaultType: ThMiniPlayerTypes.withMetadata,
    breakpoints: {
      [ThBreakpoints.compact]: ThMiniPlayerTypes.controlsOnly
    }
  },
  sheet: {
    defaultSheet: ThSheetTypes.dockedEnd,
    fallbackSheet: ThSheetTypes.popover,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.bottomSheet
    }
  },
  snapped: {
    maxHeight: "full-height"
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
      ],
      collapse: true
    },
    expanded: {
      displayOrder: [
        ThReadAlongActionKeys.volume,
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

The mini player’s `collapse` works like the [collapsibility of reader actions](./Customization.md#collapsibility-and-visibility). By default, it is `true`: the actions take the space left in the mini player, and those that don’t fit move to an overflow menu, depending on their `visibility`.

The rate action is disabled when the current voice can’t change its rate.

Each key accepts the tokens of reader actions or of audio primary actions, so a key can use either `popover` or `compactPopover` (see [`fallbackSheet`](./Docking.md#fallbacksheet)). By default, volume and rate use `compactPopover`, while the settings use `popover`, as its header holds the back button of the voice, highlight, prosody and verbosity subpanels.

## Settings

`readAlong.settings` configures the settings. Use enum `ThReadAlongKeys` to reference them.

### Display Order

The `order` array controls which settings are shown, and in what order:

```typescript
readAlong: {
  settings: {
    order: [
      ThReadAlongKeys.voiceGroup,
      ThReadAlongKeys.prosodyGroup,
      ThReadAlongKeys.highlightGroup,
      ThReadAlongKeys.verbosityGroup
    ]
  }
}
```

- `voiceGroup`: the voice, with a subpanel for the language override, voice, additional voices, volume, pitch and language, see [Voice](#voice).
- `prosodyGroup`: the prosody presets, with a subpanel for the rate, pause duration and auto pause, see [Prosody](#prosody).
- `highlightGroup`: the highlight presets, with a subpanel for the highlight styles and keeping the sentence centered, see [Highlight](#highlight).
- `verbosityGroup`: the verbosity, with a subpanel for the verbosity, notes and page breaks, see [Verbosity](#verbosity).

The options of these settings come from what the TS-Toolkit supports. The segmentation (by sentence) and the text format (plain) are pinned by Thorium and aren’t offered as settings.

### Keys

The `keys` object configures some of the settings.

`rate`, `pitch`, `volume` and `pauseDuration` accept a `ThSettingsRangePrefRequired` object, like [audio range settings](./audio/Settings.md#range-settings):

- `variant`: `slider`, `incrementedSlider`, or `numberField`. `rate` also supports `sliderWithPresets`.
- `range`, `step`, `placeholder`, and `presets` for `sliderWithPresets`.

The range is limited to what the TS-Toolkit supports. `pauseDuration` is in milliseconds.

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
      [ThReadAlongKeys.sleepTimer]: {
        variant: ThSettingsTimerVariant.presetList,
        presets: [15, 30, 45, 60, 90]
      }
    }
  }
}
```

### Voice

`readAlong.settings.voice` configures the voice group, like the [text group](./Settings.md#text-optional). Use enum `ThReadAlongVoiceKeys` to reference its components:

- `voice`: a list of the voices for the publication’s main language, sorted by the TS-Toolkit;
- `additionalVoices`: a collapsed “Additional languages” section with a list of voices for each other language of the publication, rendered only when its metadata declares several. Content in a language without a voice chosen is spoken with one the navigator picks;
- `volume`, `pitch`: ranges, see [Keys](#keys);
- `language`: whether to switch voices for passages in another language;
- `languageOverride`: the language the publication is actually in, when its metadata is wrong. It lists the languages the browser has voices for, and only loads the voices of the one picked. It is stored for the publication only, never carried over to another.

Its options are the same as the highlight group’s, without presets:

- `main`: the components shown in the settings’ main panel. Defaults to the voice.
- `subPanel`: the components shown in the voice subpanel, opened with the group’s advanced button. Defaults to the language override, voice, additional voices, volume, pitch and language. Set it to `null` to remove the subpanel.
- `header`: the header of the subpanel, from enum `ThSheetHeaderVariant`. Defaults to `previous`, a back button.

```typescript
readAlong: {
  settings: {
    voice: {
      header: ThSheetHeaderVariant.previous,
      main: [ThReadAlongVoiceKeys.voice],
      subPanel: [
        ThReadAlongVoiceKeys.languageOverride,
        ThReadAlongVoiceKeys.voice,
        ThReadAlongVoiceKeys.additionalVoices,
        ThReadAlongVoiceKeys.volume,
        ThReadAlongVoiceKeys.pitch,
        ThReadAlongVoiceKeys.language
      ]
    }
  }
}
```

### Highlight

`readAlong.settings.highlight` configures the highlight group, like the [spacing group](./Settings.md#spacing-optional). Use enum `ThReadAlongHighlightKeys` to reference its components: `highlightPresets`, `utteranceStyle`, `wordStyle` and `keepCentered`.

- `main`: the components shown in the settings’ main panel. Defaults to the presets.
- `subPanel`: the components shown in the highlight subpanel, opened with the group’s advanced button. Defaults to the presets, the sentence and word styles, then keeping the sentence centered. Set it to `null` to remove the subpanel.
- `header`: the header of the subpanel, from enum `ThSheetHeaderVariant`. Defaults to `previous`, a back button.
- `presets`: the highlight presets. Defaults to the ones below.

Presets set the sentence and word styles, using enum `ThReadAlongHighlightPresetKeys`:

- `sentenceAndWord`: highlights the sentence and the word;
- `sentence`: highlights the sentence only;
- `word`: highlights the word only;
- `mask`: dims everything but the sentence, and highlights the word;
- `none`: highlights nothing. It can’t be set in `keys`, as it has nothing to configure, but can be ordered or removed like the others;
- `custom`: selected automatically when the user changes a style in the subpanel. It isn’t configured in `keys`, and is hidden when the subpanel has no style components.

A preset needs word boundaries when, without its word style, it highlights nothing or matches another preset. With the defaults, these are `sentenceAndWord` and `word`. They are hidden when no voice for the publication’s language reports word boundaries, e.g. on Android, and disabled when the current voice doesn’t.

```typescript
readAlong: {
  settings: {
    highlight: {
      header: ThSheetHeaderVariant.previous,
      main: [ThReadAlongHighlightKeys.highlightPresets],
      subPanel: [
        ThReadAlongHighlightKeys.highlightPresets,
        ThReadAlongHighlightKeys.utteranceStyle,
        ThReadAlongHighlightKeys.wordStyle,
        ThReadAlongHighlightKeys.keepCentered
      ],
      presets: {
        order: [
          ThReadAlongHighlightPresetKeys.sentenceAndWord,
          ThReadAlongHighlightPresetKeys.sentence,
          ThReadAlongHighlightPresetKeys.word,
          ThReadAlongHighlightPresetKeys.mask,
          ThReadAlongHighlightPresetKeys.none,
          ThReadAlongHighlightPresetKeys.custom
        ],
        keys: {
          [ThReadAlongHighlightPresetKeys.sentenceAndWord]: {
            utteranceStyle: { type: DecorationStyleType.Highlight },
            wordStyle: { type: DecorationStyleType.Highlight }
          },
          [ThReadAlongHighlightPresetKeys.sentence]: {
            utteranceStyle: { type: DecorationStyleType.Highlight },
            wordStyle: false
          },
          [ThReadAlongHighlightPresetKeys.word]: {
            utteranceStyle: false,
            wordStyle: { type: DecorationStyleType.Highlight }
          },
          [ThReadAlongHighlightPresetKeys.mask]: {
            utteranceStyle: { type: DecorationStyleType.Mask },
            wordStyle: { type: DecorationStyleType.Highlight }
          }
        }
      }
    }
  }
}
```

A style is a `BuiltinDecorationStyle` from `@readium/navigator`, without `enforceContrast`, or `false` for none: its `type`, and optionally its `tint`, `layout`, `width` and `expand`. A style without a `tint` takes the reading theme’s color. The word style can’t be `mask`, and is disabled when the current voice doesn’t report word boundaries.

The colors of the presets come from the reading theme, so the highlight changes with it: see the `readAlong*` tokens in [Theming](./Theming.md#keys-and-tokens). A color the user picks in the subpanel is used as-is, whatever the theme.

The presets are only applied when `highlightGroup` is in `order` and `highlightPresets` is in its `main` or `subPanel`.

`keepCentered` keeps the sentence being read in the middle of the screen when scrolling, instead of following it once it goes out of view. It is not displayed for fixed-layout publications.

### Prosody

`readAlong.settings.prosody` configures the prosody group, like the highlight group. Use enum `ThReadAlongProsodyKeys` to reference its components:

- `prosodyPresets`: the prosody presets;
- `rate`, `pauseDuration`: ranges, see [Keys](#keys);
- `autoPause`: pause after each sentence, paragraph, page or spread. Spreads only apply to fixed layout, and pausing after each page isn’t available in scroll mode.

Its options are the same as the highlight group’s:

- `main`: the components shown in the settings’ main panel. Defaults to the presets.
- `subPanel`: the components shown in the prosody subpanel, opened with the group’s advanced button. Defaults to the presets, then the rate, pause duration and auto pause. Set it to `null` to remove the subpanel.
- `header`: the header of the subpanel, from enum `ThSheetHeaderVariant`. Defaults to `previous`, a back button.
- `presets`: the prosody presets. Defaults to the ones below.

Presets set the rate, pause duration and auto pause, using enum `ThReadAlongProsodyPresetKeys`:

- `default`: the defaults of the TS-Toolkit, a rate of 1, a 300ms pause and no auto pause. Its values always come from the TS-Toolkit, so it can’t be set in `keys`, and isn’t meant to be: use another preset for your own values. It can be ordered or removed like the others;
- `slow`: a rate of 0.75, with an 800ms pause;
- `fast`: a rate of 1.15, with a 300ms pause;
- `relaxed`: pauses after each spread in fixed layout, and after each page otherwise, at the default rate and pause duration;
- `custom`: selected automatically when the user changes the rate, pause duration or auto pause, including from the rate action. It isn’t configured in `keys`, and is hidden when the subpanel has no prosody components.

A value a preset leaves out uses the TS-Toolkit’s default. An auto pause of `spread` pauses after each page outside fixed layout, and a preset pausing after each page or spread is disabled in scroll mode.

```typescript
readAlong: {
  settings: {
    prosody: {
      header: ThSheetHeaderVariant.previous,
      main: [ThReadAlongProsodyKeys.prosodyPresets],
      subPanel: [
        ThReadAlongProsodyKeys.prosodyPresets,
        ThReadAlongProsodyKeys.rate,
        ThReadAlongProsodyKeys.pauseDuration,
        ThReadAlongProsodyKeys.autoPause
      ],
      presets: {
        order: [
          ThReadAlongProsodyPresetKeys.default,
          ThReadAlongProsodyPresetKeys.slow,
          ThReadAlongProsodyPresetKeys.fast,
          ThReadAlongProsodyPresetKeys.relaxed,
          ThReadAlongProsodyPresetKeys.custom
        ],
        keys: {
          [ThReadAlongProsodyPresetKeys.slow]: {
            rate: 0.85,
            pauseDuration: 500
          },
          [ThReadAlongProsodyPresetKeys.fast]: {
            rate: 1.25,
            pauseDuration: 150
          },
          [ThReadAlongProsodyPresetKeys.relaxed]: {
            autoPause: ReadAloudAutoPause.spread
          }
        }
      }
    }
  }
}
```

The presets are only applied when `prosodyGroup` is in `order` and `prosodyPresets` is in its `main` or `subPanel`.

### Verbosity

`readAlong.settings.verbosity` configures the verbosity group, like the voice group. Use enum `ThReadAlongVerbosityKeys` to reference its components:

- `verbosity`: how much is announced besides the text, such as images, figures or tables. Its values are the TS-Toolkit’s verbosity presets, and aren’t configurable. It is kept separately for reflowable and fixed-layout publications, like the reading theme. `custom` is offered when `subPanel` has components to customize it with, and appears once one of them is changed;
- `notes`: whether notes are read never, where they are referenced, or after the sentence referencing them;
- `pageBreaks`: whether page breaks are read never, where they appear, or after the sentence they appear in.

Reading notes or page breaks never, or again, switches verbosity to `custom`, starting from what the current preset reads. Picking a preset again resets them to that preset’s.

Its options are the same as the voice group’s:

- `main`: the components shown in the settings’ main panel. Defaults to the verbosity.
- `subPanel`: the components shown in the verbosity subpanel, opened with the group’s advanced button. Defaults to the verbosity, notes and page breaks. Set it to `null` to remove the subpanel.
- `header`: the header of the subpanel, from enum `ThSheetHeaderVariant`. Defaults to `previous`, a back button.

```typescript
readAlong: {
  settings: {
    verbosity: {
      header: ThSheetHeaderVariant.previous,
      main: [ThReadAlongVerbosityKeys.verbosity],
      subPanel: [
        ThReadAlongVerbosityKeys.verbosity,
        ThReadAlongVerbosityKeys.notes,
        ThReadAlongVerbosityKeys.pageBreaks
      ]
    }
  }
}
```

## Validation

`createPreferences` warns, without throwing, when:

- a key in either `displayOrder` has no entry in `readAlong.actions.keys`;
- a preset in `highlight.presets.order` has no entry in its `keys`, except `none` and `custom`;
- a preset in `prosody.presets.order` has no entry in its `keys`, except `default` and `custom`;
- a range preset can’t be reached with its `range` and `step`.

## Extending Read Along

Read along accepts custom actions and settings, declared with the `readAlongAction`, `readAlong`, `readAlongVoice`, `readAlongHighlight`, `readAlongProsody` and `readAlongVerbosity` customizable keys (see [Custom Action Keys](./HandlingPreferences.md#custom-action-keys)).

- **Actions:** add your key to the display order of either player, configure its tokens in `readAlong.actions.keys`, and register its Trigger/Target pair in the `readAlongActions` map of a plugin.
- **Settings:** add your key to `readAlong.settings.order`, and register its component in the `settings` map of a plugin. Its entry in `readAlong.settings.keys` is typed as a range setting. Its value lives in your own state, as the `readAlongSettings` slice only holds built-in preferences.
- **Voice components:** add your key to `readAlong.settings.voice.main` or `subPanel`, and register its component with `type: "readAlongVoice"`. Registering under one of the `ThReadAlongVoiceKeys` replaces the built-in component.
- **Highlight components:** add your key to `readAlong.settings.highlight.main` or `subPanel`, and register its component with `type: "readAlongHighlight"`. A preset can set a value for it in `highlight.presets.keys`. Registering under one of the `ThReadAlongHighlightKeys` replaces the built-in component.
- **Prosody components:** add your key to `readAlong.settings.prosody.main` or `subPanel`, and register its component with `type: "readAlongProsody"`. A preset can set a value for it in `prosody.presets.keys`. Registering under one of the `ThReadAlongProsodyKeys` replaces the built-in component.
- **Verbosity components:** add your key to `readAlong.settings.verbosity.main` or `subPanel`, and register its component with `type: "readAlongVerbosity"`. Registering under one of the `ThReadAlongVerbosityKeys` replaces the built-in component.

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
