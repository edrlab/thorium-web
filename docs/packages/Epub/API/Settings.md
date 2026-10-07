# Settings API Documentation

The Settings API provides a comprehensive set of components for managing EPUB reader settings, including text formatting, spacing, and layout preferences. The components are organized into base components (located in `/src/components/Settings/`) and EPUB-specific components (located in `/src/components/Epub/Settings/`).

## Base Components

### StatefulGroupWrapper

A wrapper component for grouping related settings with advanced options.

```typescript
interface StatefulGroupWrapperProps {
  label: string;
  moreLabel: string;
  moreTooltip: string;
  onPressMore: (e: PressEvent) => void;
  componentsMap: Record<string, SettingComponent>;
  prefs?: ThSettingsGroupPref<ThTextSettingsKeys | ThSpacingSettingsKeys>;
  defaultPrefs: {
    main: ThTextSettingsKeys[] | ThSpacingSettingsKeys[];
    subPanel: ThTextSettingsKeys[] | ThSpacingSettingsKeys[];
  };
  compounds?: {
    heading?: React.ReactElement<typeof Heading> | WithRef<HeadingProps, HTMLHeadingElement>;
  };
}
```

**Features:**
- Groups related settings components
- Provides advanced options subpanel
- Custom heading support
- Manages preferences and defaults
- Integrates with the plugin system

### StatefulDropdown

A dropdown menu component for selecting from predefined options.

```typescript
interface StatefulDropdownProps extends Omit<ThDropdownProps, "classNames"> {
  standalone?: boolean;
}
```

**Features:**
- Dropdown menu with selectable options
- Keyboard navigation
- Accessibility support


### StatefulNumberField

A numeric input field component for precise value control.

```typescript
interface StatefulNumberFieldProps extends Omit<ThNumberFieldProps, "classNames"> {
  standalone?: boolean;
}
```

**Features:**
- Precise numeric input
- Step control
- Range validation
- Accessibility support

### StatefulRadioGroup

A radio group component for selecting from predefined options.

```typescript
interface StatefulRadioGroupProps extends Omit<ThRadioGroupProps, "classNames"> {
  standalone?: boolean;
}
```

**Features:**
- Accessible labeling

### StatefulPresetsGroup

A preset button group for selecting a numeric value from a fixed list, without a slider. Built on top of `StatefulRadioGroup`.

```typescript
interface StatefulPresetsGroupProps extends Omit<StatefulRadioGroupProps, "items" | "value" | "onChange"> {
  presets: number[];
  value?: number;
  formatOptions?: Intl.NumberFormatOptions;
  formatValue?: (value: number) => string;
  onChange?: (value: number) => void;
}
```

**Features:**
- Number-to-string conversion for radio group compatibility
- Optional `formatOptions` or `formatValue` for preset labels
- Inherits grid layout and keyboard navigation from `StatefulRadioGroup`

### StatefulSlider

A slider component for numeric settings with customizable styling.

```typescript
interface StatefulSliderProps extends Omit<ThSliderProps, "classNames"> {
  standalone?: boolean;
}
```

**Features:**
- Accessible label and ARIA support
- Integrated output display

### StatefulSwitch

A toggle switch component for boolean settings.

```typescript
interface StatefulSwitchProps extends Omit<ThSwitchProps, "classNames"> {
  standalone?: boolean;
}
```

**Features:**
- Optional heading display
- Accessible labeling

## EPUB-Specific Components

### Layout Settings

#### StatefulColumns

```typescript
interface StatefulColumnsProps {}
```

**Features:**
- Controls column layout for EPUB content (auto, single, double)
- Integrates with scroll and fixed-layout modes
- Provides visual icons for layout options
- Real-time column count updates
- Accessibility support with ARIA labels

**Example:**
```typescript
<StatefulColumns />
```

#### StatefulZoom

```typescript
interface StatefulZoomProps {}
```

**Features:**
- Dual-mode control (slider or number field)
- Supports both font size and zoom scaling
- Configurable range and step values
- Percentage-based formatting
- Custom increment/decrement controls

**Example:**
```typescript
<StatefulZoom />
```

### Text Settings

#### StatefulTextGroup

```typescript
interface StatefulTextGroupProps {}
```

**Features:**
- Groups text-related settings components
- Plugin system integration
- Advanced settings panel support
- Preference persistence
- Customizable component ordering

**Example:**
```typescript
<StatefulTextGroup />
```

#### StatefulFontFamily

```typescript
interface StatefulFontFamilyProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Font family selection with preview
- Publisher defaults support
- Dropdown interface with visual preview

**Example:**
```typescript
<StatefulFontFamily />
```

#### StatefulFontWeight

```typescript
interface StatefulFontWeightProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Font weight control with slider
- Range validation (100-900)
- Publisher style integration
- Disabled state when using publisher fonts
- Real-time weight updates

**Example:**
```typescript
<StatefulFontWeight />
```

