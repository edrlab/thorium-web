import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HydratePayload, hydrateState } from "./helpers/hydrateState";

import { 
  ThLineHeightOptions, 
  ThSpacingPresetKeys, 
  ThSpacingSettingsKeys, 
  ThTextAlignOptions 
} from "@/preferences/models";

export interface FontFamilyStateObject {
  default: string;
  [language: string]: string;
}

export interface SetFontFamilyPayload {
  type: string;
  payload: {
    key: "default" | string;
    value: string;
  }
}

export interface LineLengthStateObject {
  optimal?: number | null;
  min?: {
    chars?: number | null;
    isDisabled?: boolean;
  },
  max?: {
    chars?: number | null;
    isDisabled?: boolean;
  }
}

export interface SetLineLengthPayload {
  type: string;
  payload: {
    key: "optimal" | "min" | "max";
    value?: number | null;
    isDisabled?: boolean;
  }
}

export interface SetSpacingSettingPayload<T = number | ThLineHeightOptions | null> {
  type: string;
  payload: {
    value: T;
    preset?: ThSpacingPresetKeys;
  }
}

export interface SetSpacingPresetPayload {
  type: string;
  payload: {
    preset: ThSpacingPresetKeys;
    values: Partial<Record<SpacingStateKey, number | ThLineHeightOptions | null>>;
  }
}

export type SpacingStateKey = Exclude<ThSpacingSettingsKeys, ThSpacingSettingsKeys.spacingPresets | ThSpacingSettingsKeys.publisherStyles>;

export interface SpacingStateObject {
  preset: ThSpacingPresetKeys;
  custom: Partial<Record<SpacingStateKey, number | ThLineHeightOptions | null>>;
  baseline: Partial<Record<SpacingStateKey, number | ThLineHeightOptions | null>>;
}

export interface SettingsReducerState {
  columnCount: string;
  fontFamily: FontFamilyStateObject;
  fontSize: number;
  fontWeight: number;
  hyphens: boolean | null;
  letterSpacing: number | null;
  ligatures: boolean | null;
  lineHeight: ThLineHeightOptions | null;
  lineLength: LineLengthStateObject | null;
  noRuby: boolean | null;
  paragraphIndent: number | null;
  paragraphSpacing: number | null;
  publisherStyles: boolean;
  scroll: boolean;
  spacing: SpacingStateObject;
  textAlign: ThTextAlignOptions;
  textNormalization: boolean;
  wordSpacing: number | null;
}

const initialState: SettingsReducerState = {
  columnCount: "auto",
  fontFamily: { default: "publisher" },
  fontSize: 1,
  fontWeight: 400,
  hyphens: null,
  letterSpacing: null,
  ligatures: null,
  lineHeight: ThLineHeightOptions.publisher,
  lineLength: null,
  noRuby: null,
  paragraphIndent: null,
  paragraphSpacing: null,
  publisherStyles: true,
  scroll: false,
  spacing: {
    preset: ThSpacingPresetKeys.publisher,
    custom: {},
    baseline: {}
  },
  textAlign: ThTextAlignOptions.publisher,
  textNormalization: false,
  wordSpacing: null,
}

const checkRootSpacingSettingsAtInit = (state: SettingsReducerState) => {
  return (
    state.letterSpacing === null &&
    state.lineHeight === ThLineHeightOptions.publisher &&
    state.paragraphIndent === null &&
    state.paragraphSpacing === null &&
    state.wordSpacing === null
  );
}

