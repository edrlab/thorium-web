# Localization

> [!IMPORTANT]
> Since our locales are consolidated from different sources, they are managed through a separate process, please do not submit pull requests for localization files as they will not be accepted.

## Technical Overview

Thorium Web consolidates localization strings from two separate sources:

1. **Thorium Web** - strings specific to this application
2. **Thorium Reader** - strings shared across the Thorium suite

While Thorium Web strings are automatically PR’d by Weblate, Thorium Reader strings are manually updated and require coordination between the two projects.

## Contributing Translations

Please do not submit pull requests for localization files as they will not be accepted. Translations are exclusively managed through Weblate projects where contributors can submit translations.

- [Thorium Reader Module](https://hosted.weblate.org/projects/thorium-reader/reader/)
- [Thorium Web Module](https://hosted.weblate.org/projects/thorium-reader/thorium-web/)

## Update Process

### Updating Locales

```bash
pnpm update-locales
```

This fetches the latest [thorium-locales](https://github.com/edrlab/thorium-locales) repository into a temporary directory, copies its shared locale files to `public/locales/[locale]/thorium-shared.json`, and generates a completion report. The resulting changes to `public/locales` should be reviewed and committed like any other change — this diff is the changelog for locale content, since thorium-locales itself isn't versioned.

`public/locales` is committed to the repository and consumed directly by the Next.js application build and the NPM package bundle — neither depends on thorium-locales at build time.

### Checking Locale Status

```bash
pnpm check-locales
```

This outputs a minimum viable report of the locales’ completion status in the terminal.

```bash
pnpm check-locales --show-missing
```

This shows missing translations for each locale.

```bash
pnpm check-locales --summary
```

This creates [locale-summary.txt](../locale-summary.txt) at the project root with translation completion percentages and missing keys.

It checks completion twofold:

1. It checks completion of all locales against English (reference locale)
2. It checks which translation keys are actually used in the application code

The second check is called "inferred usage" but cannot be run automatically for all strings due to the customizability of the application, and the use of dynamic strings (a.k.a. template literals). These strings require manual review.

When updating locales, we run both options so that it can serve as a snapshot of the current state of the translation files.

### List of Supported Languages

The list of supported languages is maintained manually in [src/i18n/supported-locales.ts](../src/i18n/supported-locales.ts).

There is currently no rule as to when languages should be dropped from or added to the supported list, but we review them periodically, on each release cycle.