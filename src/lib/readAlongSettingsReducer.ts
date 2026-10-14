import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HydratePayload, hydrateState } from "./helpers/hydrateState";

import { ReadAloudDecorationStyle, ReadAloudSettings } from "@readium/navigator";
import { ThReadAlongHighlightKeys, ThReadAlongHighlightPresetKeys, ThReadAlongProsodyKeys, ThReadAlongProsodyPresetKeys } from "@/preferences/models";

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

export type ProsodyStateKey = ThReadAlongProsodyKeys.rate | ThReadAlongProsodyKeys.pauseDuration | ThReadAlongProsodyKeys.autoPause;

export type ProsodyValues = {
  [ThReadAlongProsodyKeys.rate]?: number | null;
  [ThReadAlongProsodyKeys.pauseDuration]?: number | null;
  [ThReadAlongProsodyKeys.autoPause]?: ReadAloudSettings["autoPause"] | null;
};

// A null value falls back to the navigator's default
export interface ProsodyStateObject {
  preset: ThReadAlongProsodyPresetKeys;
  custom: ProsodyValues;
  baseline: ProsodyValues;
}

export interface SetProsodyPresetPayload {
  type: string;
  payload: {
    preset: ThReadAlongProsodyPresetKeys;
    values: ProsodyValues;
    effective: ProsodyValues;
  }
}

const initialProsodyState: ProsodyStateObject = {
  preset: ThReadAlongProsodyPresetKeys.default,
  custom: {},
  baseline: {}
};

const handleProsodyValue = <K extends ProsodyStateKey>(state: ReadAlongSettingsReducerState, key: K, value: ReadAlongSettingsReducerState[K]) => {
  state[key] = value;

  // Persisted before prosody existed
  if (!state.prosody) {
    state.prosody = { ...initialProsodyState };
  }

  if (state.prosody.preset !== ThReadAlongProsodyPresetKeys.custom) {
    state.prosody.preset = ThReadAlongProsodyPresetKeys.custom;
    state.prosody.custom = { ...state.prosody.baseline };
  }

  state.prosody.custom[key] = value;
};

export type ReadAlongVerbosityKey = "reflow" | "fxl" | "divina";

export type ReadAlongVerbosityStateObject = Partial<Record<ReadAlongVerbosityKey, ReadAloudSettings["verbosity"]>>;

export interface ReadAlongVerbosityChangePayload {
  type: string;
  payload: {
    key: ReadAlongVerbosityKey;
    value?: ReadAloudSettings["verbosity"] | null;
  }
}

export interface ReadAlongSettingsReducerState {
  // Set on the navigator with setVoice() rather than as a preference
  voice: string | null;
  format: ReadAloudSettings["format"] | null;
  inlineContextualization: boolean | null;
  keepCentered: boolean | null;
  verbosity: ReadAlongVerbosityStateObject;
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
  prosody: ProsodyStateObject;
}

const initialState: ReadAlongSettingsReducerState = {
  voice: null,
  format: null,
  inlineContextualization: null,
  keepCentered: null,
  verbosity: {},
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
  highlight: initialHighlightState,
  prosody: initialProsodyState
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
    setReadAlongKeepCentered: (state, action) => {
      state.keepCentered = action.payload
    },
    setReadAlongVerbosity: (state, action: ReadAlongVerbosityChangePayload) => {
      // Persisted before verbosity was stored per format
      if (!state.verbosity || typeof state.verbosity !== "object") {
        state.verbosity = {};
      }
      state.verbosity[action.payload.key] = action.payload.value ?? undefined;
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
      handleProsodyValue(state, ThReadAlongProsodyKeys.pauseDuration, action.payload);
    },
    setReadAlongAutoPause: (state, action) => {
      handleProsodyValue(state, ThReadAlongProsodyKeys.autoPause, action.payload);
    },
    setReadAlongRate: (state, action) => {
      handleProsodyValue(state, ThReadAlongProsodyKeys.rate, action.payload);
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
    setReadAlongProsodyPreset: (state, action: SetProsodyPresetPayload) => {
      const { preset, values, effective } = action.payload;

      if (!state.prosody) {
        state.prosody = { ...initialProsodyState };
      }

      state.prosody.preset = preset;

      if (preset !== ThReadAlongProsodyPresetKeys.custom) {
        state.prosody.baseline = values;
      }

      state.rate = effective[ThReadAlongProsodyKeys.rate] ?? null;
      state.pauseDuration = effective[ThReadAlongProsodyKeys.pauseDuration] ?? null;
      state.autoPause = effective[ThReadAlongProsodyKeys.autoPause] ?? null;
    },
    setReadAlongProsodyEffective: (state, action: { payload: ProsodyValues }) => {
      if (action.payload[ThReadAlongProsodyKeys.rate] !== undefined) {
        state.rate = action.payload[ThReadAlongProsodyKeys.rate];
      }
      if (action.payload[ThReadAlongProsodyKeys.pauseDuration] !== undefined) {
        state.pauseDuration = action.payload[ThReadAlongProsodyKeys.pauseDuration];
      }
      if (action.payload[ThReadAlongProsodyKeys.autoPause] !== undefined) {
        state.autoPause = action.payload[ThReadAlongProsodyKeys.autoPause];
      }
    },
    setReadAlongHighlightEffective: (state, action: { payload: Partial<Record<HighlightStateKey, ReadAloudDecorationStyle | null>> }) => {
      if (action.payload[ThReadAlongHighlightKeys.utteranceStyle] !== undefined) {
        state.utteranceStyle = action.payload[ThReadAlongHighlightKeys.utteranceStyle];
      }
      if (action.payload[ThReadAlongHighlightKeys.wordStyle] !== undefined) {
        state.wordStyle = action.payload[ThReadAlongHighlightKeys.wordStyle];
      }
    },
    hydrateReadAlongSettings: (state, action: PayloadAction<HydratePayload<ReadAlongSettingsReducerState>>) => {
      const hydrated = hydrateState(state, initialState, action.payload);
      const verbosity = action.payload.values.verbosity;
      if (!verbosity) return hydrated;
      // Only the publication's format is stored, the others keep their value
      const current = typeof state.verbosity === "object" ? state.verbosity : {};
      return { ...hydrated, verbosity: { ...current, ...verbosity } };
    }
  }
});

export const {
  setReadAlongVoice,
  setReadAlongFormat,
  setReadAlongInlineContextualization,
  setReadAlongKeepCentered,
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
  setReadAlongHighlightEffective,
  setReadAlongProsodyPreset,
  setReadAlongProsodyEffective,
  hydrateReadAlongSettings
} = readAlongSettingsSlice.actions;

export default readAlongSettingsSlice.reducer;
