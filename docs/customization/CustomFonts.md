# Custom Fonts

Preferences provide a powerful way to customize the fonts used in the application. It relies on the idea of font collections, which are records mapping font IDs to `FontDefinition` objects. It supports online font providers such as Google Fonts and Bunny Fonts, as well as local fonts and, of course, system fonts.

This allows you to provide a list of handpicked fonts to the user, and adapt them to the language of the publication.

> [!NOTE]
> Variable fonts are already supported through preferences, but their features will be used for font-related settings in an upcoming release.

## The FontFamilyPref Object

The `fontFamily` key accepts a `ThFontFamilyPref` object which can be one of two types:

1. A default font collection:
   ```typescript
   {
     default: FontCollection;
   }
   ```

2. A font collection for specific languages:
   ```typescript
   {
     [collectionKey: string]: {
       fonts: FontCollection;
       supportedLanguages: string[];
     }
   }
   ```

Where:

- `FontCollection` is a record mapping font IDs to `FontDefinition` objects
- Each `FontDefinition` includes:
  - `id`: Unique identifier for the font
  - `name`: Display name of the font
  - `label`: Optional internationalized label
  - `source`: Font source configuration
  - `spec`: Font specification including family, fallbacks, weights, widths, styles, and display.

Example:

```typescript
{
  default: {
    "variable-system-font": {
      id: "variable-system-font",
      name: "Variable System Font",
      label: "key.to.internationalized.label",
      source: { type: "system" },
      spec: {
        family: "Variable System Font",
        fallbacks: ["Arial", "Helvetica", "sans-serif"],
        weights: { type: "variable", min: 100, max: 900, step: 100 },
        widths: { min: 100, max: 200, step: 10 },
        styles: ["normal", "italic"],
        display: "swap"
      }
    }
  },
  "serif-font": {
    id: "serif-font",
    name: "Serif Font",
    source: { type: "system" },
    spec: {
      family: "Serif Font",
      fallbacks: ["Times New Roman", "Georgia", "serif"],
      weights: { type: "static", values: [400, 700] },
      styles: ["normal", "italic"]
    }
  }
}
```

## Default Collection

The default collection is the collection that will be used if no other collection explicitly lists the language of the publication in its `supportedLanguages` array. It is therefore required to have a default collection.

> [!NOTE]
> If the publication’s language has a matching collection, the default collection will be ignored entirely. There is no merging of collections, which is why it is recommended to never have two collections with the same bcp47 language code.

## Additional Collections (optional)

Additional collections can override the default collection depending on the language of the publication. You should use them explicitly for that purpose, and they can support multiple languages if needed.

For instance, this can be used if you want to provide a list of fonts for a specific language that does not use the same script as your default collection e.g. Arabic with a default collection of Latin scripts.

Example:

```typescript
{
  default: { /* ... */ },
  "arabic-farsi": {
    fonts: { /* ... */ },
    supportedLanguages: ["ar", "fa"]
  }
}

```

Then if the publication is in Arabic or Farsi, the `"arabic-farsi"` collection will be used for the font family setting, and the value the user sets will be specifically stored for this language, so that it does not override default and other collections.

This can be useful if you have a large catalogue containing books in multiple languages, and you want to provide a list of fonts specific to some languages.

## Language Resolution

A language resolver is used internally to set the “font language” based on the publication’s language and the actual preferences value for the `fontFamily` key:

- If you only have a default collection, the language resolver will always return `default`.
- If you have an additional collection that matches the publication’s language, the language resolver use the best matching bcp47 language code:
  - if it finds a direct match, it will use it;
  - if will then handle the best matching language code e.g. `en` for `en-US` or `en-GB`;
  - if it cannot find a match, it will return `default`.

> [!IMPORTANT]
> For Japanese, the language resolver will use `ja` for horizontal scripts and `ja-v` for vertical scripts so that it is possible to provide different collections for horizontal and vertical scripts. It will not fallback to `ja` for vertical scripts, that is to say when the direction is right-to-left.

The user setting will then be stored for the language the resolver resolved to, and will be used for all publications resolved to that language.

## Online Fonts

### Using Bunny Fonts

You can include Bunny Fonts in your font collection. Bunny Fonts is a European and privacy-focused alternative to Google Fonts.

#### Using the Helper Function (Recommended)