#### StatefulTextAlign

```typescript
interface StatefulTextAlignProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Text alignment options (start, justify, publisher)
- RTL support with automatic icon switching
- Hyphenation integration
- Visual alignment indicators
- Preference persistence

**Example:**
```typescript
<StatefulTextAlign />
```

#### StatefulHyphens

```typescript
interface StatefulHyphensProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Toggle hyphenation on/off
- Integration with text alignment
- Publisher style support
- Accessibility labels
- State persistence

**Example:**
```typescript
<StatefulHyphens />
```

#### StatefulTextNormalize

```typescript
interface StatefulTextNormalizeProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Text normalization toggle
- Integration with text processing
- State persistence
- Accessibility labels
- Real-time text updates

**Example:**
```typescript
<StatefulTextNormalize />
```

### Spacing Settings

#### StatefulSpacingGroup

```typescript
interface StatefulSpacingGroupProps {}
```

**Features:**
- Groups spacing-related settings components
- Plugin system integration
- Advanced settings panel support
- Preference persistence
- Customizable component ordering

**Example:**
```typescript
<StatefulSpacingGroup />
```

#### StatefulSpacingPresets

```typescript
interface StatefulSpacingPresetsProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Spacing presets toggle
- Integration with spacing settings
- State persistence
- Accessibility labels
- Real-time spacing updates

**Example:**
```typescript
<StatefulSpacingPresets />
```

#### StatefulLineHeight

```typescript
interface StatefulLineHeightProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Line height control (radio group)
- Publisher style integration

**Example:**
```typescript
<StatefulLineHeight />
```

#### StatefulLetterSpacing

```typescript
interface StatefulLetterSpacingProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Letter spacing control (slider/number field)
- Percentage-based adjustments
- Custom range and step configuration
- Publisher style integration
- Increment/decrement controls

**Example:**
```typescript
<StatefulLetterSpacing />
```

#### StatefulWordSpacing

```typescript
interface StatefulWordSpacingProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Word spacing control (slider/number field)
- Percentage-based adjustments
- Custom range and step configuration
- Publisher style integration
- Increment/decrement controls

**Example:**
```typescript
<StatefulWordSpacing />
```

#### StatefulParagraphSpacing

```typescript
interface StatefulParagraphSpacingProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Paragraph spacing control (slider/number field)
- Custom number formatting
- Range and step configuration
- Publisher style integration
- Increment/decrement controls

**Example:**
```typescript
<StatefulParagraphSpacing />
```

#### StatefulParagraphIndent

```typescript
interface StatefulParagraphIndentProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Paragraph indentation control (slider/number field)
- Custom number formatting
- Range and step configuration
- Publisher style integration
- Increment/decrement controls

**Example:**
```typescript
<StatefulParagraphIndent />
```

### Misc Settings

#### StatefulLayout

```typescript
interface StatefulLayoutProps {}
```

**Features:**
- Toggles between paginated and scrolled layouts, for both EPUB and [Divina](../../Divina/API/Settings.md)
- Handles scroll affordances automatically
- Disabled for natively scrolled Divina publications (webtoons)
- Visual indicators for layout modes
- Maintains state across reader sessions
- Accessibility support with ARIA labels

**Example:**
```typescript
<StatefulLayout />
```

#### StatefulTheme

```typescript
interface StatefulThemeProps {
  mapArrowNav?: number;
}
```

**Features:**
- Theme selection with system integration
- Support for fixed-layout and reflowable EPUBs
- Auto theme based on system preferences
- RTL support
- Custom theme properties
- Real-time theme switching
- Accessibility support

**Example:**
```typescript
<StatefulTheme />
```

#### StatefulPublisherStyles

```typescript
interface StatefulPublisherStylesProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Toggle publisher default styles
- Manages multiple style properties:
  - Line height
  - Paragraph indent
  - Paragraph spacing
  - Letter spacing
  - Word spacing
- State persistence across sessions
- Real-time style updates

**Example:**
```typescript
<StatefulPublisherStyles />
```

## Common Features

All settings components share these characteristics:

- **Preference Integration**: Direct integration with the preferences system
- **EPUB Navigation**: Real-time updates to the EPUB reader
- **Redux State**: Centralized state management for applied settings
- **Accessibility**: ARIA attributes and keyboard navigation support
- **Styling**: Consistent styling through CSS modules

## Hooks

All hooks are exported from `@/components/Settings/hooks`.

### useReaderSetting

Reads a setting from the correct Redux slice based on the active reader profile (`epub` or `webPub`), with automatic fallback to the reducer's initial state.

```typescript
// Shared keys — returns the value from settings or webPubSettings
function useReaderSetting<K extends SharedSettingsKey>(key: K): SettingsReducerState[K];

// Special case: "zoom" maps to webPubSettings.zoom for webPub and settings.fontSize for epub
function useReaderSetting(key: "zoom"): number;
```

