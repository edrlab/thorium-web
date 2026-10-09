# Styling API

This document outlines the available styling classes and custom properties for the Thorium Web components.

## Table of Contents

1. [Button Component](#button-component)
2. [Overflow Menu](#overflow-menu)
3. [Jump to Position](#jump-to-position)
4. [Sheets](#sheets)
5. [Docking](#docking)
6. [Reader Components](#reader-components)
7. [Table of Contents](#table-of-contents)
8. [Audio Components](#audio-components)
9. [Misc Components](#misc-components)

## Button Component

### Base Buttons

- `.thorium_web_button_icon` - Base icon button
- `.thorium_web_button_dockerButton` - Docker control button
- `.thorium_web_button_closeButton` - Close button
- `.thorium_web_button_backButton` - Back button with arrow icon
- `.thorium_web_button_tooltip` - Tooltip container for buttons

### Button Modifiers

- `.thorium_web_button_iconCompSm` - Compensates for compact icon button
- `.thorium_web_button_iconCompLg` - Compensates for large icon button
- `.thorium_web_button_iconApplyStroke` - Applies stroke to icon

### Button States

- `.thorium_web_button_alwaysVisible` - Always visible button (derived from preferences)
- `.thorium_web_button_partiallyVisible` - Partially visible button (derived from preferences)

## Overflow Menu

- `.thorium_web_overflow_menu` - Container for the entire menu
- `.thorium_web_overflow_popover` - Container for overflow menu
- `.thorium_web_overflow_menuItem` - Individual menu item
- `.thorium_web_overflow_menuItemLabel` - Text label in menu item
- `.thorium_web_overflow_menuItemShortcut` - Keyboard shortcut indicator
- `.thorium_web_overflow_hint` - Visual hint for overflow

## Jump to Position

- `.thorium_web_jumpToPosition_wrapper` - Form panel 
- `.thorium_web_jumpToPosition_form` - Form container
- `.thorium_web_jumpToPosition_label` - Form label
- `.thorium_web_jumpToPosition_input` - Text input field
- `.thorium_web_jumpToPosition_button` - Action button
- `.thorium_web_jumpToPosition_numberField` - Number input field

## Sheets

### Sheet Types

- `.thorium_web_sheets_fullscreen` - Fullscreen sheet
- `.thorium_web_sheets_modal` - Centered modal sheet
- `.thorium_web_sheets_modalDialog` - Inner dialog container of the modal sheet
- `.thorium_web_sheets_popover` - Popover-style sheet
- `.thorium_web_sheets_draggable` - Draggable bottom sheet
- `.thorium_web_sheets_docked` - Docked sidesheet

### Sheet Components

#### Shared

- `.thorium_web_sheets_dialog` - Inner dialog container of fullscreen and popover sheets
- `.thorium_web_sheets_header` - Sheet header
- `.thorium_web_sheets_heading` - Sheet title
- `.thorium_web_sheets_body` - Main content area

#### Draggable Sheet

- `.thorium_web_sheets_draggableHeader` - Header for draggable sheets
- `.thorium_web_sheets_dragIndicator` - Visual indicator for draggable sheets
- `.thorium_web_sheets_draggableScrim` - Scrim behind draggable sheet
- `.thorium_web_sheets_draggableContainer` - Container for draggable content
- `.thorium_web_sheets_draggableScroller` - Scrollable area in draggable sheet
- `.thorium_web_sheets_draggableBackdrop` - Backdrop for draggable sheet
- `.thorium_web_sheets_draggableFullHeightDetent` - Full height draggable sheet
- `.thorium_web_sheets_draggableContentHeightDetent` - Content-based height draggable sheet

#### Docked Sheet

- `.thorium_web_sheets_dockedLeftBorder` - Left border for docked sheet
- `.thorium_web_sheets_dockedRightBorder` - Right border for docked sheet

## Docking

- `.thorium_web_docking_dockerWrapper` - Wrapper for dock controls
- `.thorium_web_docking_docker` - Docker container
- `.thorium_web_docking_resizeHandle` - Resize handle for docked panels
- `.thorium_web_docking_resizeHandleGrab` - Grab handle for resizing
- `.thorium_web_docking_resizeHandleGrabLeft` - Left grab handle
- `.thorium_web_docking_resizeHandleGrabRight` - Right grab handle

## Reader Components

### App Structure

- `.thorium_web_reader_app_main` - Root container for the reader application. Applied to the `<main>` element
- `.thorium_web_reader_app_shell` - Inner shell container, found within the docking wrapper
- `.thorium_web_reader_app_wrapper` - Wrapper for reader content
- `.thorium_web_reader_app_iframeContainer` - Container for iframe content
- `.thorium_web_reader_app_leftDock` - Left docked panel
- `.thorium_web_reader_app_rightDock` - Right docked panel

### Utilities

- `.thorium_web_reader_app_srOnly` - Screen reader only text

### Header & Footer

> These classes apply to Epub/WebPub readers only. For audio, see [Audio Components](#audio-components).

- `.thorium_web_reader_app_topBar` - Top navigation bar
- `.thorium_web_reader_app_bottomBar` - Bottom navigation bar
- `.thorium_web_reader_app_headerOverlay` - Header overlay for layered-ui
- `.thorium_web_reader_app_footerOverlay` - Footer overlay for layered-ui
- `.thorium_web_reader_app_barOverlay` - Common bar overlay for layered-ui
- `.thorium_web_reader_header_header` - Reader header
- `.thorium_web_reader_header_actionsWrapper` - Header actions container
- `.thorium_web_reader_header_backlinkWrapper` - Backlink container

### Navigation

- `.thorium_web_reader_paginatedArrow_container` - Container for pagination arrows
- `.thorium_web_reader_paginatedArrow_leftContainer` - Left arrow container
- `.thorium_web_reader_paginatedArrow_rightContainer` - Right arrow container
- `.thorium_web_reader_paginatedArrow_occupiesSpace` - Style for stacked arrow
- `.thorium_web_reader_paginatedArrow_visuallyHidden` - Visually hidden arrow

### Progression and Pagination

- `.thorium_web_reader_pagination_wrapper` - Pagination container
- `.thorium_web_reader_pagination_label` - Pagination label
- `.thorium_web_reader_pagination_listItem` - Pagination list item
- `.thorium_web_reader_pagination_previousButton` - Previous button
- `.thorium_web_reader_pagination_nextButton` - Next button
- `.thorium_web_reader_pagination_progression` - Progress indicator
- `.thorium_web_reader_progression_wrapper` - Progress wrapper

### Settings

- `.thorium_web_reader_settings_wrapper` - Settings panel
- `.thorium_web_reader_settings_group` - Settings group
- `.thorium_web_reader_settings_groupWrapper` - Wrapper for setting groups
- `.thorium_web_reader_settings_groupLabel` - Group label
- `.thorium_web_reader_settings_input` - Form inputs
- `.thorium_web_reader_settings_label` - Input label
- `.thorium_web_reader_settings_radio` - Radio buttons
- `.thorium_web_reader_settings_radioWrapper` - Radio button wrapper
- `.thorium_web_reader_settings_themeRadio` - Theme radio button
- `.thorium_web_reader_settings_themesWrapper` - Themes container
- `.thorium_web_reader_settings_slider` - Slider control
- `.thorium_web_reader_settings_sliderWithTicks` - Slider with tick marks
- `.thorium_web_reader_settings_sliderTrack` - Slider track
- `.thorium_web_reader_settings_sliderThumb` - Slider thumb
- `.thorium_web_reader_settings_sliderLabel` - Slider label
- `.thorium_web_reader_settings_sliderOutput` - Slider value display
- `.thorium_web_reader_settings_sliderPlaceholder` - Slider placeholder
- `.thorium_web_reader_settings_sliderWrapper` - Slider container
- `.thorium_web_reader_settings_sliderWithPresetsWrapper` - Slider with presets container
- `.thorium_web_reader_settings_sliderWithPresetsRadioGroup` - Radio button group for slider presets
- `.thorium_web_reader_settings_sliderWithPresetsRadio` - Individual radio button preset for slider
- `.thorium_web_reader_settings_numberField` - Number input
- `.thorium_web_reader_settings_numberFieldWrapper` - Number input wrapper
- `.thorium_web_reader_settings_dropdown` - Dropdown menu
- `.thorium_web_reader_settings_dropdownButton` - Dropdown button
- `.thorium_web_reader_settings_dropdownListbox` - Dropdown list
- `.thorium_web_reader_settings_dropdownListboxItem` - Dropdown item
- `.thorium_web_reader_settings_dropdownPopover` - Dropdown popover
- `.thorium_web_reader_settings_switch` - Toggle switch
- `.thorium_web_reader_settings_switchIndicator` - Switch indicator
- `.thorium_web_reader_settings_advancedGroup` - Advanced settings group
- `.thorium_web_reader_settings_advancedIcon` - Advanced settings icon
- `.thorium_web_reader_settings_separator` - Section separator
- `.thorium_web_reader_settings_resetButton` - Reset button

### Backlink

- `.thorium_web_reader_backlink` - Backlink container
- `.thorium_web_reader_backlink_link` - Backlink anchor

## Table of Contents

### TOC Components

- `.thorium_web_toc_wrapper` – TOC panel
- `.thorium_web_toc_tree` - TOC tree container
- `.thorium_web_toc_treeItem` - TOC item
- `.thorium_web_toc_treeItemButton` - TOC item button
- `.thorium_web_toc_treeItemText` - TOC item text
- `.thorium_web_toc_treeItemTextTitle` - TOC item title
- `.thorium_web_toc_treeItemTextPosition` - TOC item position
- `.thorium_web_toc_search` - Search container
- `.thorium_web_toc_searchLabel` - Search label
- `.thorium_web_toc_searchInput` - Search input
- `.thorium_web_toc_searchIcon` - Search icon
- `.thorium_web_toc_clearButton` - Clear search button
- `.thorium_web_toc_empty` - Empty state

## Audio Components

### App Structure

- `.thorium_web_audio_app_main` - Root container for the audio player application. Applied to the `<main>` element
- `.thorium_web_audio_app_shell` - Inner shell container, found within the docking wrapper
- `.thorium_web_audio_app_topBar` - Top navigation bar

### Player

- `.thorium_web_audioPlayer_audioPlayerWrapper` - Root wrapper for the audio player in compact (single-column) layout
- `.thorium_web_audioPlayer_audioPlayerWrapperExpanded` - Root wrapper for the audio player in expanded (two-column) layout, activated when compact overflows
- `.thorium_web_audioPlayer_audioPlayerExpandedStart` - Inline-start column in the expanded layout
- `.thorium_web_audioPlayer_audioPlayerExpandedEnd` - Inline-end column in the expanded layout
- `.thorium_web_audioPlayer_coverMetadataGroup` - Flex group wrapping cover and metadata when they are adjacent in the compact player order

### Cover

- `.thorium_web_audioCover_audioCoverSection` - Cover figure; grows to fill remaining player space and constrains itself to a 1:1 aspect ratio
- `.thorium_web_audioCover_audioCoverImage` - Cover image element
- `.thorium_web_audioCover_audioCoverPlaceholder` - Placeholder shown when no cover is available
- `.thorium_web_audioCover_audioCoverSyncOverlay` - Overlay shown on top of the cover image when the track is not ready or stalled
- `.thorium_web_audioCover_audioCoverSyncIcon` - Spinning sync icon shown inside the overlay (or replacing the placeholder icon) when the track is not ready or stalled

### Metadata

- `.thorium_web_audioMetadata_audioMetadata` - Metadata container
- `.thorium_web_audioMetadata_audioMetadataTitle` - Publication title
- `.thorium_web_audioMetadata_audioMetadataSubtitle` - Publication subtitle
- `.thorium_web_audioMetadata_audioMetadataAuthors` - Authors list

### Playback Controls

- `.thorium_web_audioPlayback_audioControls` - Playback controls bar container
- `.thorium_web_audioPlayback_audioPlayPauseButton` - Play/pause button
- `.thorium_web_audioPlayback_audioPreviousTrackButton` - Previous track button
- `.thorium_web_audioPlayback_audioNextTrackButton` - Next track button
- `.thorium_web_audioPlayback_audioSkipBackwardButton` - Skip backward button
- `.thorium_web_audioPlayback_audioSkipForwardButton` - Skip forward button

### Media Actions

- `.thorium_web_audioActions_wrapper` - Media actions bar container
- `.thorium_web_audioActions_popover` - Control popover container

#### Volume

- `.thorium_web_volume_wrapper` - Volume wrapper
- `.thorium_web_volume_button` - Volume button
- `.thorium_web_volume_slider` - Volume slider
- `.thorium_web_volume_sliderTrack` - Volume slider track
- `.thorium_web_volume_sliderThumb` - Volume slider thumb

#### Playback Rate

- `.thorium_web_playbackRate_wrapper` - Playback Rate wrapper
- `.thorium_web_playbackRate_button` - Playback rate button
- `.thorium_web_playbackRate_label` - Playback rate label (e.g. `1×`)
- `.thorium_web_playbackRate_slider` - Playback rate slider popover content
- `.thorium_web_playbackRate_numberField` - Playback rate number field (number field variant)

#### TOC

- `.thorium_web_audioToc_button` - Table of contents button

#### Sleep Timer

- `.thorium_web_sleepTimer_wrapper` - Sleep timer wrapper
- `.thorium_web_sleepTimer_button` - Sleep timer button
- `.thorium_web_sleepTimer_label` - Sleep timer label
- `.thorium_web_sleepTimer_listbox` - Sleep timer preset listbox
- `.thorium_web_sleepTimer_listboxItem` - Sleep timer preset item
- `.thorium_web_sleepTimer_durationField` - Sleep timer duration input group
- `.thorium_web_sleepTimer_instruction` - Sleep timer instruction text
- `.thorium_web_sleepTimer_inputs` - Sleep timer inputs container
- `.thorium_web_sleepTimer_fieldGroup` - Sleep timer field group
- `.thorium_web_sleepTimer_fieldInput` - Sleep timer field input
- `.thorium_web_sleepTimer_unitLabel` - Sleep timer unit label
- `.thorium_web_sleepTimer_remaining` - Remaining sleep time display
- `.thorium_web_sleepTimer_cancelButton` - Sleep timer cancel button
- `.thorium_web_sleepTimer_startButton` - Sleep timer action button

### Progress Bar

- `.thorium_web_audioProgressBar_wrapper` - Progress bar container
- `.thorium_web_audioProgressBar_current` - Current chapter label
- `.thorium_web_audioProgressBar_slider` - Progress slider
- `.thorium_web_audioProgressBar_track` - Progress slider track
- `.thorium_web_audioProgressBar_thumb` - Progress slider thumb
- `.thorium_web_audioProgressBar_seekableRange` - Seekable range overlay
- `.thorium_web_audioProgressBar_elapsed` - Elapsed time display
- `.thorium_web_audioProgressBar_remaining` - Remaining time display

## Misc Components

### Publication Grid

- `.thorium_web_publicationGrid_wrapper` - Main container for the publication grid
- `.thorium_web_publicationGrid_card` - Individual publication card with hover effects
- `.thorium_web_publicationGrid_cover` - Container for publication cover image
- `.thorium_web_publicationGrid_image` - Publication cover image element
- `.thorium_web_publicationGrid_info` - Container for publication metadata
- `.thorium_web_publicationGrid_title` - Publication title text
- `.thorium_web_publicationGrid_author` - Publication author text
- `.thorium_web_publicationGrid_rendition` - Rendition information badge

### Loader

- `.thorium_web_loader_wrapper` - Wrapper for the loading indicator
- `.thorium_web_loader_loader` - Animated loading indicator with ellipsis animation