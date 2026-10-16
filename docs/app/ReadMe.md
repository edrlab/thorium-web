# Next.js App Documentation

This document is intended to address implementation details that are specific to the Next.js app, and differ from the library of React components that is exposed by the `@edrlab/thorium-web` package. 

## Settings

### General Principles

Thorium Web app is relying on [TS-Toolkit’s Preference API](https://github.com/readium/ts-toolkit/blob/develop/navigator/docs/epub/ConfiguringEpubNavigator.md) to handle settings. 

With a couple of exceptions, settings are implemented following a “one-two punch” pattern of submitting preferences to the navigator and then retrieving the actual setting applied by the navigator to store the effective value applied, and not the one it directly retrives from the component’s `onChange`.

### Themes

- themes are generated dynamically from [preferences](../../src/preferences/defaultPreferences.ts) (order, colors, etc.)
- they are handled [through a custom hook](../../src/preferences/hooks/useTheming.ts) (`useTheming`) on change, so that custom variables are set for CSS

### Text Settings

#### Hyphens

- hyphens are disabled when using publisher text-alignment
- If hyphens are `undefined` when switching from publisher text-alignement to justify, they are automatically set to `true`, but not if switching from left/right to justify
- hyphens value is preserved when switching text alignment modes (the local state is maintained, only the navigator preference is nullified in publisher mode)

#### Text Normalization

Text normalization corresponds to [a11y normalization in ReadiumCSS](https://github.com/readium/css/blob/develop/css/src/modules/user-settings-submodules/ReadiumCSS-a11yFont_pref.css), it means removing italics, small caps, bold, sup and sub, font-variants, etc.

### Spacing Settings

Spacing settings rely on presets by default, but can also be used with the Publisher Styles’ toggle if you prefer.

#### Presets

- presets are defined in Preferences, with default values in [models/settings.ts](../../src/preferences/models/settings.ts)
- spacing Presets impact the following components and states:
  - line-height
  - paragraph spacing
  - paragraph indent
  - letter-spacing
  - word-spacing
- when you change a value in a preset via one of these components, we automatically switch to `custom` preset, and make the value of this component resettable (value `null`)
- custom preset values are stored, until the users selects and customizes another one – this interaction effectively acts as a reset
- the ranges and increments we use by default can be found in [models/settings.ts](../../src/preferences/models/settings.ts)

#### Publisher Styles toggle

- this is basically its specific state, that is handled as a side effect when any of the spacing components is set – and becomes `false`
-  it just nullifies values and submit them to navigator, it does not touch the actual states stored, except its own

### Layout Side Effects

- we disable columns when in scroll, but keep the current value
- when multiple columns are set, we listen to `resize` event to check what the effective value is: depending on minimal line-length, 2 columns can switch back to a single one
- you can disable this behavior by setting `minimalLineLength` to `null` in the preferences
- we keep the user-set value stored so that we can re-apply it when conditions are met