For convenience, you can use the `createDefinitionsFromBunnyFonts` helper function:

- `cssUrl` (string, required): The Bunny Fonts CSS URL, the entire `link` or `@import` statement from their website
- `options` (object, optional): Configuration options
  - `order` (string[]): Controls the display order of fonts in the UI, requires using Bunny’s `id` from the URL
  - `labels` (Record<string, string>): Custom labels for each font family, requires using Bunny’s `id` from the URL
  - `fallbacks` (Record<string, string[]>): Custom fallback fonts for each font family, requires using Bunny’s `id` from the URL

**Important Notes:**
- Bunny Fonts only supports static font files, so you cannot use ranges for `weights` and `widths`
- Font families are combined in a single URL by separating them with a pipe (`|`) character

Example:

```typescript
import { createDefinitionsFromBunnyFonts } from "@edrlab/thorium-web/preferences";

const bunnyFonts = createDefinitionsFromBunnyFonts({
  cssUrl: "https://fonts.bunny.net/css?family=roboto:300,300i,400,400i,500,500i,700,700i|open-sans:400, 400i, 700, 700i",
  
  options: {
    order: ["open-sans", "roboto"],
    
    fallbacks: {
      "roboto": ["Arial", "sans-serif"],
      "open-sans": ["Helvetica", "sans-serif"]
    }
  }
});
```

#### Manual Configuration

If you prefer more control or need to customize further, you can define the fonts manually:

```typescript
const bunnyFonts = {
  "roboto": {
    id: "roboto",
    name: "Roboto",
    source: {
      type: "custom",
      provider: "bunny"
    },
    spec: {
      family: "Roboto",
      fallbacks: ["Arial", "sans-serif"],
      weights: {
        type: "static",
        values: [300, 400, 500, 700]
      },
      styles: ["normal", "italic"]
    }
  }
};

// Use in your settings
const settings = {
  // ... other settings
  keys: {
    [ThSettingsKeys.fontFamily]: {
      default: bunnyFonts
    }
  }
};
```

#### Finding Fonts

