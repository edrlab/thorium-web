# Sheets Components API Reference

This document details the Sheets components that provide overlay and panel functionality in the EPUB reader.

## Base Interface

```typescript
interface StatefulSheet {
  id: ActionsStateKeys;                    // Unique identifier for the sheet
  triggerRef: RefObject<HTMLElement | null>; // Reference to the trigger element
  heading: string;                          // Sheet header text
  headerVariant?: ThSheetHeaderVariant;     // Header style variant
  className: string;                        // CSS class name
  isOpen: boolean;                          // Sheet visibility state
  onOpenChange: (isOpen: boolean) => void;  // Open state change handler
  onPressClose: () => void;                 // Close button handler
  docker?: ThDockingKeys[];                // Optional docking positions
  headerActions?: ReactNode;                // Extra buttons in the header, before the close button
  children?: ReactNode;                     // Sheet content
  resetFocus?: unknown;                     // Focus reset handler
  withinFocusRef?: RefObject<HTMLElement | null>; // Focus within handler
  dismissEscapeKeyClose?: boolean;          // Disable Escape key closing
}
```

## Sheet Types

### StatefulBottomSheet

A bottom sheet component with snap points and drag functionality.

```typescript
interface StatefulBottomSheetProps extends StatefulSheet {}
```

Features:
- Configurable snap points (min, peek, max)
- Draggable sheet with touch support
- Custom detent modes (content-height, full-height)
- Scrim customization
- Focus management

#### useBottomSheetSnap

The snapping and drag indicator behavior of `StatefulBottomSheet`, as a hook, for sheets built directly on `ThBottomSheet` (the read-along sheet uses it).

```typescript
interface UseBottomSheetSnapProps {
  sheetRef: RefObject<SheetRef | null>;
  snapArray: number[];             // Snap points, starting with 0
  onSnap?: (index: number) => void;
  onClosePress?: () => void;       // Called when moving down from the lowest snap point
}

function useBottomSheetSnap(props: UseBottomSheetSnapProps): {
  onSnapCallback: (index: number) => void;          // For ThBottomSheet’s onSnap
  onDragPressCallback: () => void;                  // For the drag indicator’s onPress: cycles through snap points
  onDragKeyCallback: (e: KeyboardEvent) => void;    // For the drag indicator’s onKeyDown: ArrowUp/Down, PageUp/Down
}
```

Without `onClosePress`, moving down from the lowest snap point does nothing, so the sheet can’t be closed from its drag indicator.

### StatefulModalSheet

A centered modal sheet component.

```typescript
interface StatefulModalSheetProps extends StatefulSheet {}
```

Features:
- Modal dialog implementation
- Centered layout with configurable max-width via `--th-layout-constraints-modal`
- Header with navigation/close button
- Focus management
- Keyboard dismissal control

### StatefulFullScreenSheet

A full-screen modal sheet component.

```typescript
interface StatefulFullScreenSheetProps extends StatefulSheet {}
```

Features:
- Modal dialog implementation
- Header with navigation/close button
- Focus management
- Keyboard dismissal control
- Sticky header support

### StatefulDockedSheet

A sheet that can be docked to either side of the screen.

```typescript
interface StatefulDockedSheetProps extends StatefulSheet {
  flow: ThDockingKeys.start | ThDockingKeys.end | null;
}
```

Features:
- Side-docking support
- Portal-based rendering
- Focus management
- RTL/LTR layout support

### StatefulPopoverSheet

A popover-style sheet component.

```typescript
interface StatefulPopoverSheetProps extends StatefulSheet {
  placement?: PopoverProps["placement"];
}
```

Features:
- Configurable placement
- Trigger element anchoring
- Focus management
- Accessibility support

### StatefulSheetWrapper

A wrapper component that renders the appropriate sheet type based on configuration.

```typescript
interface StatefulSheetWrapperProps {
  sheetType: ThSheetTypes;                // Type of sheet to render
  sheetProps: StatefulPopoverSheetProps | // Props for the selected sheet type
             StatefulModalSheetProps |
             StatefulFullScreenSheetProps |
             StatefulDockedSheetProps |
             StatefulBottomSheetProps;
  children: ReactNode;                    // Content to render inside the sheet
}
```

Features:
- Dynamic sheet type rendering using `ThTypedComponentRenderer`
- Support for all sheet variants:
  - Popover (`ThSheetTypes.popover`)
  - Modal (`ThSheetTypes.modal`)
  - Bottom sheet (`ThSheetTypes.bottomSheet`)
  - Fullscreen (`ThSheetTypes.fullscreen`)
  - Docked start (`ThSheetTypes.dockedStart`)
  - Docked end (`ThSheetTypes.dockedEnd`)
- Type-safe props handling through union types
- Consistent props interface across all sheet variants
- Automatic sheet component selection based on type