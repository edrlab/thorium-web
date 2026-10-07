import { createSlice } from "@reduxjs/toolkit";

import { ReadAloudDecorationStyle, ReadAloudSettings } from "@readium/navigator";
import { ThReadAlongHighlightKeys, ThReadAlongHighlightPresetKeys } from "@/preferences/models";

export type HighlightStateKey = ThReadAlongHighlightKeys.utteranceStyle | ThReadAlongHighlightKeys.wordStyle;

// A style without tint takes the reading theme's color
export interface HighlightStateObject {
  preset: ThReadAlongHighlightPresetKeys;
  custom: Partial<Record<HighlightStateKey, ReadAloudDecorationStyle>>;
  baseline: Partial<Record<HighlightStateKey, ReadAloudDecorationStyle>>;
}

export interface SetHighlightStylePayload {
  type: string;
  payload: {
    value: ReadAloudDecorationStyle;
    effective: ReadAloudDecorationStyle | null;
    preset?: ThReadAlongHighlightPresetKeys;
  }
}

export interface SetHighlightPresetPayload {
  type: string;
  payload: {
    preset: ThReadAlongHighlightPresetKeys;
    values: Partial<Record<HighlightStateKey, ReadAloudDecorationStyle>>;
    effective: Partial<Record<HighlightStateKey, ReadAloudDecorationStyle | null>>;
  }
}

const initialHighlightState: HighlightStateObject = {
  preset: ThReadAlongHighlightPresetKeys.sentenceAndWord,
  custom: {},
  baseline: {}
};

const handleHighlightStyle = (state: ReadAlongSettingsReducerState, action: SetHighlightStylePayload, key: HighlightStateKey) => {
  const { value, effective, preset } = action.payload;

  state[key] = effective;

  if (!preset) return;

  // Persisted before highlight existed
  if (!state.highlight) {
    state.highlight = { ...initialHighlightState };
  }

  if (state.highlight.preset !== ThReadAlongHighlightPresetKeys.custom) {
    state.highlight.preset = ThReadAlongHighlightPresetKeys.custom;
    state.highlight.custom = state.highlight.baseline;
  }

  state.highlight.custom[key] = value;
};

export interface ReadAlongSettingsReducerState {
  // Set on the navigator with setVoice() rather than as a preference
  voice: string | null;
  format: ReadAloudSettings["format"] | null;
  inlineContextualization: boolean | null;
  verbosity: ReadAloudSettings["verbosity"] | null;
  skip: ReadAloudSettings["skip"] | null;
  contextualize: ReadAloudSettings["contextualize"] | null;
  language: ReadAloudSettings["language"] | null;
  segmentation: ReadAloudSettings["segmentation"] | null;
  pauseDuration: number | null;
  autoPause: ReadAloudSettings["autoPause"] | null;
  rate: number | null;
  pitch: number | null;
  volume: number | null;
  utteranceStyle: ReadAloudSettings["utteranceStyle"] | null;
  wordStyle: ReadAloudSettings["wordStyle"] | null;
  highlight: HighlightStateObject;
}

const initialState: ReadAlongSettingsReducerState = {
  voice: null,
  format: null,
  inlineContextualization: null,
  verbosity: null,
  skip: null,
  contextualize: null,
  language: null,
  segmentation: null,
  pauseDuration: null,
  autoPause: null,
  rate: null,
  pitch: null,
  volume: null,
  utteranceStyle: null,
  wordStyle: null,
  highlight: initialHighlightState
};

export const readAlongSettingsSlice = createSlice({
  name: "readAlongSettings",
  initialState,
  reducers: {
    setReadAlongVoice: (state, action) => {
      state.voice = action.payload
    },
    setReadAlongFormat: (state, action) => {
      state.format = action.payload
    },
    setReadAlongInlineContextualization: (state, action) => {
      state.inlineContextualization = action.payload
    },
    setReadAlongVerbosity: (state, action) => {
      state.verbosity = action.payload
    },
    setReadAlongSkip: (state, action) => {
      state.skip = action.payload
    },
    setReadAlongContextualize: (state, action) => {
      state.contextualize = action.payload
    },
    setReadAlongLanguage: (state, action) => {
      state.language = action.payload
    },
    setReadAlongSegmentation: (state, action) => {
      state.segmentation = action.payload
    },
    setReadAlongPauseDuration: (state, action) => {
      state.pauseDuration = action.payload
    },
    setReadAlongAutoPause: (state, action) => {
      state.autoPause = action.payload
    },
    setReadAlongRate: (state, action) => {
      state.rate = action.payload
    },
    setReadAlongPitch: (state, action) => {
      state.pitch = action.payload
    },
    setReadAlongVolume: (state, action) => {
      state.volume = action.payload
    },
    setReadAlongUtteranceStyle: (state, action: SetHighlightStylePayload) => {
      handleHighlightStyle(state, action, ThReadAlongHighlightKeys.utteranceStyle);
    },
    setReadAlongWordStyle: (state, action: SetHighlightStylePayload) => {
      handleHighlightStyle(state, action, ThReadAlongHighlightKeys.wordStyle);
    },
    setReadAlongHighlightPreset: (state, action: SetHighlightPresetPayload) => {
      const { preset, values, effective } = action.payload;

      if (!state.highlight) {
        state.highlight = { ...initialHighlightState };
      }

      state.highlight.preset = preset;

      if (preset !== ThReadAlongHighlightPresetKeys.custom) {
        state.highlight.baseline = values;
      }

      state.utteranceStyle = effective[ThReadAlongHighlightKeys.utteranceStyle] ?? null;
      state.wordStyle = effective[ThReadAlongHighlightKeys.wordStyle] ?? null;
    },
    setReadAlongHighlightEffective: (state, action: { payload: Partial<Record<HighlightStateKey, ReadAloudDecorationStyle | null>> }) => {
      if (action.payload[ThReadAlongHighlightKeys.utteranceStyle] !== undefined) {
        state.utteranceStyle = action.payload[ThReadAlongHighlightKeys.utteranceStyle];
      }
      if (action.payload[ThReadAlongHighlightKeys.wordStyle] !== undefined) {
        state.wordStyle = action.payload[ThReadAlongHighlightKeys.wordStyle];
      }
    }
  }
});

export const {
  setReadAlongVoice,
  setReadAlongFormat,
  setReadAlongInlineContextualization,
  setReadAlongVerbosity,
  setReadAlongSkip,
  setReadAlongContextualize,
  setReadAlongLanguage,
  setReadAlongSegmentation,
  setReadAlongPauseDuration,
  setReadAlongAutoPause,
  setReadAlongRate,
  setReadAlongPitch,
  setReadAlongVolume,
  setReadAlongUtteranceStyle,
  setReadAlongWordStyle,
  setReadAlongHighlightPreset,
  setReadAlongHighlightEffective
} = readAlongSettingsSlice.actions;

export default readAlongSettingsSlice.reducer;
