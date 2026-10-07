# Containers Components API Documentation

## Base Container Types

### ThContainerProps

Base interface for container components:

```typescript
interface ThContainerProps {
  ref?: React.RefObject<HTMLDivElement | SheetRef | null>;
  focusOptions?: UseFirstFocusableProps;
  children: [React.ReactElement<ThContainerHeaderProps>, React.ReactElement<ThContainerBodyProps>];
}
```

### ThContainerHeaderVariant

Enum defining header variants:

```typescript
enum ThContainerHeaderVariant {
  close = "close",
  docker = "docker",
  previous = "previous"
}
```

## ThContainerHeader

Header component for containers with heading support.

### Props

```typescript
interface ThContainerHeaderProps extends HTMLAttributesWithRef<HTMLDivElement> {
  ref?: React.ForwardedRef<HTMLDivElement>;
  label: string;                    // Text content for the header
  compounds?: {
    heading?: HeadingProps;         // Props for the heading component
  }
}
```

## ThContainerBody

A container component for the main content area.

### Props

```typescript
interface ThContainerBodyProps extends HTMLAttributesWithRef<HTMLDivElement> {}
```

### Features

- Simple content wrapper
- Accepts all standard HTML div attributes
- Ref forwarding support

## ThModal

A modal dialog container component built on react-aria-components.

### Props

```typescript
interface ThModalProps extends Omit<ModalOverlayProps, "children">, ThContainerProps {
  compounds?: {
    dialog: DialogProps             // Props for the dialog component
  }
}
```

### Features

- Built-in focus management
- Accessible dialog implementation
- Compound component pattern for dialog configuration
- Integrates with ThContainer layout system

## ThPopover

A popover container component with positioning and focus management.

### Props

```typescript
interface ThPopoverProps extends Omit<PopoverProps, "children">, ThContainerProps {
  triggerRef: React.RefObject<HTMLElement | null>;  // Reference to trigger element
  compounds?: {
    dialog: DialogProps                             // Props for the dialog component
  }
}
```

### Features

- Automatic positioning relative to trigger element
- Dynamic max height calculation
- Focus management integration
- Accessible dialog implementation

## ThDockedPanel

A panel component that can be docked to a specific portal element with focus management.

### Props

```typescript
interface ThDockedPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, ThContainerProps {
  isOpen: boolean;           // Controls panel visibility
  portal: HTMLElement | null; // Target element for portal rendering
}
```

### Features

- Portal-based rendering
- Focus management through FocusScope
- Conditional rendering based on isOpen state
- Inherits ThContainer functionality

## ThBottomSheet

A bottom sheet component with drag gesture support and advanced positioning features.

### Props

```typescript
interface ThBottomSheetProps extends Omit<React.ComponentProps<typeof Sheet>, "children" | "ref" | "isOpen" | "onClose">, AriaOverlayProps, ThContainerProps {
  onOpenChange?: (isOpen: boolean) => void;
  isKeyboardDismissDisabled?: boolean;
  compounds?: {
    container?: Omit<React.ComponentProps<typeof Sheet.Container>, "children">;
    header?: React.ComponentProps<typeof Sheet.Header>;
    dragIndicator?: ThDragIndicatorButtonProps;
    content?: React.ComponentProps<typeof Sheet.Content>;
    scroller?: {
      ref?: React.RefObject<HTMLDivElement>;
      className?: string;
    };
    backdrop?: React.ComponentProps<typeof Sheet.Backdrop>;
  };
}
```

### Features

- Drag gesture support
- Customizable snap points
- Focus management
- `isDismissable` (default `true`) controls both dismissal on outside interaction and focus containment. Set it to `false` for a sheet that leaves the page usable, e.g. a mini player: focus isn’t trapped and clicking the page doesn’t close it
- Keyboard dismissal control
- Compound components pattern
- Backdrop support

## ThTypedComponentRenderer

A generic component renderer that maps component types to their implementations.

### Types

```typescript
type ComponentMap<T extends string> = {
  [type in T]: React.ComponentType<any>;
}

interface TypedComponentRendererProps<T extends string, K extends keyof ComponentMap<T>> {
  type: K;                    // Component type identifier
  componentMap: ComponentMap<T>; // Map of type to component
  props?: any;                // Props to pass to rendered component
  children?: ReactNode;       // Optional children
}
```

### Features

- Type-safe component rendering
- Dynamic component selection
- Props and children forwarding
- Error handling for unsupported types

### Accessibility

All container components implement ARIA best practices through react-aria-components:

- Proper focus management
- ARIA roles and attributes
- Keyboard navigation
- Screen reader announcements