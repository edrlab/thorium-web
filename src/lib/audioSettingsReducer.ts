import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HydratePayload, hydrateState } from "./helpers/hydrateState";

export interface AudioSettingsState {
  volume: number;
  playbackRate: number;
  preservePitch: boolean;
  skipBackwardInterval: number;
  skipForwardInterval: number;
  skipInterval: number;
  pollInterval: number;
  autoPlay: boolean;
  enableMediaSession: boolean;
}

const initialState: AudioSettingsState = {
  volume: 1,
  playbackRate: 1,
  preservePitch: true,
  skipBackwardInterval: 10,
  skipForwardInterval: 10,
  skipInterval: 10,
  pollInterval: 1000,
  autoPlay: true,
  enableMediaSession: true,
};

export const audioSettingsSlice = createSlice({
  name: "audioSettings",
  initialState,
  reducers: {
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setPlaybackRate: (state, action) => {
      state.playbackRate = action.payload;
    },
    setPreservePitch: (state, action) => {
      state.preservePitch = action.payload;
    },
    setSkipBackwardInterval: (state, action) => {
      state.skipBackwardInterval = action.payload;
    },
    setSkipForwardInterval: (state, action) => {
      state.skipForwardInterval = action.payload;
    },
    setSkipInterval: (state, action) => {
      state.skipInterval = action.payload;
    },
    setPollInterval: (state, action) => {
      state.pollInterval = action.payload;
    },
    setAutoPlay: (state, action) => {
      state.autoPlay = action.payload;
    },
    setEnableMediaSession: (state, action) => {
      state.enableMediaSession = action.payload;
    },
    hydrateAudioSettings: (state, action: PayloadAction<HydratePayload<AudioSettingsState>>) => hydrateState(state, initialState, action.payload),
  },
});

export const {
  setVolume,
  setPlaybackRate,
  setPreservePitch,
  setSkipBackwardInterval,
  setSkipForwardInterval,
  setSkipInterval,
  setPollInterval,
  setAutoPlay,
  setEnableMediaSession,
  hydrateAudioSettings,
} = audioSettingsSlice.actions;

export default audioSettingsSlice.reducer;
