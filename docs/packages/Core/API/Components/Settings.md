# Settings Components API Documentation

## ThDropdown

A select component with customizable button, popover, and listbox functionality.

### Types

```typescript
interface ThDropdownEntry {
  id: string;      // Unique identifier
  label: string;   // Display text
  value: string;   // Selection value
}
```

### Props

```typescript
interface ThDropdownProps extends SelectProps {
  ref?: React.ForwardedRef<HTMLDivElement>;
  label?: string;                      // Optional label text
  items?: Iterable<ThDropdownEntry>;   // Collection of dropdown items
  children?: never;                    // Children are not allowed
  compounds?: {
    label?: LabelProps;               // Props for label component
    button?: ButtonProps | React.ReactElement<HTMLButtonElement>; // Custom button
    popover?: PopoverProps;           // Props for popover component
    listbox?: ListBoxProps<ThDropdownEntry> | React.ReactElement<typeof ListBox | HTMLDivElement>;
    listboxItem?: ListBoxItemProps<ThDropdownEntry>; // Props for list items
  }
}
```

## ThNumberField

A numeric input component with optional steppers and range validation.

### Props

```typescript
interface ThNumberFieldProps extends Omit<NumberFieldProps, "minValue" | "maxValue" | "decrementAriaLabel" | "incrementAriaLabel"> {
  ref?: React.ForwardedRef<HTMLInputElement>;
  onReset?: () => void;
  label?: string;                // Optional label text
  placeholder?: string;          // Optional placeholder text (shown when value is undefined)
  range: number[];               // [min, max] values
  isVirtualKeyboardDisabled?: boolean; // Disable virtual keyboard
  steppers?: {
    decrementIcon?: ComponentType<SVGProps<SVGElement>> | null;
    decrementLabel: string;
    incrementIcon?: ComponentType<SVGProps<SVGElement>> | null;
    incrementLabel: string;
  };
  compounds?: {
    wrapper?: HTMLAttributesWithRef<HTMLDivElement>; // Props for the wrapper div
    group?: GroupProps;          // Props for the Group component
    input?: InputProps;          // Props for the Input component
    label?: LabelProps;          // Props for the Label component
    stepper?: ButtonProps;       // Props for stepper buttons
    reset?: ThActionButtonProps; // Props for reset button
  };
}
```

### Features

- Range validation
- Custom increment/decrement icons
- Virtual keyboard control
- Compound components pattern
- Accessibility labels for steppers
- Reset functionality

## ThRadioGroup

A radio button group component with optional icons and labels.

### Types

```typescript
interface ThRadioGroupItems {
  value: string;
  icon?: ComponentType<SVGProps<SVGElement>>;
  label: string;
  isDisabled?: boolean;
}
```

### Props

```typescript
interface ThRadioGroupProps extends RadioGroupProps {
  ref?: React.ForwardedRef<HTMLDivElement>;
  label?: string;                // Group label
  items?: ThRadioGroupItems[];   // Radio options
  compounds?: {
    wrapper?: HTMLAttributesWithRef<HTMLDivElement>;
    label?: LabelProps;
    radio?: Omit<RadioProps, "value">;
    radioLabel?: HTMLAttributesWithRef<HTMLSpanElement>;
  };
}
```

### Features

- Support for icons in radio options
- Disabled state for individual options
- Compound components pattern
- Custom styling for wrapper and labels

## ThSlider

A slider component with customizable track, thumb, and output display.

### Props

```typescript
interface ThSliderProps extends Omit<SliderProps, "minValue" | "maxValue"> {
  ref?: React.ForwardedRef<HTMLDivElement>;
  onReset?: () => void;
  label?: string;                // Slider label
  placeholder?: string;          // Optional placeholder text (shown when value is undefined)
  range: number[];               // [min, max] values
  compounds?: {
    wrapper?: HTMLAttributesWithRef<HTMLDivElement>; // Props for the wrapper div
    label?: LabelProps;          // Props for the label component
    output?: SliderOutputProps;  // Props for the output display
    track?: SliderTrackProps;    // Props for the track component
    thumb?: SliderThumbProps;    // Props for the thumb component
    reset?: ThActionButtonProps; // Props for the reset button
  };
}
```

### Features

- Range-based value constraints
- Live value output display
- Customizable track and thumb
- Compound components pattern
- Accessibility support
- Reset functionality

## ThSliderWithPresets

