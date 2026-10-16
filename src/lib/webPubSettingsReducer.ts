import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HydratePayload, hydrateState } from "./helpers/hydrateState";

import { 
  ThLineHeightOptions, 
  ThSpacingPresetKeys, 
  ThSpacingSettingsKeys, 
  ThTextAlignOptions 
} from "@/preferences/models";

import { 
  FontFamilyStateObject, 
  SetFontFamilyPayload, 
  handleSpacingSetting, 
  SetSpacingPresetPayload, 
  SpacingStateObject 
} from "./settingsReducer";

export interface WebPubSettingsReducerState {
  fontFamily: FontFamilyStateObject;
  fontWeight: number;
  hyphens: boolean | null;
  letterSpacing: number | null;
  ligatures: boolean | null;
  lineHeight: ThLineHeightOptions | null;
  noRuby: boolean | null;
  paragraphIndent: number | null;
  paragraphSpacing: number | null;
  publisherStyles: boolean;
  spacing: SpacingStateObject;
  textAlign: ThTextAlignOptions;
  textNormalization: boolean;
  wordSpacing: number | null;
  zoom: number;
}

const initialState: WebPubSettingsReducerState = {
  fontFamily: { default: "publisher" },
  fontWeight: 400,
  hyphens: null,
  letterSpacing: null,
  ligatures: null,
  lineHeight: ThLineHeightOptions.publisher,
  noRuby: null,
  paragraphIndent: null,
  paragraphSpacing: null,
  publisherStyles: true,
  spacing: {
    preset: ThSpacingPresetKeys.publisher,
    custom: {},
    baseline: {}
  },
  textAlign: ThTextAlignOptions.publisher,
  textNormalization: false,
  wordSpacing: null,
  zoom: 1
}

export const webPubSettingsSlice = createSlice({
  name: "webPubSettings",
  initialState,
  reducers: {
    setWebPubFontFamily: (state, action: SetFontFamilyPayload) => {
      const { key, value } = action.payload;
      state.fontFamily[key] = value;
    },
    setWebPubFontWeight: (state, action) => {
      state.fontWeight = action.payload
    },
    setWebPubHyphens: (state, action) => {
      state.hyphens = action.payload
    },
    setWebPubLigatures: (state, action) => {
      state.ligatures = action.payload
    },
    setWebPubLetterSpacing: (state, action) => {
      handleSpacingSetting(state, action, ThSpacingSettingsKeys.letterSpacing);
    },
    setWebPubLineHeight: (state, action) => {
      handleSpacingSetting(state, action, ThSpacingSettingsKeys.lineHeight);
    },
    setWebPubParagraphIndent: (state, action) => {
      handleSpacingSetting(state, action, ThSpacingSettingsKeys.paragraphIndent);
    },
    setWebPubParagraphSpacing: (state, action) => {
      handleSpacingSetting(state, action, ThSpacingSettingsKeys.paragraphSpacing);
    },
    setWebPubPublisherStyles: (state, action) => {
      state.publisherStyles = action.payload
    },
    setWebPubSpacingPreset: (state, action: SetSpacingPresetPayload) => {
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
    setWebPubTextAlign: (state, action) => {
      state.textAlign = action.payload
    },
    setWebPubTextNormalization: (state, action) => {
      state.textNormalization = action.payload
    },
    setWebPubNoRuby: (state, action) => {
      state.noRuby = action.payload
    },
    setWebPubWordSpacing: (state, action) => {
      handleSpacingSetting(state, action, ThSpacingSettingsKeys.wordSpacing);
    },
    setWebPubZoom: (state, action) => {
      state.zoom = action.payload
    },
    hydrateWebPubSettings: (state, action: PayloadAction<HydratePayload<WebPubSettingsReducerState>>) => hydrateState(state, initialState, action.payload)
  }
});

export const initialWebPubSettingsState = initialState;

// Action creators are generated for each case reducer function
export const {
  setWebPubFontFamily,
  setWebPubFontWeight,
  setWebPubHyphens,
  setWebPubLigatures,
  setWebPubLetterSpacing,
  setWebPubLineHeight,
  setWebPubParagraphIndent,
  setWebPubParagraphSpacing,
  setWebPubPublisherStyles,
  setWebPubSpacingPreset,
  setWebPubTextAlign,
  setWebPubTextNormalization,
  setWebPubNoRuby,
  setWebPubWordSpacing,
  setWebPubZoom,
  hydrateWebPubSettings
} = webPubSettingsSlice.actions;

export default webPubSettingsSlice.reducer;