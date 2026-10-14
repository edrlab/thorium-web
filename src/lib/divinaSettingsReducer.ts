import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HydratePayload, hydrateState } from "./helpers/hydrateState";

export interface DivinaSettingsReducerState {
  quality: string | null;
  scrolled: boolean | null;
  spreads: boolean | null;
  stripWidth: number | null;
}

const initialState: DivinaSettingsReducerState = {
  quality: null,
  scrolled: null,
  spreads: null,
  stripWidth: null
}

export const divinaSettingsSlice = createSlice({
  name: "divinaSettings",
  initialState,
  reducers: {
    setDivinaQuality: (state, action) => {
      state.quality = action.payload
    },
    setDivinaScrolled: (state, action) => {
      state.scrolled = action.payload
    },
    setDivinaSpreads: (state, action) => {
      state.spreads = action.payload
    },
    setDivinaStripWidth: (state, action) => {
      state.stripWidth = action.payload
    },
    hydrateDivinaSettings: (state, action: PayloadAction<HydratePayload<DivinaSettingsReducerState>>) => hydrateState(state, initialState, action.payload)
  }
});

export const initialDivinaSettingsState = initialState;

// Action creators are generated for each case reducer function
export const {
  setDivinaQuality,
  setDivinaScrolled,
  setDivinaSpreads,
  setDivinaStripWidth,
  hydrateDivinaSettings
} = divinaSettingsSlice.actions;

export default divinaSettingsSlice.reducer;