1. Visit [Bunny Fonts](https://fonts.bunny.net/)
2. Search for the font you want to use
3. Select the weights and styles you need
4. Copy the CSS URL, `link`, or `@import` statement from their website
5. Use it with the helper function as shown above

### Using Google Fonts

You can also include Google Fonts in your font collection by manually defining the font configuration if you prefer or need more control. Here's how to do it:

#### Using the Helper Function (Recommended)

For convenience, you can use the `createDefinitionsFromGoogleFonts` helper.

- `cssUrl` (string, required): The Google Fonts CSS URL, the entire `link` or `@import` statement you copy from their page
- `options` (object, optional): Configuration options
  - `order` (string[]): Controls the display order of fonts in the UI, requires derived `id`
  - `labels` (Record<string, string>): Custom labels for each font family, requires derived `id`
  - `fallbacks` (Record<string, string[]>): Custom fallback fonts for each font family, requires derived `id`
  - `display` (string): Controls font-display behavior
  - `weightStep` (number): For variable fonts, controls weight granularity
  - `widthStep` (number): For variable width fonts, controls width granularity

Derived `id` is the font family name in lowercase, with spaces replaced by hyphens.

Example:

```typescript
import { createDefinitionsFromGoogleFonts } from "@edrlab/thorium-web/preferences";

const googleFonts = createDefinitionsFromGoogleFonts({
  cssUrl: "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto:ital,wght@0,300..700;1,300..700",
  
  options: {
    order: ["roboto", "open-sans"],
    
    fallbacks: {
      "roboto": ["Arial", "sans-serif"],
      "open-sans": ["Helvetica", "sans-serif"]
    }
  }
});
```

#### Manual Configuration

```typescript
const googleFonts = {
  "roboto": {
    id: "roboto",
    name: "Roboto",
    source: {
      type: "custom",
      provider: "google"
    },
    spec: {
      family: "Roboto",
      fallbacks: ["Arial", "sans-serif"],
      weights: {
        type: "static",
        values: [300, 400, 500, 700]
      },
      styles: ["normal", "italic"],
      display: "swap"
    }
  },
  "open-sans": {
    id: "open-sans",
    name: "Open Sans",
    source: {
      type: "custom",
      provider: "google"
    },
    spec: {
      family: "Open Sans",
      fallbacks: ["Helvetica", "sans-serif"],
      weights: {
        type: "variable",
        min: 300,
        max: 800
      },
      styles: ["normal", "italic"],
      display: "swap"
    }
  }
};

// Use in your settings
const settings = {
  // ... other settings
  keys: {
    [ThSettingsKeys.fontFamily]: {
      default: googleFonts
    }
  }
};
```

#### Finding Fonts

1. Visit [Google Fonts](https://fonts.google.com/)
2. Search for the font you want to use
3. Select the weights and styles you need
4. Copy the CSS URL, `link` or `@import` statement from their website
5. Use it with the helper function as shown above

### Using Local Fonts

You can use local fonts, either static or variable, that are served from the same origin as your app. For convenience, you can use the `createDefinitionFromStaticFonts` helper for static fonts.

#### Using the Helper for Static Fonts

```typescript
import { createDefinitionFromStaticFonts } from "@edrlab/thorium-web/preferences";

const myCustomFont = createDefinitionFromStaticFonts({
  id: "my-custom-font",
  name: "My Custom Font",
  family: "My Custom Font", // optional, defaults to name
  label: "my.localized.name", // optional, defaults to name
  fallbacks: ["Arial", "sans-serif"], // optional, defaults to ["sans-serif"],
  files: [
    { path: "/fonts/my-custom-font-regular.woff2", weight: 400, style: "normal" },
    { path: "/fonts/my-custom-font-italic.woff2", weight: 400, style: "italic" },
    { path: "/fonts/my-custom-font-bold.woff2", weight: 700, style: "normal" },
    { path: "/fonts/my-custom-font-bold-italic.woff2", weight: 700, style: "italic" }
  ]
});

// Use in your settings
const settings = {
  // ... other settings
  keys: {
    [ThSettingsKeys.fontFamily]: {
      default: {
        "my-custom-font": myCustomFont
      }
    }
  }
};
```

#### Manual Configuration

You can also define the configuration manually if you prefer:

```typescript
const myCustomFont: FontDefinition = {
  id: "my-custom-font",
  name: "My Custom Font",
  label: "my.localized.name", // optional, defaults to name
  source: {
    type: "custom",
    provider: "local",
    variant: "static",
    files: [
      { path: "/fonts/my-custom-font-regular.woff2", weight: 400, style: "normal" },
      { path: "/fonts/my-custom-font-italic.woff2", weight: 400, style: "italic" },
      { path: "/fonts/my-custom-font-bold.woff2", weight: 700, style: "normal" },
      { path: "/fonts/my-custom-font-bold-italic.woff2", weight: 700, style: "italic" }
    ]
  },
  spec: {
    family: "My Custom Font",
    fallbacks: ["Arial", "sans-serif"],
    weights: {
      type: "static",
      values: [400, 700]
    },
    styles: ["normal", "italic"]
  }
};

// Use in your settings
const settings = {
  // ... other settings
  keys: {
    [ThSettingsKeys.fontFamily]: {
      default: {
        "my-custom-font": myCustomFont
      }
    }
  }
};
```

#### Variable Fonts

For variable fonts, use this structure:

```typescript
const myVariableFont: FontDefinition = {
  id: "my-variable-font",
  name: "My Variable Font",
  label: "my.localized.name", // optional, defaults to name
  source: {
    type: "custom",
    provider: "local",
    variant: "variable",
    files: [
      { 
        path: "/fonts/my-variable-font.woff2",
        style: "normal" 
      }
    ]
  },
  spec: {
    family: "My Variable Font",
    fallbacks: ["sans-serif"],
    weights: {
      type: "variable",
      min: 100,
      max: 900,
      step: 20
    },
    styles: ["normal"]
  }
};

// Use in your settings
const settings = {
  // ... other settings
  keys: {
    [ThSettingsKeys.fontFamily]: {
      default: {
        "my-custom-font": myCustomFont
      }
    }
  }
};
```

#### Finding Fonts

1. Please make sure to read the license of the font you want to use and/or the terms of service of the provider
2. Search for the font you want to use
3. Download the font files
4. Find their features using online tools such as [Wakamai Fondue](https://wakamaifondue.com)
5. Expose them on the same origin as your app and list them in preferences