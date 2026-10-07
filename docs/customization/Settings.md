# Settings

Settings can be customized extensively, and even nested in advanced components. The values for some settings can be customized as well.

## Display Order

You can customize the order of the settings in the `reflowOrder`, `fxlOrder`, `webPubOrder`, or `divinaOrder` arrays, and remove them as well if you don’t want to expose some. 

Enum `ThSettingsKeys` is provided to keep things consistent across the entire codebase.

For instance:

```
settings: {
  ...
  reflowOrder: [
    ThSettingsKeys.zoom,
    ThSettingsKeys.fontFamily,
    ThSettingsKeys.theme,
    ThSettingsKeys.lineHeight,
    ThSettingsKeys.layout,
    ThSettingsKeys.columns
  ],
  fxlOrder: [
    ThSettingsKeys.zoom,
    ThSettingsKeys.theme,
    ThSettingsKeys.columns
  ],
  divinaOrder: [
    ThSettingsKeys.theme,
    ThSettingsKeys.layout,
    ThSettingsKeys.divinaSpreads
  ]
}
```

Note that if you are using a standalone component in an Advanced component (either in `main` or `displayOrder`), it will be filtered so that it is not rendered twice.

### Standalone components

All settings components are standalone by default, which means you can organise them as you see fit to build your own Settings panel.

### Advanced components

`ThSettingsKeys.text` and `ThSettingsKeys.spacing` are two advanced components in which you can nest other components.

Enums `ThTextSettingsKeys` and `ThSpacingSettingsKeys` list which components can be nested in these two.

When used, a button will be added to access the nested components.


## Script Mode Filtering

Settings that are not applicable to the current publication's script mode are automatically hidden. `useFilteredPreferenceKeys` is a drop-in replacement for `usePreferenceKeys` that applies this filtering based on `state.publication.scriptMode`:

| Script mode | Hidden settings |
|---|---|
| `ltr` | `noRuby` |
| `rtl` | `hyphens`, `letterSpacing`, `textNormalize`, `noRuby` |
| `cjk-horizontal` | `textAlign`, `hyphens`, `ligatures`, `paragraphIndent`, `wordSpacing`, `textNormalize` |
| `cjk-vertical` | Same as CJK-horizontal + `layout`; also hides `columns` when not FXL |
| `mongolian-vertical` | Same as CJK-vertical |

```tsx
import { useFilteredPreferenceKeys } from "@edrlab/thorium-web/core/preferences";

const keys = useFilteredPreferenceKeys();
// keys.reflowSettingsKeys — already filtered for the current script mode
```

> [!NOTE]
> `divinaOrder` is not filtered, since Divina publications are image-based and do not use text settings.

---

## Keys

The `keys` object is used to configure settings:

- `fontFamily`;
- `letterSpacing`;
- `ligatures`;
- `lineHeight`;
- `noRuby`;
- `paragraphIndent`;
- `paragraphSpacing`;
- `wordSpacing`;
- `zoom`;
- `divinaQuality`.

### FontFamily

See [Custom Fonts](CustomFonts.md).

### Ligatures

`ThSettingsKeys.ligatures` is a boolean toggle. Enabled by default. Hidden automatically in CJK script modes.

### NoRuby

`ThSettingsKeys.noRuby` is a boolean toggle that suppresses ruby annotations. Disabled by default. Only shown for CJK publications (`scriptMode: "cjk-horizontal"` or `"cjk-vertical"`).

### DivinaQuality

`ThSettingsKeys.divinaQuality` accepts a `ThSettingsChoicesPref` object, whose `choices` array restricts the image qualities offered to users (`DivinaQuality` from `@readium/navigator`):

```typescript
[ThSettingsKeys.divinaQuality]: {
  choices: [DivinaQuality.auto, DivinaQuality.low, DivinaQuality.high, DivinaQuality.max]
}
```

This is useful if your platform does not serve every quality, e.g. no `max` variants in its manifests.

### LineHeight