export const handleSpacingSetting = (state: any, action: SetSpacingSettingPayload, settingKey: ThSpacingSettingsKeys) => {
  const { value, preset } = action.payload;

  state.publisherStyles = false;

  if (!preset) {
    state[settingKey] = value;

    if (checkRootSpacingSettingsAtInit(state)) {
      state.publisherStyles = true;
    }

    return;
  }

  // Initialize spacing state if needed
  if (!state.spacing) {
    state.spacing = {
      preset: ThSpacingPresetKeys.custom,
      custom: {
        [settingKey]: value
      }
    };
  }

  // Ensure custom exist for backward compatibility
  if (!state.spacing.custom) {
    state.spacing.custom = {};
  }

  if (state.spacing.preset !== ThSpacingPresetKeys.custom) {
    state.spacing.preset = ThSpacingPresetKeys.custom;
    state.spacing.custom = state.spacing.baseline;
  } 

  if (value === null) {
    delete state.spacing.custom[settingKey];
  } else {
    state.spacing.custom[settingKey] = value;
  }
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setColumnCount: (state, action) => {
      state.columnCount = action.payload
    },
    setFontFamily: (state, action: SetFontFamilyPayload) => {
      const { key, value } = action.payload;
      state.fontFamily[key] = value;
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload
    },
    setFontWeight: (state, action) => {
      state.fontWeight = action.payload
    },
    setHyphens: (state, action) => {
      state.hyphens = action.payload
    },
    setLigatures: (state, action) => {
      state.ligatures = action.payload
    },
    setLetterSpacing: (state, action) => {
      handleSpacingSetting(state, action, ThSpacingSettingsKeys.letterSpacing);
    },
    setLineHeight: (state, action) => {
      handleSpacingSetting(state, action, ThSpacingSettingsKeys.lineHeight);
    },
    setLineLength: (state, action: SetLineLengthPayload) => {
      // For min and max, we need to spread and handle isDisabled
      // when it is directly set, or depending on the payload value
      const deriveIsDisabled = (value: number | null | undefined, isDisabled?: boolean): boolean => {
        if (value === null) return true;
        if (isDisabled !== undefined) return isDisabled;
        return false;
      };

      switch (action.payload.key) {
        case "optimal":
          if (action.payload.value) {
            state.lineLength = {
              ...state.lineLength,
              optimal: action.payload.value
            };
          }
          break;
        
        case "min":
          state.lineLength = {
            ...state.lineLength,
            min: {
              ...state.lineLength?.min,
              chars: action.payload.value !== undefined 
                ? action.payload.value 
                : state.lineLength?.min?.chars,
              isDisabled: deriveIsDisabled(action.payload.value, action.payload.isDisabled)
            }
          };
          break;
        
        case "max":
          state.lineLength = {
            ...state.lineLength,
            max: {
              ...state.lineLength?.max,
              chars: action.payload.value !== undefined 
                ? action.payload.value 
                : state.lineLength?.max?.chars,
              isDisabled: deriveIsDisabled(action.payload.value, action.payload.isDisabled)
            }
          };
          break;
        default:
          break;
      }
    },
    setParagraphIndent: (state, action) => {
      handleSpacingSetting(state, action, ThSpacingSettingsKeys.paragraphIndent);
    },
    setParagraphSpacing: (state, action) => {
      handleSpacingSetting(state, action, ThSpacingSettingsKeys.paragraphSpacing);
    },
    setPublisherStyles: (state, action) => {
      state.publisherStyles = action.payload
    },
    setScroll: (state, action) => {
      state.scroll = action.payload
    },
    setSpacingPreset: (state, action: SetSpacingPresetPayload) => {
      const { preset, values } = action.payload;

      // Initialize spacing state if needed
      if (!state.spacing) {
        state.spacing = {
          preset: preset,
          custom: {},
          baseline: {}
        };
      }

      state.spacing.preset = preset;

      if (preset !== ThSpacingPresetKeys.custom) {
        state.spacing.baseline = values;
      }

      if (preset === ThSpacingPresetKeys.publisher) {
        state.publisherStyles = true;
      } else {
        state.publisherStyles = false;
      }
    },
    setTextAlign: (state, action) => {
      state.textAlign = action.payload
    },
    setTextNormalization: (state, action) => {
      state.textNormalization = action.payload
    },
    setNoRuby: (state, action) => {
      state.noRuby = action.payload
    },
    setWordSpacing: (state, action) => {
      handleSpacingSetting(state, action, ThSpacingSettingsKeys.wordSpacing);
    },
    hydrateSettings: (state, action: PayloadAction<HydratePayload<SettingsReducerState>>) => hydrateState(state, initialState, action.payload)
  }
});

export const initialSettingsState = initialState;

// Action creators are generated for each case reducer function
export const { 
  setColumnCount,
  setFontSize,
  setFontWeight, 
  setFontFamily,
  setHyphens,
  setLigatures,
  setLetterSpacing,
  setLineHeight,
  setLineLength,
  setParagraphIndent,
  setParagraphSpacing,
  setPublisherStyles,
  setScroll,
  setSpacingPreset,
  setTextAlign,
  setTextNormalization,
  setNoRuby,
  setWordSpacing,
  hydrateSettings
} = settingsSlice.actions;

export default settingsSlice.reducer;