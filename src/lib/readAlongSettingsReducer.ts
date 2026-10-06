import { createSlice } from "@reduxjs/toolkit";

import { ReadAloudSettings } from "@readium/navigator";

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
  wordStyle: null
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
    setReadAlongUtteranceStyle: (state, action) => {
      state.utteranceStyle = action.payload
    },
    setReadAlongWordStyle: (state, action) => {
      state.wordStyle = action.payload
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
  setReadAlongWordStyle
} = readAlongSettingsSlice.actions;

export default readAlongSettingsSlice.reducer;