The `lineHeight` key accepts a `ThSettingsRadioPref` object with the following structure:

```typescript
{
  // Whether unsetting the value is allowed, this will provide a Publisher option
  allowUnset?: boolean; 
  keys: {
    [key in ThLineHeightOptions]: number;
  }
}
```

Where `ThLineHeightOptions` can be one of:

- `small`: 1.3 (130% line height)
- `medium`: 1.5 (150% line height)
- `large`: 1.75 (175% line height)

Example:

```typescript
{
  allowUnset: false,
  keys: {
    small: 1.3,
    medium: 1.5,
    large: 1.75
  }
}
```

The `publisher` option (whose value is `null`) is automatically handled separately and doesn't need to be included in the configuration.

### Ranges

- `letterSpacing`;
- `paragraphIndent`;
- `paragraphSpacing`;
- `wordSpacing`;
- `zoom`.

These ranges expect:

- `variant` (optional): from enum `ThSettingsRangeVariant` (`slider`, `incrementedSlider` or `numberfield`)
- `placeholder` (optional): the placeholder text, as enum `ThSettingsRangePlaceholder`, `string`, or an object with `key` and `fallback` properties – the `key` should be a key from your translation files, and the `fallback` is the default value if the translation key is not found
- `range` (optional): the min and max values, as `[number, number]`
- `step` (optional): the step value, as `number`

## Configuration Example

```typescript
settings: {
  reflowOrder: [
    ThSettingsKeys.zoom,
    ThSettingsKeys.textGroup,
    ThSettingsKeys.theme,
    ThSettingsKeys.spacingGroup,
    ThSettingsKeys.layout,
    ThSettingsKeys.columns
  ],
  fxlOrder: [
    ThSettingsKeys.theme,
    ThSettingsKeys.columns
  ],
  webPubOrder: [
    ThSettingsKeys.zoom,
    ThSettingsKeys.textGroup,
    ThSettingsKeys.theme,
    ThSettingsKeys.spacingGroup
  ],
  divinaOrder: [
    ThSettingsKeys.theme,
    ThSettingsKeys.layout,
    ThSettingsKeys.divinaSpreads,
    ThSettingsKeys.divinaStripWidth,
    ThSettingsKeys.divinaQuality
  ],
  keys: {
    ...,
    [ThSettingsKeys.letterSpacing]: {
      variant: ThSettingsRangeVariant.slider,
      range: [0, 0.5],
      step: 0.05
    },
    [ThSettingsKeys.wordSpacing]: {
      variant: ThSettingsRangeVariant.numberField,
      range: [0, 1],
      step: 0.1
    },
    [ThSettingsKeys.zoom]: {
      variant: ThSettingsRangeVariant.numberField,
      range: [0.7, 4],
      step: 0.05
    },
    [ThSettingsKeys.lineHeight]: {
      [ThLineHeightOptions.small]: 1.3,
      [ThLineHeightOptions.medium]: 1.5,
      [ThLineHeightOptions.large]: 1.75
    }
  },
  text: {
    main: [ThTextSettingsKeys.fontFamily],
    subPanel: [
      ThTextSettingsKeys.fontFamily,
      ThTextSettingsKeys.fontWeight,
      ThTextSettingsKeys.textAlign,
      ThTextSettingsKeys.hyphens,
      ThTextSettingsKeys.textNormalize
    ]
  },
  spacing: {
    main: [ThSpacingSettingsKeys.spacingPresets],
    subPanel: [
      ThSpacingSettingsKeys.spacingPresets,
      ThSpacingSettingsKeys.lineHeight,
      ThSpacingSettingsKeys.wordSpacing,
      ThSpacingSettingsKeys.letterSpacing,
      ThSpacingSettingsKeys.paragraphSpacing,
      ThSpacingSettingsKeys.paragraphIndent
    ]
  }
}
```

## Text (optional)

The text object is responsible for the advanced Text Component, which provides an extra container to display more options.

### Main (optional)

