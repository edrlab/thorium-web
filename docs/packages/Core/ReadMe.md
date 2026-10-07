# Using the Core Package

The Core package provides the foundational building blocks for creating reading applications. It includes UI components, custom hooks, helper functions, and utilities for preferences management.

## Installation

Thorium Web relies on peer dependencies to work. You must install them manually.

```bash
npm install @edrlab/thorium-web @readium/css @readium/navigator @readium/navigator-html-injectables @readium/shared react-redux @reduxjs/toolkit i18next i18next-browser-languagedetector i18next-http-backend motion react-aria react-aria-components react-stately react-modal-sheet react-resizable-panels  
```

## Package Structure

The Core package is organized into several sub-packages:

- `@edrlab/thorium-web/core/components`: UI components for building interfaces
- `@edrlab/thorium-web/core/hooks`: React hooks for EPUB support, accessibility, and responsive design
- `@edrlab/thorium-web/core/helpers`: Utility functions for common tasks
- `@edrlab/thorium-web/core/lib`: Redux store and related utilities (hooks and reducers)
- `@edrlab/thorium-web/core/preferences`: Preferences management system

## Core Components

Please refer to the [Components documentation](./Components.md) for more information.

## Core Hooks

Please refer to the [Hooks documentation](./Hooks.md) for more information.

## Core Helpers

Please refer to the [Helpers documentation](./Helpers.md) for more information.

## Core Lib

Please refer to the [Lib documentation](./Lib.md) for more information.

## Core Preferences

Please refer to the [Preferences documentation](./Preferences.md) for more information.

## Best Practices

1. **Use TypeScript**: The Core package is built with TypeScript, so it's recommended to use TypeScript for type safety.
2. **Follow React Aria guidelines**: The Core package uses React Aria for accessibility, so follow React Aria guidelines when building custom components.
3. **Test thoroughly**: Test your application on different devices and browsers to ensure compatibility.

## Related Documentation

- [Epub Package](../Epub/ReadMe.md)