**Behaviour:**
- Reads `state.reader.profile` internally to determine which slice to use
- Falls back to `initialSettingsState` or `initialWebPubSettingsState` when a value is `undefined`, so components never receive stale hardcoded defaults
- The `"zoom"` overload abstracts the naming difference between profiles: `settings.fontSize` (epub) and `webPubSettings.zoom` (webPub) are both exposed under a single key

**Available keys:** all keys shared between `SettingsReducerState` and `WebPubSettingsReducerState` — `fontFamily`, `fontWeight`, `hyphens`, `letterSpacing`, `ligatures`, `lineHeight`, `noRuby`, `paragraphIndent`, `paragraphSpacing`, `publisherStyles`, `spacing`, `textAlign`, `textNormalization`, `wordSpacing` — plus the cross-profile alias `"zoom"`.

**Note:** epub-only keys (`columnCount`, `scroll`, `lineLength`) are not covered and must be accessed directly via `useAppSelector`.

**Example:**
```typescript
const publisherStyles = useReaderSetting("publisherStyles");
const textAlign = useReaderSetting("textAlign");
const zoom = useReaderSetting("zoom"); // fontSize for epub, zoom for webPub
```

### useEffectiveRange

Returns the effective `[min, max]` range and filtered presets for a range-based setting, clamping to the navigator's supported range when provided.

```typescript
function useEffectiveRange(
  preferred: [number, number],
  supportedRange: [number, number] | undefined,
  presets?: number[]
): { range: [number, number]; presets?: number[] }
```

**Behaviour:**
- Uses `preferred` when it fits within `supportedRange`, otherwise falls back to `supportedRange`
- Filters `presets` to only include values within the effective range

**Example:**
```typescript
const { range, presets } = useEffectiveRange([0.5, 2], preferencesEditor?.fontSize?.supportedRange, [0.75, 1, 1.25, 1.5]);
```

### useGridNavigation

Adds keyboard arrow-key navigation to a CSS grid of radio-like items, aware of the number of visible columns.

```typescript
function useGridNavigation(props: useGridNavigationProps): { onKeyDown: React.KeyboardEventHandler }

interface useGridNavigationProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  items: React.RefObject<any[]>;
  currentValue: any;
  onChange: (value: any) => void;
  isRTL?: boolean;
  onEscape?: () => void;
  onFocus?: (value: string) => void;
}
```

**Behaviour:**
- Arrow Up/Down move by one row (column count derived from `grid-template-columns`)
- Arrow Left/Right move by one cell, direction-aware when `isRTL` is set
- Items can be primitives or objects with a `value` property

**Example:**
```typescript
const { onKeyDown } = useGridNavigation({ containerRef, items, currentValue: value, onChange });
```

### useGridTemplate

Observes a grid container and returns the number of visible columns (or rows) by reading the computed `grid-template-columns` / `grid-template-rows` style. Updates on resize via `ResizeObserver`.

```typescript
function useGridTemplate(
  ref: React.RefObject<HTMLDivElement | null>,
  type?: "columns" | "rows"
): number | null
```

**Example:**
```typescript
const columnCount = useGridTemplate(containerRef); // defaults to "columns"
```

### usePlaceholder

Resolves a settings range placeholder value to a display string, supporting i18n keys, enum variants, and literal strings.

```typescript
function usePlaceholder(
  placeholder: ThSettingsRangePlaceholder | string | { key: string; fallback?: string } | undefined,
  range: [number, number],
  format?: "percent" | "number" | "multiplier"
): string | undefined
```

**Behaviour:**
- `ThSettingsRangePlaceholder.none` → `undefined`
- `ThSettingsRangePlaceholder.range` → formatted range string (e.g. `"50% - 200%"`)
- `{ key, fallback }` → translated string via i18n, falling back to `fallback`
- Literal string → returned as-is

**Example:**
```typescript
const placeholder = usePlaceholder(zoomConfig.placeholder, zoomConfig.range, "percent");
```

### useSettingsComponentStatus

Checks whether a settings component is registered in the plugin map and included in the active display order, returning a set of status flags used to conditionally render or enable components.

```typescript
function useSettingsComponentStatus(options: UseSettingsComponentStatusOptions): SettingsComponentStatus

interface UseSettingsComponentStatusOptions {
  settingsKey: ThSettingsKeys | ThTextSettingsKeys | ThSpacingSettingsKeys;
  publicationType?: "reflow" | "fxl" | "webpub" | "divina";
  additionalCondition?: boolean;
}

interface SettingsComponentStatus {
  isComponentRegistered: boolean;
  isInMainPanel: boolean;
  isInSubPanel: boolean;
  isDisplayed: boolean;
  isComponentUsed: boolean; // registered AND displayed
}
```

**Example:**
```typescript
const { isComponentUsed: isHyphensUsed } = useSettingsComponentStatus({
  settingsKey: ThTextSettingsKeys.hyphens,
  publicationType: "reflow"
});
```