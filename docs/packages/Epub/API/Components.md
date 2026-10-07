# Components API Reference

This document provides detailed API documentation for all components in the EPUB package. The components are organized into the following categories:

## Core Components

- [Actions](#actions)
- [Docking](#docking)
- [Settings](#settings)
- [Sheets](#sheets)
- [Read Along](#read-along)
- [Reader UI](#reader-ui)
- [Plugins](#plugins)

## Actions

The Actions components provide functionality for user interactions and controls:

### Action Bar Components
- `StatefulCollapsibleActionsBar`: A collapsible bar that contains action buttons
- `StatefulOverflowMenu`: A menu that appears when actions overflow the available space

### Action Types
- **Fullscreen**: Toggle fullscreen mode (`StatefulFullscreenTrigger`)
- **Jump to Position**: Navigate to specific positions (`StatefulJumpToPositionTrigger`)
- **Settings**: Configure reader settings (`StatefulVisualSettingsContainer`, `StatefulSettingsTrigger`)
- **Table of Contents**: Navigate book structure (`StatefulTocContainer`, `StatefulTocTrigger`)
- **Read Along**: Read the publication aloud (`StatefulReadAlongContainer`, `StatefulReadAlongTrigger`), see [Read Along](#read-along)

### Action Triggers
- `StatefulActionIcon`: Base component for action icons
- `StatefulOverflowMenuItem`: Menu item for overflow actions
- `UnstableStatefulShortcut`: Keyboard shortcut handling

## Docking

Docking components manage the positioning and behavior of UI elements:

- `StatefulDockEnd`: Dock element at the end
- `StatefulDockStart`: Dock element at the start
- `StatefulDockTransientFullscreen`: display in fullscreen sheet
- `StatefulDockTransientPopover`: display in popover sheet
- `StatefulDocker`: docking controller
- `StatefulDockingWrapper`: Wrapper for the app, providing docking panels

## Settings

Settings components provide user configuration options:

### Layout Settings
- `StatefulColumns`: Column layout configuration
- `StatefulLayout`: Overall layout settings
- `StatefulZoom`: Zoom level control

### Text Settings
- `StatefulFontFamily`: Font family selection
- `StatefulFontWeight`: Font weight control
- `StatefulHyphens`: Hyphenation control
- `StatefulTextAlign`: Text alignment options
- `StatefulTextGroup`: Text-related settings group
- `StatefulTextNormalize`: Text normalization options

### Spacing Settings
- `StatefulLetterSpacing`: Letter spacing control
- `StatefulLineHeight`: Line height adjustment
- `StatefulParagraphIndent`: Paragraph indentation
- `StatefulParagraphSpacing`: Spacing between paragraphs
- `StatefulSpacingGroup`: Spacing-related settings group
- `StatefulSpacingPresets`: Spacing presets
- `StatefulWordSpacing`: Word spacing control

### Other Settings
- `StatefulPublisherStyles`: Publisher style preferences
- `StatefulTheme`: Theme selection

### Base Components
- `StatefulGroupWrapper`: Wrapper for settings groups
- `StatefulColorSwatchPicker`: Color picker limited to preset swatches
- `StatefulDropdown`: Dropdown menu with selectable options
- `StatefulNumberField`: Numeric input field
- `StatefulRadioGroup`: Radio button group
- `StatefulSlider`: Slider control
- `StatefulSwitch`: Toggle switch

## Sheets

Sheet components provide different types of overlays and panels:

- `StatefulBottomSheet`: Sheet that slides up from bottom
- `StatefulDockedSheet`: Permanently docked sheet
- `StatefulFullScreenSheet`: Fullscreen overlay
- `StatefulPopoverSheet`: Floating popover
- `StatefulSheetWrapper`: Base wrapper for sheets
- `useBottomSheetSnap`: Snapping and drag indicator behavior of the bottom sheet, for sheets built on `ThBottomSheet`

## Read Along

Read-along components read the publication aloud, highlight what is read, and provide a mini player and an expanded player:

- `StatefulReadAlongMiniPlayer`, `StatefulReadAlongPlayer`, `StatefulReadAlongSheet`: the players
- `StatefulReadAlongMediaActions` and `StatefulReadAlongSettingsTrigger` / `StatefulReadAlongSettingsContainer`: the player’s actions
- `StatefulReadAlongVoice`, `StatefulReadAlongRate`, `StatefulReadAlongHighlightGroup`, etc.: its settings

See the [Read Along API Reference](./ReadAlong.md) for more details.

## Reader UI

Core reader interface components:

- `StatefulLoader`: Loading indicator
- `StatefulReaderArrowButton`: Navigation arrow buttons
- `StatefulReaderFooter`: Reader footer component
- `StatefulReaderHeader`: Reader header component
- `StatefulReaderRunningHead`: Reader running head component
- `StatefulReaderPagination`: Reader pagination component
- `StatefulReaderProgression`: Reading progress indicator
- `StatefulBackLink`: Back link component

## Misc

- `PublicationGrid`: a component that can be used to create a grid of publications (cover, title, authors, rendition)

## Plugins

Plugin system components:

- `PluginProvider`: Context provider for plugins
- `PluginRegistry`: Plugin registration and management
- `createDefaultPlugin`: Helper for creating default plugins

A plugin’s `components` can provide:

- `actions`: reader actions, as Trigger/Target pairs;
- `settings`: settings components. Their `type` adds them to a group: `"text"`, `"spacing"`, or `"readAlongHighlight"` for the read-along highlight submenu;
- `primaryAudioActions`: actions of the audio player’s media bar;
- `readAlongActions`: actions of the read-along players, as Trigger/Target pairs.

## Common Features

All components share these common features:

- Redux integration for state management
- Accessibility support through React Aria
- Consistent styling and theming
- TypeScript type definitions
- Event handling

## Best Practices

1. **State Management**
   - Use the provided Redux actions and selectors
   - Avoid local state for shared data
   - Follow the stateful component patterns

2. **Accessibility**
   - Maintain ARIA attributes and roles
   - Support keyboard navigation
   - Test with screen readers

3. **Customization**
   - Use theme variables for styling
   - Extend components through composition
   - Follow the plugin system for extensions

4. **Performance**
   - Implement proper memoization
   - Use lazy loading when appropriate
   - Follow React best practices

5. **Maintenance**
   - Keep components focused and single-purpose
   - Document props and interfaces