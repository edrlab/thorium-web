import { ShortcutRepresentation } from "@/core/Helpers/keyboardUtilities";
import { BreakpointsMap } from "@/core/Hooks/useBreakpoints";
import { ThemeTokens } from "@/preferences/hooks/useTheming";
import {
  ThActionsKeys,
  ThDocumentTitleFormat,
  ThDockingKeys,
  ThLayoutUI,
  ThLineHeightOptions,
  ThProgressionFormat,
  ThRunningHeadFormat,
  ThSettingsKeys,
  ThSheetTypes,
  ThTextSettingsKeys,
  ThSpacingSettingsKeys,
  ThThemeKeys,
  ThSpacingPresetKeys,
  ThActionsTokens,
  ThFontFamilyPref,
  ThSettingsRangePrefRequired,
  ThSettingsRangeVariant,
  ThSettingsRadioPref,
  I18nValue,
  ThBackLinkPref,
  ThFormatPref,
  ThPaginatedAffordancePref,
  ThScrollAffordance,
  ThDockingPref,
  ThSettingsGroupPref,
  ValidatedLanguageCollection,
} from "./models";
import { ExperimentKey } from "@readium/navigator";
import { ThCollapsibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import { ContentProtectionConfig } from "./models/protection";
import { validateObjectKeys } from "./helpers";

export type CustomizableKeys = {
  action?: string;
  theme?: string;
  settings?: string;
  text?: string;
  spacing?: string;
};

// Default internal keys alias for convenience
export type DefaultKeys = {
  action: ThActionsKeys;
  theme: ThThemeKeys;
  settings: ThSettingsKeys;
  text: ThTextSettingsKeys;
  spacing: ThSpacingSettingsKeys;
};

// Key types to better handle custom keys for external consumers
export type ActionKey<K extends CustomizableKeys> =
  K extends { action: infer A }
    ? A extends string
      ? ThActionsKeys | A
      : ThActionsKeys
    : ThActionsKeys;

export type ThemeKey<K extends CustomizableKeys> =
  K extends { theme: infer T } 
    ? T extends string 
      ? ThThemeKeys | T 
      : ThThemeKeys
    : ThThemeKeys;

export type SettingsKey<K extends CustomizableKeys> = 
  K extends { settings: infer S } 
    ? S extends string 
      ? ThSettingsKeys | S 
      : ThSettingsKeys
    : ThSettingsKeys;

export type TextSettingsKey<K extends CustomizableKeys> = 
  K extends { text: infer T } 
    ? T extends string 
      ? ThTextSettingsKeys | T 
      : ThTextSettingsKeys
    : ThTextSettingsKeys;

export type SpacingSettingsKey<K extends CustomizableKeys> = 
  K extends { spacing: infer S } 
    ? S extends string 
      ? ThSpacingSettingsKeys | S 
      : ThSpacingSettingsKeys
    : ThSpacingSettingsKeys;


export interface ThSettingsSpacingPresets<K extends CustomizableKeys = DefaultKeys> {
  reflowOrder: Array<ThSpacingPresetKeys>;
  webPubOrder: Array<ThSpacingPresetKeys>;
  // Not customizable as the component is static radiogroup (icons), unlike themes
  // Publisher and custom are not included as they are special cases
  keys: {
    [key in Exclude<ThSpacingPresetKeys, "publisher" | "custom">]?: ThSpacingPreset<K>;
  };
}

export type ThSpacingPreset<K extends CustomizableKeys = DefaultKeys> = {
  [ThSpacingSettingsKeys.letterSpacing]?: number;
  [ThSpacingSettingsKeys.lineHeight]?: ThLineHeightOptions;
  [ThSpacingSettingsKeys.paragraphIndent]?: number;
  [ThSpacingSettingsKeys.paragraphSpacing]?: number;
  [ThSpacingSettingsKeys.wordSpacing]?: number;
} & (K extends { spacing: infer S } 
  ? S extends string 
      ? { [key in S]?: number | ThLineHeightOptions }
    : {}
  : {});

export interface ThActionsPref<K extends CustomizableKeys> {
  reflowOrder: Array<ActionKey<K>>;
  fxlOrder: Array<ActionKey<K>>;
  webPubOrder: Array<ActionKey<K>>;
  collapse: ThCollapsibility;
  keys: Record<ActionKey<K>, ThActionsTokens>;
};

export type ThSettingsKeyTypes<K extends CustomizableKeys = DefaultKeys> = {
  [ThSettingsKeys.fontFamily]: ThFontFamilyPref;
  [ThSettingsKeys.letterSpacing]: ThSettingsRangePrefRequired;
  [ThSettingsKeys.lineHeight]: ThSettingsRadioPref<Exclude<ThLineHeightOptions, ThLineHeightOptions.publisher>>;
  [ThSettingsKeys.paragraphIndent]: ThSettingsRangePrefRequired;
  [ThSettingsKeys.paragraphSpacing]: ThSettingsRangePrefRequired;
  [ThSettingsKeys.wordSpacing]: ThSettingsRangePrefRequired;
  [ThSettingsKeys.zoom]: ThSettingsRangePrefRequired;
} & (
  K extends { settings: infer S } 
    ? S extends string 
      ? { [key in S]: any }
      : {}
    : {}
);

export type ThConstraintKeys = Extract<ThSheetTypes, ThSheetTypes.bottomSheet | ThSheetTypes.popover | ThSheetTypes.modal> | "pagination" | "dropdown";

export type ThShortcutsDisplayIn = "tooltip" | "menuItem";

export interface ThShortcutsPref {
  representation: ShortcutRepresentation;
  joiner?: string;
  displayIn?: ThShortcutsDisplayIn[];
}

export interface ThIconPref {
  size: number;
  tooltipOffset: number;
  tooltipDelay?: number;
}

export interface ThLayoutDefaultsPref {
  dockingWidth: number;
  scrim: string;
}

// Main preferences interface with simplified generics
export interface ThPreferences<K extends CustomizableKeys = {}> {
  experiments?: {
    reflow?: Array<ExperimentKey>;
    webPub?: Array<ExperimentKey>;
  };
  metadata?: {
    documentTitle?: {
      // TODO – Templating of custom
      format: I18nValue<ThDocumentTitleFormat>;
    };
  };
  typography: {
    minimalLineLength?: number | null;
    maximalLineLength?: number | null;
    optimalLineLength: number;
    pageGutter: number;
  };
  theming: {
    header?: {
      backLink?: ThBackLinkPref | null;
      runningHead?: {
        format?: {
          reflow?: ThFormatPref<ThRunningHeadFormat>;
          fxl?: ThFormatPref<ThRunningHeadFormat>;
          webPub?: ThFormatPref<ThRunningHeadFormat>;
        }
      }
    };
    progression?: {
      format?: {
        reflow?: ThFormatPref<ThProgressionFormat | Array<ThProgressionFormat>>;
        fxl?: ThFormatPref<ThProgressionFormat | Array<ThProgressionFormat>>;
        webPub?: ThFormatPref<ThProgressionFormat | Array<ThProgressionFormat>>;
      };
    };
    arrow: {
      size: number;
      offset: number;
      tooltipDelay?: number;
    };
    icon: ThIconPref;
    layout: {
      ui?: {
        reflow?: ThLayoutUI,
        fxl?: ThLayoutUI,
        webPub?: ThLayoutUI,
      };
      radius: number;
      spacing: number;
      defaults: ThLayoutDefaultsPref;
      constraints?: {
        [key in ThConstraintKeys]?: number | null
      }
    };
    breakpoints: BreakpointsMap<number | null>;
    themes: {
      reflowOrder: Array<ThemeKey<K> | "auto">;
      fxlOrder: Array<ThemeKey<K> | "auto">;
      systemThemes?: {
        light: ThemeKey<K>;
        dark: ThemeKey<K>;
      };
      // keys never includes "auto"
      keys: Record<Exclude<ThemeKey<K>, "auto"> & string, ThemeTokens>;
    };
  };
  contentProtection?: ContentProtectionConfig;
  affordances: {
    scroll: {
      hintInImmersive: boolean;
      toggleOnMiddlePointer: Array<"tap" | "click">;
      hideOnForwardScroll: boolean;
      showOnBackwardScroll: boolean;
      affordance: ThScrollAffordance;
    },
    paginated: {
      reflow: ThPaginatedAffordancePref;
      fxl: ThPaginatedAffordancePref;
    }
  };
  actions: ThActionsPref<K>;
  shortcuts: ThShortcutsPref;
  docking: ThDockingPref<ThDockingKeys>;
  settings: {
    reflowOrder: Array<SettingsKey<K>>;
    fxlOrder: Array<SettingsKey<K>>;
    webPubOrder: Array<SettingsKey<K>>;
    keys: ThSettingsKeyTypes<K>;
    text: ThSettingsGroupPref<TextSettingsKey<K>>;
    spacing: ThSettingsGroupPref<SpacingSettingsKey<K>> & { presets?: ThSettingsSpacingPresets<K> };
  };
}

/**
 * Creates a new preferences object with the provided parameters
 * @param params The preferences object to create
 * @returns A new preferences object
 */
export const createPreferences = <K extends CustomizableKeys = {}>(
  params: ThPreferences<K>
): ThPreferences<K> => {
  // Validate actions
  if (params.actions) {
    validateObjectKeys<ActionKey<K>, ThActionsTokens>(
      [
        params.actions.reflowOrder as Array<ActionKey<K>>,
        params.actions.fxlOrder as Array<ActionKey<K>>,
        params.actions.webPubOrder as Array<ActionKey<K>>,
      ],
      params.actions.keys as Record<string, ThActionsTokens>,
      "actions"
    );
  }

  // Validate themes
  if (params.theming?.themes) {
    validateObjectKeys<ThemeKey<K> | "auto", ThemeTokens>(
      [params.theming.themes.reflowOrder as Array<ThemeKey<K> | "auto">, params.theming.themes.fxlOrder as Array<ThemeKey<K> | "auto">],
      params.theming.themes.keys as Record<string, ThemeTokens>,
      "theming.themes",
      "auto" // Special case for themes
    );
  }

  // Validate spacing presets
  if (params.settings.spacing?.presets) {
    validateObjectKeys<ThSpacingPresetKeys, ThSpacingPreset<K>>(
      [params.settings.spacing.presets.reflowOrder],
      params.settings.spacing.presets.keys as Record<string, ThSpacingPreset<K>>,
      "settings.spacing.presets",
      ["publisher", "custom"]
    );
  }

  // Validate spacing values in theming against settings
  if (params.settings?.spacing?.presets?.keys && params.settings?.keys) {
    const spacingSettings = params.settings.spacing.presets.keys;
    const spacingThemes = params.settings.spacing.presets.keys;
    
    // Helper function to adjust a value to the nearest valid step or range boundary
    const adjustSpacingValue = (key: string, value: number, context: string[]): number => {
      // Type-safe way to get the setting
      const settingKey = Object.values(ThSettingsKeys).find((k) => k === key);
      if (!settingKey) {
        return value; // Return as-is if no setting found
      }
      
      const setting = (spacingSettings as any)[settingKey];
      if (!setting) {
        return value; // Return as-is if no setting found
      }
      
      // Handle different setting types
      let range: [number, number] | undefined;
      let step: number | undefined;
      
      if (setting && typeof setting === "object" && "range" in setting) {
        range = setting.range;
        step = setting.step;
      } else if (setting && typeof setting === "object") {
        // Handle nested settings (like lineHeight and margin)
        // These will be validated when their parent key is validated
        return value;
      }
      
      let adjustedValue = value;
      
      // Adjust to range boundaries if needed
      if (range) {
        const [min, max] = range;
        if (adjustedValue < min) {
          console.warn(`Adjusting value ${ value } for ${ context.join(".") } to minimum allowed value ${ min }`);
          adjustedValue = min;
        } else if (adjustedValue > max) {
          console.warn(`Adjusting value ${ value } for ${ context.join(".") } to maximum allowed value ${ max }`);
          adjustedValue = max;
        }
      }
      
      // Adjust to nearest step if needed
      if (step && range) {
        const [min] = range;
        const steps = Math.round((adjustedValue - min) / step);
        const steppedValue = parseFloat((min + (steps * step)).toFixed(10));
        
        // Ensure the stepped value is within range (in case of floating point precision issues)
        const finalValue = Math.min(Math.max(steppedValue, range[0]), range[1]);
        
        if (Math.abs(finalValue - adjustedValue) > Number.EPSILON) {
          console.warn(`Adjusting value ${ value } for ${ context.join(".") } to nearest step value ${ finalValue }`);
          adjustedValue = finalValue;
        }
      }
      
      return adjustedValue;
    };
    
    // Process each spacing theme to adjust values to valid steps/ranges
    for (const [themeName, spacingTheme] of Object.entries(spacingThemes)) {
      if (spacingTheme && typeof spacingTheme === "object") {
        const adjustedTheme: Record<string, any> = {};
        let hasAdjustedValues = false;
        
        // Process each value in the theme
        for (const [key, value] of Object.entries(spacingTheme)) {
          if (typeof value === "number") {
            const context = ["theming", "spacing", "keys", themeName, key];
            const adjustedValue = adjustSpacingValue(key, value, context);
            adjustedTheme[key] = adjustedValue;
            
            if (adjustedValue !== value) {
              hasAdjustedValues = true;
            }
          } else {
            // Keep non-number values as-is
            adjustedTheme[key] = value;
          }
        }
        
        // Replace the theme with adjusted values if any changes were made
        if (hasAdjustedValues) {
          // @ts-ignore - We know spacingThemes[themeName] is mutable
          spacingThemes[themeName as keyof typeof spacingThemes] = adjustedTheme;
        }
      }
    }
  }
  
  // Validate font family preferences for language conflicts
  if (params.settings?.keys?.fontFamily) {
    const fontFamilyPref = params.settings.keys.fontFamily;
    const languageMap = new Map<string, string[]>();
    
    // Build a map of languages to the collections that support them
    Object.entries(fontFamilyPref).forEach(([collectionName, collectionData]) => {
      if (collectionName === "default") return;
      
      // Check if this collection has supportedLanguages (it's a ValidatedLanguageCollection)
      const supportedLangs = "supportedLanguages" in collectionData ? 
        (collectionData as ValidatedLanguageCollection).supportedLanguages : null;
        
      if (supportedLangs && Array.isArray(supportedLangs)) {
        supportedLangs.forEach((lang: string) => {
          if (!languageMap.has(lang)) {
            languageMap.set(lang, []);
          }
          languageMap.get(lang)!.push(collectionName);
        });
      }
    });
    
    // Check for conflicts and warn about them
    languageMap.forEach((collections, language) => {
      if (collections.length > 1) {
        console.warn(`Language "${ language }" is supported by multiple font collections: ${ collections.join(", ") }. This may cause ambiguous font selection. Consider consolidating to a single collection per language.`);
      }
    });
  }

  // Validate sliderWithPresets presets are reachable given range and step
  const validateRangePresets = (pref: ThSettingsRangePrefRequired, context: string): void => {
    if (pref.variant !== ThSettingsRangeVariant.sliderWithPresets || !pref.presets?.length) return;
    const [min, max] = [Math.min(...pref.range), Math.max(...pref.range)];
    const step = pref.step;
    const tolerance = step * 1e-9;
    const invalid = pref.presets.filter(p => {
      if (p < min || p > max) return true;
      const offset = (p - min) / step;
      return Math.abs(offset - Math.round(offset)) > tolerance;
    });
    if (invalid.length > 0) {
      console.warn(`${ context }: presets [${ invalid.join(", ") }] are not reachable with range=[${ min }, ${ max }] and step=${ step }.`);
    }
  };

  Object.entries(params.settings?.keys ?? {}).forEach(([key, pref]) => {
    if (pref && typeof pref === "object" && "variant" in pref) {
      validateRangePresets(pref as ThSettingsRangePrefRequired, `settings.keys.${ key }`);
    }
  });

  return params;
};

// Type helpers that support both custom and default keys
export type ActionKeyType<K extends CustomizableKeys = DefaultKeys> = K["action"] extends string ? K["action"] : ThActionsKeys;
export type ThemeKeyType<K extends CustomizableKeys = DefaultKeys> = K["theme"] extends string ? K["theme"] : ThThemeKeys;
export type SettingsKeyType<K extends CustomizableKeys = DefaultKeys> = K["settings"] extends string ? K["settings"] : ThSettingsKeys;
export type TextSettingsKeyType<K extends CustomizableKeys = DefaultKeys> = K["text"] extends string ? K["text"] : ThTextSettingsKeys;
export type SpacingSettingsKeyType<K extends CustomizableKeys = DefaultKeys> = K["spacing"] extends string ? K["spacing"] : ThSpacingSettingsKeys;