A slider combined with a set of preset radio buttons, keeping both controls in sync.

### Props

```typescript
interface ThSliderWithPresetsProps extends Omit<ThSliderProps, "compounds"> {
  presets: number[];                   // Preset values shown as radio buttons
  formatValue?: (value: number) => string; // Optional formatter for preset labels
  compounds?: {
    wrapper?: HTMLAttributesWithRef<HTMLDivElement>;  // Outer wrapper (slider + presets)
    slider?: ThSliderProps["compounds"];              // Compounds forwarded to ThSlider
    presetsList?: Omit<RadioGroupProps, "value" | "onChange" | "children">; // RadioGroup wrapper
    presetsWrapper?: HTMLAttributesWithRef<HTMLDivElement>; // Inner grid container for Radio items
    preset?: RadioProps;               // Props for each preset Radio
    presetLabel?: HTMLAttributesWithRef<HTMLSpanElement>;  // Props for each preset label
  };
}
```

### Features

- Synchronizes slider value with preset radio selection
- Preset radio deselects automatically when slider moves off a preset value
- Inherits all `ThSlider` props (range, step, label, etc.) except `compounds`
- Compound components pattern for full layout control

## ThSwitch

A toggle switch component with optional heading and customizable indicator.

### Props

```typescript
interface ThSwitchProps extends SwitchProps {
  ref?: React.ForwardedRef<HTMLLabelElement>;
  label: string;                       // Switch label text
  heading?: string;                    // Optional heading text
  compounds?: {
    wrapper?: HTMLAttributesWithRef<HTMLDivElement>;  // Props for wrapper div
    heading?: HeadingProps;            // Props for heading component
    indicator?: HTMLAttributesWithRef<HTMLDivElement>; // Props for indicator
  }
}
```

## ThColorSwatchPicker

A color picker limited to preset swatches, wrapping React Aria’s `ColorSwatchPicker`.

### Props

```typescript
interface ThColorSwatchPickerProps extends Omit<ColorSwatchPickerProps, "children"> {
  ref?: React.ForwardedRef<HTMLDivElement>;
  swatches: string[];                  // CSS colors, one swatch each
  heading?: string;                    // Optional heading, labelling the picker
  isDisabled?: boolean;                // Disables every swatch
  compounds?: {
    wrapper?: HTMLAttributesWithRef<HTMLDivElement>;
    heading?: WithRef<HeadingProps, HTMLHeadingElement>;
    item?: Omit<ColorSwatchPickerItemProps, "color" | "children">;
    swatch?: ColorSwatchProps;
  }
}
```

### Features

- `value`, `defaultValue` and `onChange` pass through to `ColorSwatchPicker`; `onChange` receives a React Aria `Color`, which you can convert with `color.toString("hexa")`
- The heading labels the picker through `aria-labelledby`, unless you pass an `aria-label`
- `isDisabled` is applied to each swatch, as `ColorSwatchPicker` has no disabled state of its own
- Keyboard navigation and color names for screen readers come from React Aria

## ThSettingsWrapper

A container component for organizing settings with support for main and subpanels.

### Types

```typescript
interface ThSettingsEntry {
  Comp: React.ComponentType<any>      // Component to render for this setting
}

interface ThSettingsPrefs {
  main: string[];                     // Keys for main panel settings
  subPanel?: string[] | null;         // Keys for subpanel settings
}
```

### Props

```typescript
interface ThSettingsWrapperProps extends HTMLAttributesWithRef<HTMLDivElement> {
  items?: Record<string, ThSettingsEntry> | null;  // Map of setting components
  prefs: ThSettingsPrefs;                         // Display preferences
  compounds?: {
    label?: string;                               // Advanced settings label
    heading?: React.ReactElement<typeof Heading> | WithRef<HeadingProps, HTMLHeadingElement>;  // Custom heading element or props for the default Heading component
    button?: ThActionButtonProps;                 // Props for advanced settings button
  }
}
```

## Accessibility

All settings components implement ARIA best practices:

- Proper ARIA roles and states
- Keyboard navigation
- Focus management
- Screen reader support

## ThSettingsResetButton

A button component for resetting settings to their default values.

### Props

```typescript
interface ThSettingsResetButtonProps extends ThActionButtonProps {}
```

### Features

- Built-in reset icon
- Optional label text
- Customizable through compounds props
- Tooltip support inherited from ThActionButton