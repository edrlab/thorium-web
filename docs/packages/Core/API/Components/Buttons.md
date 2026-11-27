# Buttons Components API Documentation

## ThActionButton

A button component that optionally includes a tooltip. It extends the base Button component from react-aria-components with additional tooltip functionality.

### Props

`ThActionButtonProps` extends `ButtonProps` from react-aria-components:

```typescript
interface ThActionButtonProps extends ButtonProps {
  label?: string;                      // Optional text label for the button
  ref?: React.ForwardedRef<HTMLButtonElement>; // Ref for the button element
  compounds?: {
    tooltipTrigger?: TooltipTriggerProps;  // Props for tooltip trigger component
    tooltip?: TooltipProps;                // Props for tooltip component
    label: string;                         // Text content for the tooltip
  }
}
```

### Features

- Supports all standard button functionality from react-aria-components
- Optional tooltip integration with customizable trigger behavior, rendered with [`ThTooltip`](./Tooltips.md)
- Compound component pattern for tooltip configuration
- Accessible by default through react-aria integration

## ThCloseButton

A predefined button component for close actions with a default close icon.

### Props

```typescript
type ThCloseButtonProps = ThActionButtonProps
```

### Features

- Built-in close icon
- Optional label text
- Customizable through compounds props
- Tooltip support inherited from ThActionButton

## ThDeleteButton

A predefined button component for delete actions with a default delete icon.

### Props

```typescript
type ThDeleteButtonProps = ThActionButtonProps
```

### Features

- Built-in delete icon
- Optional label text
- Customizable through compounds props
- Tooltip support inherited from ThActionButton

## ThNavigationButton

A predefined button component for navigation actions with directional icons.

### Props

```typescript
interface ThNavigationButtonProps extends ThActionButtonProps {
  direction?: "left" | "right";  // Determines which arrow icon to display
}
```

### Features

- Automatic direction-based icon selection
- Built-in arrow icons for both directions
- Optional label text
- Customizable through compounds props
- Tooltip support inherited from ThActionButton

## Accessibility

Both button components inherit accessibility features from ThActionButton:

- ARIA button role
- Keyboard navigation
- Tooltip support
- Screen reader support through aria-label