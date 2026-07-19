import { ThSheetHeaderVariant } from "./actions";
import { I18nValue } from "./i18n";

export interface ThSettingsGroupPref<T> {
  main: T[];
  subPanel: T[] | null;
  header?: ThSheetHeaderVariant;
}

export interface ThSettingsRangePref {
  variant?: ThSettingsRangeVariant;
  placeholder?: I18nValue<ThSettingsRangePlaceholder>;
  range?: [number, number];
  step?: number;
  presets?: number[];
}

/**
 * Use instead of ThSettingsRangePrefRequired for default values,
 * so that presets remains optional.
 */
export type ThSettingsRangePrefRequired = Required<Omit<ThSettingsRangePref, "presets">> & Pick<ThSettingsRangePref, "presets">;

export interface ThSettingsRadioPref<T extends string> {
  allowUnset?: boolean;
  keys: {
    [key in T]: number;
  };
}

/** Restricts which values a choice-based setting offers in its UI */
export interface ThSettingsChoicesPref<T extends string> {
  choices: T[];
}

export enum ThSettingsKeys {
  columns = "columns",
  divinaLayout = "divinaLayout",
  divinaQuality = "divinaQuality",
  divinaSpreads = "divinaSpreads",
  divinaStripWidth = "divinaStripWidth",
  fontFamily = "fontFamily",
  fontWeight = "fontWeight",
  hyphens = "hyphens",
  layout = "layout",
  letterSpacing = "letterSpacing",
  ligatures = "ligatures",
  lineHeight = "lineHeight",
  noRuby = "noRuby",
  paragraphIndent = "paragraphIndent",
  paragraphSpacing = "paragraphSpacing",
  publisherStyles = "publisherStyles",
  spacingGroup = "spacingGroup",
  spacingPresets = "spacingPresets",
  textAlign = "textAlign",
  textGroup = "textGroup",
  textNormalize = "textNormalize",
  theme = "theme",
  wordSpacing = "wordSpacing",
  zoom = "zoom"
}

export enum ThTextSettingsKeys {
  fontFamily = "fontFamily",
  fontWeight = "fontWeight",
  hyphens = "hyphens",
  ligatures = "ligatures",
  noRuby = "noRuby",
  textAlign = "textAlign",
  textNormalize = "textNormalize"
}

export enum ThSpacingSettingsKeys {
  letterSpacing = "letterSpacing",
  lineHeight = "lineHeight",
  paragraphIndent = "paragraphIndent",
  paragraphSpacing = "paragraphSpacing",
  publisherStyles = "publisherStyles",
  spacingPresets = "spacingPresets",
  wordSpacing = "wordSpacing"
}

export enum ThSettingsContainerKeys {
  initial = "initial",
  text = "text",
  spacing = "spacing"
}

export enum ThSettingsRangeVariant {
  slider = "slider",
  incrementedSlider = "incrementedSlider",
  numberField = "numberField",
  sliderWithPresets = "sliderWithPresets",
  presetsGroup = "presetsGroup"
}

export enum ThSettingsRangePlaceholder {
  range = "range",
  none = "none"
}

export enum ThSpacingPresetKeys {
  publisher = "publisher",
  tight = "tight",
  balanced = "balanced",
  loose = "loose",
  accessible = "accessible",
  custom = "custom"
}

export enum ThLayoutOptions { 
  scroll = "scroll_option",
  paginated = "page_option"
}

export enum ThTextAlignOptions {
  publisher = "publisher",
  start = "start",
  justify = "justify"
}

export enum ThLineHeightOptions {
  publisher = "publisher",
  small = "small",
  medium = "medium",
  large = "large"
}

export const defaultTextSettingsMain = [ThTextSettingsKeys.fontFamily];

export const defaultTextSettingsSubpanel = [
  ThTextSettingsKeys.fontFamily,
  ThTextSettingsKeys.textAlign,
  ThTextSettingsKeys.hyphens,
  ThTextSettingsKeys.fontWeight,
  ThTextSettingsKeys.textNormalize,
  ThTextSettingsKeys.ligatures,
  ThTextSettingsKeys.noRuby
]

export const defaultSpacingSettingsMain = [
  ThSpacingSettingsKeys.spacingPresets
];

export const defaultSpacingSettingsSubpanel = [
  ThSpacingSettingsKeys.spacingPresets,
  ThSpacingSettingsKeys.lineHeight,
  ThSpacingSettingsKeys.paragraphSpacing,
  ThSpacingSettingsKeys.paragraphIndent,
  ThSpacingSettingsKeys.wordSpacing,
  ThSpacingSettingsKeys.letterSpacing
];

export const defaultSpacingPresetsOrder = [
  ThSpacingPresetKeys.publisher,
  ThSpacingPresetKeys.accessible,
  ThSpacingPresetKeys.custom,
  ThSpacingPresetKeys.tight,
  ThSpacingPresetKeys.balanced,
  ThSpacingPresetKeys.loose
]

export const defaultParagraphSpacing: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.numberField,
  placeholder: ThSettingsRangePlaceholder.range,
  range: [0, 3],
  step: 0.25
}

export const defaultParagraphIndent: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.numberField,
  placeholder: ThSettingsRangePlaceholder.range,
  range: [0, 2],
  step: 0.25
}

export const defaultWordSpacing: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.numberField,
  placeholder: ThSettingsRangePlaceholder.range,
  range: [0, 1],
  step: 0.1
}

export const defaultLetterSpacing: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.numberField,
  placeholder: ThSettingsRangePlaceholder.range,
  range: [0, 0.5],
  step: 0.05
}

export const defaultLineHeights = {
  [ThLineHeightOptions.small]: 1.35,
  [ThLineHeightOptions.medium]: 1.5,
  [ThLineHeightOptions.large]: 1.75
}

export const defaultZoom: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.numberField,
  placeholder: ThSettingsRangePlaceholder.range,
  range: [0.7, 4],
  step: 0.05
}

export const defaultSpacingPresets = {
  [ThSpacingPresetKeys.tight]: {
    [ThSpacingSettingsKeys.lineHeight]: ThLineHeightOptions.small,
    [ThSpacingSettingsKeys.paragraphSpacing]: 0.25,
    [ThSpacingSettingsKeys.paragraphIndent]: 1
  },
  [ThSpacingPresetKeys.balanced]: {
    [ThSpacingSettingsKeys.lineHeight]: ThLineHeightOptions.medium,
    [ThSpacingSettingsKeys.paragraphSpacing]: 1,
    [ThSpacingSettingsKeys.paragraphIndent]: 1
  },
  [ThSpacingPresetKeys.loose]: {
    [ThSpacingSettingsKeys.lineHeight]: ThLineHeightOptions.large,
    [ThSpacingSettingsKeys.paragraphSpacing]: 1.5,
    [ThSpacingSettingsKeys.paragraphIndent]: 1
  },
  [ThSpacingPresetKeys.accessible]: {
    [ThSpacingSettingsKeys.lineHeight]: ThLineHeightOptions.large,
    [ThSpacingSettingsKeys.paragraphSpacing]: 2.5,
    [ThSpacingSettingsKeys.paragraphIndent]: 1,
    [ThSpacingSettingsKeys.letterSpacing]: 0.1,
    [ThSpacingSettingsKeys.wordSpacing]: 0.3
  }
}