The `main` property accepts an array of `ThTextSettingsKeys`. These components will be displayed in the SettingsPanel, with a button to access the components in `displayOrder`.

If all nestable components are listed in `main`, then the Text component behaves as if all its nested components are standalone, and will not create a button to access them – as they are already accessible.

### SubPanel (optional)

The `subPanel` property accepts and array of the keys for components to display in the “sub-panel”, and their order. Note components listed in `main` will not automatically be added to this array.

### Header (optional)

The `header` property accepts a `ThSheetHeaderVariant` to display a header in the SettingsPanel.

## Spacing (optional)

The spacing object is responsible for the advanced Spacing Component, which provides an extra container to display more options.

### Main (optional)

The `main` property accepts an array of `ThSpacingSettingsKeys`. These components will be displayed in the SettingsPanel, with a button to access the components in `displayOrder`.

If all nestable components are listed in `main`, then the Spacing component behaves as if all its nested components are standalone, and will not create a button to access them – as they are already accessible.

### SubPanel (optional)

The `subPanel` property accepts and array of the keys for components to display in the “sub-panel”, and their order. Note components listed in `main` will not automatically be added to this array.

### Header (optional)

The `header` property accepts a `ThSheetHeaderVariant` to display a header in the SettingsPanel.

### Presets (optional)

The `presets` property accepts an object with the following properties:

- `reflowOrder`: an array of `ThSpacingPresetKeys` to display in the SettingsPanel, in the order they are listed;
- `keys`: an object with the presets and their configurations.

For instance:

```typescript
...
spacing:
  ...
  presets: {
    reflowOrder: [
      ThSpacingPresetKeys.publisher,
      ThSpacingPresetKeys.accessible,
      ThSpacingPresetKeys.custom,
      ThSpacingPresetKeys.tight,
      ThSpacingPresetKeys.balanced,
      ThSpacingPresetKeys.loose
    ],
    keys: {
      [ThSpacingPresetKeys.tight]: {
        [ThSettingsKeys.lineHeight]: ThLineHeightOptions.small,
        [ThSettingsKeys.paragraphSpacing]: 0,
        [ThSettingsKeys.paragraphIndent]: 1
      },
      [ThSpacingPresetKeys.balanced]: {
        [ThSettingsKeys.lineHeight]: ThLineHeightOptions.medium,
      },
      [ThSpacingPresetKeys.loose]: {
        [ThSettingsKeys.lineHeight]: ThLineHeightOptions.large,
        [ThSettingsKeys.paragraphSpacing]: 1.5
      },
      [ThSpacingPresetKeys.accessible]: {
        [ThSettingsKeys.lineHeight]: ThLineHeightOptions.large,
        [ThSettingsKeys.paragraphSpacing]: 3,
        [ThSettingsKeys.paragraphIndent]: 0,
        [ThSettingsKeys.letterSpacing]: 0.1,
        [ThSettingsKeys.wordSpacing]: 0.3
      }
    }
  }
}
```

#### Display Order

The `reflowOrder` array controls the display order of spacing presets in the settings panel. Presets not included in this array will not be available to users.

Note that `ThSpacingPresetKeys.publisher` and `ThSpacingPresetKeys.custom` are special presets that do not accept configuration in the `keys` object:
- `ThSpacingPresetKeys.publisher` uses the original publisher's spacing settings
- `ThSpacingPresetKeys.custom` allows users to customize their own preset through the UI

#### Keys

The `keys` object contains the spacing presets (excluding `ThSpacingPresetKeys.publisher` and `ThSpacingPresetKeys.custom`) and their configurations. Each preset can configure the following settings:

- `ThSettingsKeys.lineHeight` - Controls line spacing using `ThLineHeightOptions` (small, medium, large)
- `ThSettingsKeys.paragraphSpacing` - Space between paragraphs (number value)
- `ThSettingsKeys.paragraphIndent` - First line indentation (number value)
- `ThSettingsKeys.letterSpacing` - Space between letters (number value)
- `ThSettingsKeys.wordSpacing` - Space between words (number value)