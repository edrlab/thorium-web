import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ReadAloudState } from "@readium/navigator";

export interface ReadAlongSleepTimerState {
  remainingSeconds: number | null;
  onChapterEnd: boolean;
  onUtteranceEnd: boolean;
}

export interface ReadAlongMetadata {
  title: string;
  subtitle?: string;
  authors?: string[];
  coverUrl?: string;
}

export type ReadAlongLayout = "mini" | "expanded";

export interface ReadAlongPlayerReducerState {
  isActive: boolean;
  layout: ReadAlongLayout;
  metadata: ReadAlongMetadata | null;
  status: ReadAloudState;
  hasWordBoundaries: boolean;
  sleepTimer: ReadAlongSleepTimerState;
}

const initialState: ReadAlongPlayerReducerState = {
  isActive: false,
  layout: "mini",
  metadata: null,
  status: "idle",
  hasWordBoundaries: true,
  sleepTimer: { remainingSeconds: null, onChapterEnd: false, onUtteranceEnd: false }
};

export const readAlongPlayerSlice = createSlice({
  name: "readAlongPlayer",
  initialState,
  reducers: {
    setReadAlongActive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
    },
    setReadAlongLayout: (state, action: PayloadAction<ReadAlongLayout>) => {
      state.layout = action.payload;
    },
    setReadAlongStatus: (state, action: PayloadAction<ReadAloudState>) => {
      state.status = action.payload;
    },
    setReadAlongWordBoundaries: (state, action: PayloadAction<boolean>) => {
      state.hasWordBoundaries = action.payload;
    },
    setReadAlongSleepTimer: (state, action: PayloadAction<Partial<ReadAlongSleepTimerState>>) => {
      state.sleepTimer = { ...state.sleepTimer, ...action.payload };
    },
    setReadAlongMetadata: (state, action: PayloadAction<ReadAlongMetadata | null>) => {
      state.metadata = action.payload;
    },
    resetReadAlongPlayer: (state) => ({ ...initialState, isActive: state.isActive, layout: state.layout, metadata: state.metadata })
  }
});

export const {
  setReadAlongActive,
  setReadAlongLayout,
  setReadAlongStatus,
  setReadAlongWordBoundaries,
  setReadAlongSleepTimer,
  setReadAlongMetadata,
  resetReadAlongPlayer
} = readAlongPlayerSlice.actions;

export default readAlongPlayerSlice.reducer;
