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
npm install @edrlab/thorium-web "@readium/css@^2.0.5" "@readium/navigator@~2.15.0" "@readium/navigator-html-injectables@~2.11.0" "@readium/shared@~2.9.0" "@reduxjs/toolkit@^2.11.2" "i18next@^26.4.2" "i18next-browser-languagedetector@^8.2.1" "i18next-http-backend@^4.0.2" "motion@^12.34.3" "react@^19.3.0" "react-aria@^3.52.1" "react-aria-components@^1.21.1" "react-dom@^19.3.0" "react-i18next@^17.0.15" "react-modal-sheet@5.2.1" "react-redux@^9.3.0" "react-resizable-panels@^4.13.3" "react-stately@^3.50.0"
```

Components are relying on peer dependencies to work. You must install them manually. The command installs each of them within the range Thorium Web supports: `@readium/navigator`, `@readium/navigator-html-injectables` and `@readium/shared` are pinned to a minor version, as the TS-Toolkit can ship breaking changes in minor versions.

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