# Docking Components API Reference

This document details the Docking components that manage UI element positioning and behavior in the EPUB reader.

## Core Components

### StatefulDocker

Main controller component for docking functionality that manages a toolbar of docking actions.

```typescript
interface StatefulDockerProps {
  id: ActionsStateKeys;  // Unique identifier for the docker
  keys: ThDockingKeys[]; // Array of available docking positions
  ref: React.ForwardedRef<HTMLButtonElement>; // Reference to the docker button
  onClose: () => void;  // Callback when docker is closed
}
```

This is considered an action toolbar, and behaves as [StatefulCollapsibleActionsBar](./Actions.md#statefulcollapsibleactionsbar)

### StatefulDockingWrapper

Wrapper component that manages resizable docking panels using react-resizable-panels. You will typically wrap your Reader and some of its components in it.

The wrapper handles:
- Responsive docking based on breakpoints
- Panel resizing with drag handles
- RTL/LTR layout support

## Position Components

### StatefulDockStart and StatefulDockEnd

Components that handle docking to the start (left in LTR, right in RTL) and end positions.

```typescript
interface StatefulActionTriggerProps {
  variant?: ThActionsTriggerVariant;  // Visual variant of the trigger
  associatedKey?: ActionsStateKeys;   // Key of the associated action
}
```

Features:
- Direction-aware docking (RTL/LTR support)
- Integration with action state management
- Keyboard shortcut support

## Transient Components

### StatefulDockTransientFullscreen

Component that handles fullscreen modal.

Features:
- Fullscreen mode toggle
- Integration with dock state management
- Menu and icon trigger variants

### StatefulDockTransientPopover

Component that handles popover modal.

Features:
- Popover positioning
- Integration with dock state management
- Menu and icon trigger variants

## Hook

### useDocking

A React hook that manages docking state and behavior for a component. This hook handles the complex logic of determining whether and how a component can be docked based on preferences, breakpoints, and current state.

```typescript
const useDocking = <T extends string>(key: T, { canReserve = true }: { canReserve?: boolean } = {}) => {
  return {
    getDocker: () => ThDockingKeys[],  // Returns available docking positions
    sheetType: ThSheetTypes            // Current sheet display type
  }
}
```

**Parameters:**
- `key`: A unique identifier for the dockable component
- `canReserve`: whether a [reserved](../../../customization/Docking.md#reserved-actions) action holds its dock slot right now. The read-along player only reserves its slot while read-along is active

**Returns:**
- `getDocker`: Function that returns an array of available docking positions based on:
  - Component's dockable preferences
  - Current breakpoint configuration
  - Sheet type compatibility
  - Display order preferences

  It is empty when a single option is left, as there is nothing to choose, e.g. a reserved action with one dockable slot
- `sheetType`: Current sheet display type (docked, transient, etc.)

**Features:**
- Responsive docking based on breakpoints
- Preference-based docking positions
- Automatic state management for docked components
- Handles transitions between docked and transient states
- Maintains docking state across breakpoint changes

## Accessibility

- Implements ARIA attributes through react-aria-components
- Supports keyboard navigation
- Respects reduced motion preferences
- Provides keyboard shortcuts for docking operations

**Features:**
- Popover positioning
- Auto-dismiss
- Click outside handling