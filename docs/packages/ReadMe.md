# Thorium Web Package

Thorium Web provides a collection of React components, hooks, and helpers that can be used to build a web reading application.

## Docs

The Thorium Web package is organized into several sub-packages:

- **[Core](./Core/)**: Low-level hooks, components, and utilities for building custom readers
- **[Audio](./Audio/)**: Audio player with plugins system for UI customization, Redux state management, and built-in preferences
- **[Divina](./Divina/)**: Divina reader for image-based publications (comics, manga, webtoons), sharing the EPUB reader’s plugins system, Redux state management, and preferences
- **[Epub](./Epub/)**: EPUB reader with plugins system for UI customization, Redux state management, and built-in preferences
- **[Reader](./Reader/)**: Universal reader wrapper that automatically routes to appropriate format-specific readers (EPUB/WebPub/Divina/Audio) based on publication profile

## Usage

To use the Thorium Web package, you will need to add it as a dependency in your project. You can do this by running the following command:

```bash
npm install @edrlab/thorium-web @readium/css @readium/navigator @readium/navigator-html-injectables @readium/shared react-redux @reduxjs/toolkit i18next i18next-browser-languagedetector i18next-http-backend motion react-aria react-aria-components react-stately react-modal-sheet react-resizable-panels  
```

Components are relying on peer dependencies to work. You must install them manually.

Note that these components do not require Next.js, you should be able to use them in any React application or React framework of your choice.

## Styling

Styles are exported as CSS stylesheets with `thorium_web_` scoped classnames. You can find detailed documentation about available classes in the [Styling docs](./Styling/ReadMe.md).

## Contributing

If you want to contribute to the Thorium Web package, here are the steps to bundle them and test locally.

- Add your exports to their relevant `index.ts` files, following the existing format (per folder)
- Run `pnpm bundle` to bundle the package
- Run `pnpm link` to link the package
- In your local project, run `pnpm link @edrlab/thorium-web` to link the package
- Add the package as a dependency in your `package.json` file using the `link:` protocol
- Run `pnpm install` to install the package in your local project

> [!Important]
> Make sure to add dependencies in both `dependencies` and `peerDependencies` in the `package.json` file, and exclude them from [tsup.config.ts](../../tsup.config.ts) by listing them in `external`. If you are unsure whether a smaller dependency should be included or not, please ask the maintainers of this project.